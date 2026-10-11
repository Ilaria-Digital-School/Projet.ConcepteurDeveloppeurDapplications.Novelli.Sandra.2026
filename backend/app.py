from flask import Flask, request
from flask_cors import CORS
import sqlite3

import json
from pathlib import Path

app = Flask(__name__)
CORS(app)



@app.route('/', methods=['GET', 'POST'])
def recipes():
    pass





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


@app.route('/contact', methods=['POST', 'GET'])
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
            
        # Insert message:
        try:
            connection = sqlite3.connect('messages.db')
            cursor = connection.cursor()
            cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
            connection.commit()
            connection.close()
            print("✓ Data inserted successfully")
        except Exception as error:
            print(f"✗ Error inserting data: {error}")
            
    
    file_path = Path('c:/Users/sandr/ILARIA/PROJET-SNR/backend/messages.json')
    print(f'My path: {file_path}')

    if file_path.is_file():
        with open('messages.json', 'a', encoding='utf-8') as json_file:
            json.dump(user_input, json_file, indent=2)
            json_file.write(',\n')
    else:
        with open('messages.json', 'w', encoding='utf-8') as json_file:
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

