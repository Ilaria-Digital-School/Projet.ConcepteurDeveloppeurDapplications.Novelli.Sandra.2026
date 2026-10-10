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
    
    if request.method == 'POST':
        
        data = request.get_json()
        
        user_input = {
            'name': data['username'],
            'email': data['email'],
            'subject': data['subject'],
            'message': data['msg'],
        }
        
        print(user_input)
        
        if not user_input:
            return 'Failed to get data'
            
        # Insert message:
        try:
            connection = sqlite3.connect('message.db')
            cursor = connection.cursor()
            cursor.execute('INSERT INTO message(name, email, subject, message) VALUES (?, ?, ?, ?)', (user_input['name'], user_input['email'], user_input['subject'], user_input['message']))
            connection.commit()
            connection.close()
            print("✓ Data inserted successfully")
        except Exception as error:
            print(f"✗ Error inserting data: {error}")
            
    # No return = data sent but error in the UI!    
    return user_input

