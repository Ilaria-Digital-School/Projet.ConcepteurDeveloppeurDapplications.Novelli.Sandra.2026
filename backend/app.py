from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
import sqlite3

import data
import os

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

# app.config["SECRET_KEY"] = os.environ["FLASK_SECRET_KEY"]

limiter = Limiter(get_remote_address, app=app)

CORS(app)



@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', recipe_categories=data.RECIPE_CATEGORIES)


@app.route('/api/recipes', methods=['GET'])
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
                    FROM recipe AS r
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
        return jsonify(f'Error fetching data: {error}')



@app.route('/recipe/<int:id>', methods=['GET'])
def recipe(id):
    return render_template('recipe.html')


@app.route('/api/recipe/<int:id>', methods=['GET'])
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
                    SELECT rs.step_number AS step_number, p.instruction
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
        return jsonify(f'Error fetching data: {error}')
   
   

@app.route('/favourites', methods=['GET'])
def favourites():
    return render_template('favourites.html', recipe_categories=data.RECIPE_CATEGORIES)
    

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
        return jsonify(f'Error fetching data: {error}')

    
@app.route('/add-recipe', methods=['GET'])
def add_recipe():
    return render_template('add-recipe.html', recipe_categories=data.RECIPE_CATEGORIES)


@app.route('/add-recipe', methods=['GET', 'POST'])
def submit_recipe():

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

    recipe_name = clean('recipe-name', 3)
    img_url = clean('imgSrc', 5)
    author = clean('author', 5)
    categories = data.get('categories')
    prep_time = check_if_number('preparation-time', float)
    cook_time = check_if_number('cook-time', float)
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
    ingredient_list = []

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
        elif not quantity is None:
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

        ingredient_list.append(
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

            for ingredient_name, quantity, unit in ingredient_list:

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
            recipe['ingredients'] = [{'ingredientName': ingredient_name, 'quantity': quantity, 'unit': unit} for ingredient_name, quantity, unit in ingredient_list]
            recipe['steps'] = steps

            return jsonify(recipe)

    except Exception as error:
        return jsonify(error=f'Failed to add recipe: {error}'), 500
    

    
@app.route('/add-recipe/<int:id>', methods=['GET', 'PUT'])
def update_recipe():
    ...
    


@app.route('/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    
    try:
        with sqlite3.connect('cookbook.db') as connection:
            connection.execute('DELETE FROM recipe WHERE recipe_id = ?', (id,))

    except Exception as error:
        return jsonify(f'Failed to delete recipe: {error}')
    


# Initialize message database.
connection = sqlite3.connect('messages.db')
cursor = connection.cursor()

cursor.execute('''
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

connection.commit()
connection.close()


@app.route('/contact', methods=['GET'])
def contact():
    return render_template('contact.html')


@app.route('/api/contact', methods=['POST'])
@limiter.limit('5 per minute; 30 per day')
def send_message():
    
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

    name = clean('name', 3, 100)
    email = clean('email', 5, 255)
    subject = clean('subject', 2, 150)
    message = clean('message', 20, 600)

    if None in (name, email, subject, message):
        return jsonify(error='Invalid input'), 400

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
    except Exception as error:
        print(error)
        return jsonify(error=f'Could not save to file: {error}'), 500

    return jsonify(user_input), 201


@app.route('/log-in', methods=['GET'])
def log_in():
    return render_template('log-in.html')


@app.route('/api/log-in', methods=['POST'])
@limiter.limit('4 per 10 minutes')
def login():
    data = request.get_json(silent=True)
    
    if not data:
        return jsonify({'error': 'Invalid request'}), 400
    
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
                session['user_id'] = row['id']
                return jsonify({'id': row['id'], 'firstname': row['firstname'], 'role': row['role']}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401

    except Exception as error:
        return jsonify(error=f'Server error: {error}'), 500



@app.route('/api/log-out', methods=['POST'])
def logout():
    
    session.clear()
    
    return jsonify({'Message': 'Logged out successfully'}), 200


@app.route('/api/check-session', methods=['GET'])
def check_session():

    if 'user_id' not in session:
        return jsonify({'logged_in': False}), 401

    return jsonify({'logged_in': True, 'user_id': session['user_id']}), 200




@app.route('/sign-up', methods=['GET'])
def sign_up():
    return render_template('sign-up.html', interests=data.INTERESTS, countries=data.COUNTRIES)


@app.route('/api/sign-up', methods=['POST'])
def subscribe():
    
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
        return jsonify(error=f'Subscription failed {error}'), 500