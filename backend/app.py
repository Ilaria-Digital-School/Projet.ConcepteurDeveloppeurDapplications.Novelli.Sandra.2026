from flask import Flask, request
from flask_cors import CORS
import sqlite3



app = Flask(__name__)
CORS(app)

connection = sqlite3.connect('message.db')
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
    
    if request == 'POST':
        user_input = {
            'name': request.form['username'],
            'email': request.form['email'],
            'subject': request.form['subject'],
            'message': request.form['message'],
        }
        
        print(user_input)
        
        if not user_input:
            return 'Failed to get data'
            
        # Insert message:
        connection = sqlite3.connect('contact.db')
        cursor = connection.cursor()
        cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
        connection.commit()
        connection.close()
        
    return user_input