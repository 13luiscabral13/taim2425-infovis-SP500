import sqlite3

html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste</title>
</head>
<body>
    """

connection = sqlite3.connect('s&p500.db')
cursor = connection.cursor()
cursor.execute('SELECT hotlink FROM company')
hotlinks = cursor.fetchall()

for hotlink in hotlinks:
    html_template += '''<img src="https://img.logo.dev/''' + hotlink[0] + '''?token=pk_MlGd8p4FQpWW8IXQCtEv6g"/>'''

html_template += """
</body>
</html>
"""
print(len(hotlinks))
with open("output.html", "w") as file:
    file.write(html_template)
