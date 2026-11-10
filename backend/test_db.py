import sqlite3

# connection = sqlite3.connect('message.db')
# cursor = connection.cursor()
# cursor.execute('SELECT * FROM message')
# rows = cursor.fetchall()
# connection.close()

# print(f"Total records: {len(rows)}")
# for row in rows:
#     print(row)
    

from pathlib import Path

# DB_PATH = Path(__file__).resolve().parent / 'cookbook.db'
# print('Using database:', DB_PATH)

# from werkzeug.security import generate_password_hash

# passwords = {
#     1:  'Sunshine123456/',
#     2:  'Terminator2@#*!',
#     3:  'JudasPriest1990*',
#     4:  'ThiKimNgan1980+',
#     5:  'Streetsofrage987654',
#     6:  'Chocolate333yyy',
#     7:  'Beyond1984&&Valley1984++',
#     8:  'Python[]:JS666{};',
#     9:  'Corato1929',
#     10: 'Bounty_decaf1998',
# }

# with sqlite3.connect('cookbook.db') as connection:
#     for user_id, pwd in passwords.items():
#         connection.execute(
#             'UPDATE user_account SET password_hash = ? WHERE user_id = ?',
#             (generate_password_hash(pwd), user_id)
#         )

# print('Password hashes created')