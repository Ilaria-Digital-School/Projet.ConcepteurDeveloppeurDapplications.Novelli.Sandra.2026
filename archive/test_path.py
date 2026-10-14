import json
from pathlib import Path

path = Path('c:/Users/sandr/ILARIA/PROJET-SNR/backend')
print(f'My path: {path}')

message_contents = json.dumps()

with open('message.txt', path, 'w', encoding='utf-8') as f:
    f.write(message_contents)