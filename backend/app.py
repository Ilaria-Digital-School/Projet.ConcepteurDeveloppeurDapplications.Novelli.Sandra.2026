from flask import Flask, request, render_template, redirect, url_for, flash
import sqlite3


app = Flask(__name__)


connection = sqlite3.connect('message.db')
cursor = connection.cursor()


cursor.execute('''
            CREATE TABLE IF NOT EXISTS message(
                id INTEGER PRIMARY KEY,
                nom VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
               '''
                )


@app.route('/contact', methods=['GET', 'POST'])
def contact():
    ...