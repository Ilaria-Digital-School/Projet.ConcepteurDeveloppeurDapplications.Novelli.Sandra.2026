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
        return jsonify({'error': f'Error fetching data: {error}'})




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
        return f'Error fetching data: {error}'
    
        
    
@app.route('/recipes', methods=['POST'])
def add_recipe():
    ...


    
@app.route('/recipes/<int:id>', methods=['PUT'])
def update_recipe():
    ...
    

    
@app.route('/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    connection = sqlite3.connect('cookbook.db')
    cursor = connection.cursor()
    cursor.execute('DELETE FROM recipe WHERE recipe_id = ?', (id,))
    connection.commit()
    connection.close()
    


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



# @app.route('/contact', methods=['POST'])
# def contact():
    
#     user_input = {}
#     if request.method == 'POST':
#         data = request.get_json()
        
#         user_input = {
#             'name': data['username'].strip(),
#             'email': data['email'].strip(),
#             'subject': data['subject'].strip(),
#             'message': data['msg'].strip(),
#         }
        
#         if not user_input:
#             return 'Failed to get data'
            
#         # Insert message into DB:
#         try:
#             connection = sqlite3.connect('messages.db')
#             cursor = connection.cursor()
#             cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
#             connection.commit()
#             connection.close()
#             print('Data inserted successfully')
#         except Exception as error:
#             return f'Error inserting data: {error}'
            
#     try:
#         file_path = Path('messages.json')
#         print(f'My path: {file_path}')
        
#         if file_path.is_file():
#             with open('messages.json', 'r', encoding='utf-8') as json_file:
#                 content = json.load(json_file)
#             content.append(user_input)
#             with open('messages.json', 'w', encoding='utf-8') as json_file:    
#                 json.dump(content, json_file, indent=2)
#         else:
#             with open('messages.json', 'w', encoding='utf-8') as json_file:
#                 json.dump([user_input], json_file, indent=2)
#     except Exception as error:
#         return f'File error: {error}'   

#     '''No return => data sent but error in the UI!'''
#     return user_input



@app.route('/contact', methods=['POST'])
@limiter.limit('5 per minute; 30 per day')
def contact():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Invalid JSON'), 400

    def sanitize(field, min_len, max_len):
        value = data.get(field)
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not (min_len <= len(value) <= max_len):
            return None
        return value

    name = sanitize('username', 3, 100)
    email = sanitize('email', 5, 255)
    subject = sanitize('subject', 2, 150)
    message = sanitize('msg', 20, 600)

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
        return jsonify(error='Could not save message'), 500

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
        return jsonify(error='Could not save to file'), 500

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
        return jsonify({'error': 'Server error'}), 500

        

@app.route('/sign-up', methods=['POST'])
def sign_up():
    
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error='Invalid JSON'), 400

    def sanitize(field, min_len, max_len):
        value = data.get(field)
        if not isinstance(value, str):
            return None
        value = value.strip()
        if not (min_len <= len(value) <= max_len):
            return None
        return value

    firstname = sanitize('firstname', 2, 100)
    lastname = sanitize('lastname', 3, 100)
    email = data.get('email')
    password = sanitize('password', 12, 255)
    gender = data.get('gender')
    interests = data.get('interests')
    country = data.get('country')
    

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
            
            for interest in interests:
                cursor.execute('''
                    INSERT INTO user_interests(user_id, interest_name)
                    VALUES (?, ?)
                ''', (user_id, interest))
            
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
        return jsonify(error='Subscription failed'), 500
    
    