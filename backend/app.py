from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
import os
from flask_wtf.csrf import CSRFProtect, generate_csrf
import sqlite3

import json
from pathlib import Path

app = Flask(__name__)
# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
# CSRF = CSRFProtect(app)
CORS(app)



'''For CSRF security'''
# @app.route('/')
# def index():
#     return render_template('index.html', csrf_token=generate_csrf())


@app.route('/recipes', methods=['GET'])
def get_all_recipes():
    try:
        connection = sqlite3.connect('cookbook.db')
        connection.execute('PRAGMA foreign_keys = ON;')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute('''SELECT 
                        r.recipe_id as id,
                        r.recipe_name as name,
                        r.img_url as imgSrc,
                        (u.firstname || ' ' || u.lastname) as author
                        FROM recipe AS r
                        LEFT JOIN user_account AS u ON r.user_id = u.user_id
                    ''')
        recipes = cursor.fetchall()
        connection.close()
        
        recipes_list = [dict(r) for r in recipes]

        return jsonify(recipes_list)
    
    except Exception as error:
        print(f'Error fetching data: {error}')



@app.route('/recipes/<int:id>', methods=['GET'])
def get_one_recipe(id):
    try:
        connection = sqlite3.connect('cookbook.db')
        connection.execute('PRAGMA foreign_keys = ON;')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute('''SELECT 
                    r.recipe_id as id,
                    (u.firstname || ' ' || u.lastname) as author,
                    r.recipe_name as name,
                    r.img_url as imgSrc,
                    r.prep_time as prepTime,
                    r.cook_time as cookTime,
                    r.servings,
                    r.created_on as createdOn
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
        print(f'Error fetching data: {error}')
    
        
    
@app.route('/recipes', methods=['POST'])
def add_recipe():
    ...


    
@app.route('/recipes', methods=['PUT'])
def update_recipe():
    ...
    

    
@app.route('/recipes/<int:id>', methods=['DELETE'])
def delete_recipe(id):
    connection = sqlite3.connect('cookbook.db')
    cursor = connection.cursor()
    cursor.execute('DELETE FROM recipe WHERE recipe_id = ?', (id))
    connection.commit()
    connection.close()
    


# Initilize message database.
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


@app.route('/contact', methods=['POST'])
def contact():
    
    user_input = {}
    if request.method == 'POST':
        data = request.get_json()
        
        user_input = {
            'name': data['username'],
            'email': data['email'],
            'subject': data['subject'],
            'message': data['msg'],
        }
        
        if not user_input:
            return 'Failed to get data'
            
        # Insert message into DB:
        try:
            connection = sqlite3.connect('messages.db')
            cursor = connection.cursor()
            cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
            connection.commit()
            connection.close()
            print('Data inserted successfully')
        except Exception as error:
            print(f'Error inserting data: {error}')
            
    
    file_path = Path('messages.json')
    print(f'My path: {file_path}')
    
    
    if file_path.is_file():
        with open('messages.json', 'r', encoding='utf-8') as json_file:
            content = json.load(json_file)
        content.append(user_input)
        with open('messages.json', 'w', encoding='utf-8') as json_file:    
            json.dump(content, json_file, indent=2)
    else:
        with open('messages.json', 'w', encoding='utf-8') as json_file:
            json.dump([user_input], json_file, indent=2)

            
    
    '''No return = data sent but error in the UI!'''
    return user_input
