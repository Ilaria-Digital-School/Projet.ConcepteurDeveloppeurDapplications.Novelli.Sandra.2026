from flask import Flask, request, jsonify
import secrets
from flask_cors import CORS
import sqlite3

import json
from pathlib import Path

app = Flask(__name__)
CORS(app)



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
                        r.created_on as createdOn,
                        i.ingredient_name,
                        p.instruction
                        FROM recipe AS r
                        LEFT JOIN user_account AS u ON r.user_id = u.user_id
                        INNER JOIN recipe_ingredient AS ri ON r.recipe_id = ri.recipe_id
                        INNER JOIN ingredient AS i ON ri.ingredient_id = i.ingredient_id
                        INNER JOIN recipe_step AS rs ON r.recipe_id = rs.recipe_id
                        INNER JOIN preparation_step AS p ON rs.step_id = p.step_id
                        WHERE recipe_id = ?
                    ''', (id,))
        recipe = cursor.fetchall()
        connection.close()
        
        recipe_dict = [dict(row) for row in recipe]

        return jsonify(recipe_dict)
    
    except Exception as error:
        print(f'Error fetching data: {error}')
    
        
    
    
@app.route('/recipes', methods=['POST'])
def add_recipe():
    ...


    
@app.route('/recipes', methods=['PUT'])
def update_recipe():
    ...
    

    
@app.route('/recipes', methods=['DELETE'])
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
            
    # elif request.mehtod == 'GET':
    #     my_csrf = secrets.token_urlsafe(40)
    #     if 'csrf' not in session:
    #         session['csrf'] = my_csrf
    
    file_path = Path('messages.json')
    print(f'My path: {file_path}')


    if file_path.is_file():
        with open(file_path, 'a', encoding='utf-8') as json_file:
            json.dump(user_input, json_file, indent=2)
            json_file.write(',\n')
    else:
        with open(file_path, 'w', encoding='utf-8') as json_file:
            json.dump(user_input, json_file, indent=2)
            json_file.write(',\n')
    
    # if file_path.is_file():
    #     with open('messages.txt', 'a', encoding='utf-8') as txt_file:
    #         json.dump(user_input, txt_file, indent=2)
    #         txt_file.write('\n')
    # else:
    #     with open('messages.txt', 'w', encoding='utf-8') as txt_file:
    #         json.dump(user_input, txt_file, indent=2)
    #         txt_file.write('\n')
    
    
    # No return = data sent but error in the UI!
    return user_input
