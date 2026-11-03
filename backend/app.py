from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3

import json
from pathlib import Path

from werkzeug.security import check_password_hash, generate_password_hash
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static",
    static_url_path="/static",
)

limiter = Limiter(get_remote_address, app=app)

CORS(app)
    
    
@app.route('/recipes', methods=['GET'])
def get_all_recipes():
    try:
        with sqlite3.connect('cookbook.db') as connection:
            connection.execute('PRAGMA foreign_keys = ON;')
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()
            cursor.execute('''
                SELECT
                    r.recipe_id AS id,
                    r.recipe_name AS name,
                    r.img_url AS imgSrc,
                    (u.firstname || ' ' || u.lastname) AS author,
                    json_group_array(c.category_name) AS categories
                    FROM recipe r
                    LEFT JOIN user_account u ON u.user_id = r.user_id
                    JOIN recipe_category rc ON rc.recipe_id = r.recipe_id
                    JOIN category c ON c.category_id = rc.category_id
                    GROUP BY r.recipe_id
                    ORDER BY r.recipe_id
                ''')
            recipes_list = []
            for row in cursor.fetchall():
                recipe = dict(row)
                recipe['categories'] = json.loads(recipe['categories'])
                recipes_list.append(recipe)
        
        return jsonify(recipes_list)

    except Exception as error:
        print(error)
        return jsonify(f'Error fetching data: {error}')




@app.route('/recipes/<int:id>', methods=['GET'])
def get_one_recipe(id):
    try:
        connection = sqlite3.connect('cookbook.db')
        connection.execute('PRAGMA foreign_keys = ON;')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute('''SELECT 
                    r.recipe_id AS id,
                    (u.firstname || ' ' || u.lastname) as author,
                    r.recipe_name AS name,
                    r.img_url AS imgSrc,
                    r.prep_time AS prepTime,
                    r.cook_time AS cookTime,
                    r.servings,
                    r.created_on AS createdOn
                    FROM recipe AS r
                    LEFT JOIN user_account AS u ON r.user_id = u.user_id
                    WHERE r.recipe_id = ?
                    ''', (id,))
        recipe_simple_rows = cursor.fetchone()
        
        if recipe_simple_rows is None:
            return jsonify({'error': 'Recipe not found'})
        
        cursor.execute('''
                    SELECT i.ingredient_name AS name, ri.quantity, ri.unit
                    FROM recipe_ingredient ri
                    JOIN ingredient i ON ri.ingredient_id = i.ingredient_id
                    WHERE ri.recipe_id = ?
                ''', (id,))
        ingredients = [dict(r) for r in cursor.fetchall()]

        cursor.execute('''
                    SELECT rs.step_number AS stepNumber, p.instruction
                    FROM recipe_step rs
                    JOIN preparation_step p ON rs.step_id = p.step_id
                    WHERE rs.recipe_id = ?
                    ORDER BY rs.step_number
                ''', (id,))
        steps = [dict(r) for r in cursor.fetchall()]
        recipe = dict(recipe_simple_rows)
        recipe['ingredients'] = ingredients
        recipe['steps'] = steps
        connection.close()
        
        return jsonify(recipe)
        
    except Exception as error:
        print(error)
        return jsonify(f'Error fetching data: {error}')
    
    
@app.route('/favourites/<int:id>', methods=['GET'])
def display_favourites(user_id):

    try:
        with sqlite3.connect('cookbook') as connection:
            connection.execute('PRAGMA foreign_keys = ON;')
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()

            cursor.execute('''
                SELECT
                    r.recipe_id AS id,
                    r.recipe_name AS name,
                    r.img_url AS imgSrc,
                    (u.firstname || ' ' || u.lastname) AS author,
                    json_group_array(c.category_name) AS categories
                    FROM recipe AS r
                    JOIN user_favourite uf
                    ON uf.recipe_id = r.recipe_id
                    LEFT JOIN user_account u
                    ON u.user_id = r.user_id
                    JOIN recipe_category rc
                    ON rc.recipe_id = r.recipe_id
                    JOIN category AS c
                    ON c.category_id = rc.category_id
                    WHERE uf.user_id = ?
                    GROUP BY r.recipe_id
                    ORDER BY uf.favourited_on DESC
            ''', (session['user_id'],))

            recipes_list = []

            for row in cursor.fetchall():
                recipe = dict(row)
                recipe['categories'] = json.loads(recipe['categories'])
                recipes_list.append(recipe)
                
            return jsonify(recipes_list)
        
    except Exception as error:
        print(error)
        return jsonify(f'Error fetching data: {error}')

                    
    

@app.route('/add-recipe', methods=['POST'])
def add_recipe():

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Invalid JSON'), 400

    def clean(field, min_length):
        value = data.get(field)
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not (min_length <= len(value)):
            return None
        return value

    def check_if_number(field, num_type, minimum=0):
        value_str = data.get(field)
        try:
            value = num_type(value_str)
            if value >= minimum:
                return value
        except (TypeError, ValueError):
            return None

    recipe_name = clean('recipeName', 3)
    img_url = clean('imgSrc', 5)
    author = clean('author', 5)
    categories = data.get('categories')
    prep_time = check_if_number('prepTime', float)
    cook_time = check_if_number('cookTime', float)
    servings = check_if_number('servings', int, 1)
    ingredients = data.get('ingredients')
    steps = data.get('steps')

    if (
        None in (recipe_name, img_url, author, prep_time,cook_time, servings)
        or not isinstance(categories, list)
        or not categories
        or not isinstance(ingredients, list)
        or not ingredients
        or not isinstance(steps, list)
        or not steps
    ):
        return jsonify(error='Invalid input'), 400

    # Validate ingredients
    clean_ingredients = []

    for ingredient in ingredients:
        if not isinstance(ingredient, dict):
            return jsonify(error='Invalid ingredient'), 400

        ingredient_name = ingredient.get('ingredientName')

        if not isinstance(ingredient_name, str):
            return jsonify(error='Invalid ingredient name'), 400

        ingredient_name = ingredient_name.strip()

        if len(ingredient_name) < 1:
            return jsonify(error='Invalid ingredient name'), 400

        quantity = ingredient.get('quantity')
        unit = ingredient.get('unit')

        if quantity == '':
            quantity = None
        elif quantity is not None:
            try:
                quantity = float(quantity)
                if quantity < 0:
                    return jsonify(error='Invalid quantity'), 400
            except (TypeError, ValueError):
                return jsonify(error='Invalid quantity'), 400

        if unit == '':
            unit = None
        elif unit is not None:
            if not isinstance(unit, str):
                return jsonify(error='Invalid unit'), 400
            unit = unit.strip() or None

        clean_ingredients.append(
            (ingredient_name, quantity, unit)
        )

    try:
        with sqlite3.connect('cookbook.db') as connection:
            connection.row_factory = sqlite3.Row
            connection.execute('PRAGMA foreign_keys = ON;')
            cursor = connection.cursor()

            cursor.execute('''
                INSERT INTO recipe(
                    recipe_name,
                    image_url,
                    author,
                    prep_time,
                    cook_time,
                    servings
                )
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                recipe_name,
                img_url,
                author,
                prep_time,
                cook_time,
                servings
            ))

            recipe_id = cursor.lastrowid

            for c in categories:
                cursor.execute('''
                    INSERT INTO recipe_category(recipe_id, category_name)
                    VALUES (?, ?)
                ''', (recipe_id, c))

            for ingredient_name, quantity, unit in clean_ingredients:

                ingredient_row = cursor.execute('''
                    SELECT ingredient_id
                    FROM ingredient
                    WHERE ingredient_name = ?
                ''', (ingredient_name,)).fetchone()

                if ingredient_row is None:
                    return jsonify(
                        error=f'Unknown ingredient: {ingredient_name}'
                    ), 400

                ingredient_id = ingredient_row['ingredient_id']

                cursor.execute('''
                    INSERT INTO recipe_ingredient(
                        recipe_id,
                        ingredient_id,
                        quantity,
                        unit
                    )
                    VALUES (?, ?, ?, ?)
                ''', (
                    recipe_id,
                    ingredient_id,
                    quantity,
                    unit
                ))

            for s in steps:
                cursor.execute('''
                    INSERT INTO recipe_step(recipe_id, instruction)
                    VALUES (?, ?)
                ''', (recipe_id, s))

            cursor.execute('''
                SELECT * FROM recipe WHERE recipe_id = ?
            ''', (recipe_id,))

            recipe_simple_rows = cursor.fetchone()

            connection.commit()

            recipe = dict(recipe_simple_rows)
            recipe['categories'] = categories
            recipe['ingredients'] = [
                {
                    'ingredientName': ingredient_name,
                    'quantity': quantity,
                    'unit': unit
                }
                for ingredient_name, quantity, unit in clean_ingredients
            ]
            recipe['steps'] = steps

            return jsonify(recipe)

    except Exception as error:
        print(error)
        return jsonify(error=f'Failed to add recipe: {error}'), 500



    
@app.route('/recipes/<int:id>', methods=['PUT'])
def update_recipe():
    ...
    

    
@app.route('/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    
    try:
        with sqlite3.connect('cookbook.db') as connection:
            connection.execute('DELETE FROM recipe WHERE recipe_id = ?', (id,))

    except Exception as error:
        print(error)
        return jsonify(f'Failed to delete recipe: {error}')
    


# Initialize message database.
with sqlite3.connect('messages.db') as connection:
    connection.execute('''
                CREATE TABLE IF NOT EXISTS message(
                    id INTEGER PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    subject VARCHAR(100) NOT NULL,
                    message TEXT NOT NULL,
                    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                '''
                    )



@app.route('/contact', methods=['POST'])
@limiter.limit('5 per minute; 30 per day')
def contact():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Invalid JSON'), 400

    def clean(field, min_len, max_len):
        value = data.get(field)
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not (min_len <= len(value) <= max_len):
            return None
        return value

    name = clean('username', 3, 100)
    email = clean('email', 5, 255)
    subject = clean('subject', 2, 150)
    message = clean('msg', 20, 600)

    if None in (name, email, subject, message):
        print(error)
        return jsonify(error=f'Invalid input: {error}'), 400

    user_input = {
        'name': name,
        'email': email,
        'subject': subject,
        'message': message,
    }

    # Save to database
    try:
        with sqlite3.connect('messages.db') as connection:
            connection.execute(
                'INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)',
                (name, email, subject, message),
            )
    except Exception as error:
        print(error)
        return jsonify(error=f'Could not save message: {error}'), 500

    # Save to JSON file
    try:
        file_path = Path('messages.json')
        
        if file_path.is_file():
            with open('messages.json', 'r', encoding='utf-8') as json_file:
                content = json.load(json_file)
        else:
            content = []
        
        content.append(user_input)
        
        with open('messages.json', 'w', encoding='utf-8') as json_file:
            json.dump(content, json_file, indent=2)
    except Exception:
        print(error)
        return jsonify(error=f'Could not save to file: {error}'), 500

    return jsonify(user_input), 201

    

@app.route('/login', methods=['POST'])
@limiter.limit('5 per 15 minutes')
def login():
    data = request.get_json()
    email = data.get('email')
    pwd = data.get('pwd')

    if not email or not pwd:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        with sqlite3.connect('cookbook.db') as connection:
            connection.row_factory = sqlite3.Row
            cursor = connection.cursor()
            cursor.execute('''
                SELECT user_id AS id, firstname, email, password, role
                FROM user_account
                WHERE email = ?
            ''', (email,))
            row = cursor.fetchone()

            if row and check_password_hash(row['password'], pwd):
                return jsonify({'id': row['id'], 'firstname': row['firstname'], 'role': row['role']}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as error:
        print(error)
        return jsonify(error=f'Server error: {error}'), 500

        

@app.route('/sign-up', methods=['POST'])
def sign_up():
    
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Invalid JSON'), 400

    def clean(field, min_len, max_len):
        value = data.get(field)
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not (min_len <= len(value) <= max_len):
            return None
        return value

    firstname = clean('firstname', 2, 100)
    lastname = clean('lastname', 3, 100)
    email = clean('email', 5, 255)
    password = clean('password', 12, 255)
    gender = clean('gender', 0, 20)
    interests = clean('interests', 0, 20)
    country = clean('country', 0, 55)
    

    if None in (firstname, lastname, email, password, gender, interests, country):
        return jsonify(error='Invalid input'), 400
    
    try:
        hashed_password = generate_password_hash(password)
        
        with sqlite3.connect('messages.db') as connection:
            connection.row_factory = sqlite3.Row
            connection.execute('PRAGMA foreign_keys = ON;')
            cursor = connection.cursor()
            cursor.execute('''
                INSERT INTO user_account(
                    firstname,
                    lastname, 
                    email,
                    password,
                    gender,
                    country)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ''',
                    (firstname,
                    lastname,
                    hashed_password,
                    password,
                    gender,
                    country),)
            
            user_id = cursor.lastrowid
            
            for i in interests:
                cursor.execute('''
                    INSERT INTO user_interests(user_id, interest_name)
                    VALUES (?, ?)
                ''', (user_id, i))
            
            cursor.execute('SELECT * FROM user_account WHERE id = ?',
                           (user_id,))
            user_simple_rows = cursor.fetchone()

            cursor.execute('''
                    SELECT interest_name FROM user_interests
                    WHERE user_id = ?''',
                    (user_id,))
            interests_rows = cursor.fetchall()

            connection.commit()

            user_account = dict(user_simple_rows)
            user_account['interests'] = [row['interest_name'] for row in interests_rows]

            return jsonify(user_account)

    except Exception as error:
        print(error)
        return jsonify(error=f'Subscription failed {error}'), 500
    
    