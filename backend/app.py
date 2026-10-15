from flask import Flask, request, jsonify, session, render_template
from flask_cors import CORS
import os
from flask_wtf.csrf import CSRFProtect, generate_csrf
import sqlite3

import data

import json
from pathlib import Path

from flask import Flask


app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static",
    static_url_path="/static",
)

# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
# CSRF = CSRFProtect(app)
CORS(app)



'''For CSRF security'''
# @app.route('/')
# def index():
#     return render_template('index.html', csrf_token=generate_csrf())


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', cuisine_genres=data.CUISINE_GENRES)


@app.route('/api/recipes', methods=['GET'])
def get_all_recipes():
    try:
        connection = sqlite3.connect('cookbook.db')
        connection.execute('PRAGMA foreign_keys = ON;')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute('''SELECT 
                    r.recipe_id AS id,
                    r.recipe_name AS name,
                    r.img_url AS imgSrc,
                    (u.firstname || ' ' || u.lastname) AS author,
                    c.category_name AS type
                    FROM recipe r
                    LEFT JOIN user_account u ON u.user_id = r.user_id
                    LEFT JOIN recipe_category rc ON rc.recipe_id = r.recipe_id
                    LEFT JOIN category c ON c.category_id = rc.category_id
                    ORDER BY r.recipe_id
                    ''')
        recipes = cursor.fetchall()
        connection.close()
        
        recipes_list = [dict(r) for r in recipes]

        return jsonify(recipes_list)
    
    except Exception as error:
        return f'Error fetching data: {error}'



@app.route('/recipe/<int:id>', methods=['GET'])
def recipe():
    render_template('recipe.html')


@app.route('/api/recipe/<int:id>', methods=['GET'])
def get_one_recipe(id):
    try:
        connection = sqlite3.connect('cookbook.db')
        connection.execute('PRAGMA foreign_keys = ON;')
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        cursor.execute('''SELECT 
                    r.recipe_id AS id,
                    (u.firstname || ' ' || u.lastname) AS author,
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
    
        
    
@app.route('/add-recipe', methods=['GET', 'POST'])
def add_recipe():
    return render_template('add-recipe.html')


    
@app.route('/add-recipe/<int:id>', methods=['GET', 'PUT'])
def update_recipe():
    return render_template('add-recipe.html')
    

    
@app.route('/recipes/<int:id>', methods=['GET', 'DELETE'])
def delete_recipe(id):
    connection = sqlite3.connect('cookbook.db')
    cursor = connection.cursor()
    cursor.execute('DELETE FROM recipe WHERE recipe_id = ?', (id,))
    connection.commit()
    connection.close()
    


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


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    return render_template('contact.html')


@app.route('/api/contact', methods=['GET', 'POST'])
def submit_contact():
    
    try:
        user_input = {}
        if request.method == 'POST':
            data = request.get_json()
            
            user_input = {
                'name': data['username'].strip(),
                'email': data['email'].strip(),
                'subject': data['subject'].strip(),
                'message': data['msg'].strip(),
            }
            
            
        # Insert message into DB:
        try:
            connection = sqlite3.connect('messages.db')
            cursor = connection.cursor()
            cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
            connection.commit()
            connection.close()
            print('Data inserted successfully')
        except Exception as error:
            return f'Error inserting data: {error}'
            
        try:
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
        except Exception as error:
            return f'File error: {error}'   
    
    except Exception as error:
        return f'Failed to get data. Error: {error}'   
    

    '''No return => data sent but error in the UI!'''
    return user_input



@app.route('/favourites', methods=['GET', 'POST'])
def favourites():
    return render_template('favourites.html', cuisine_genres=data.CUISINE_GENRES)



@app.route('/log-in', methods=['GET', 'POST'])
def log_in():
    return render_template('log-in.html')



@app.route('/sign-up', methods=['GET', 'POST'])
def sign_up():
    return render_template('sign-up.html', countries=data.COUNTRIES)


