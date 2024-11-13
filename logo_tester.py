import sqlite3

def getLogo(company):
    connection = sqlite3.connect('sp500.db')
    cursor = connection.cursor()
    cursor.execute('SELECT hotlink FROM company WHERE name = ?', (company,))
    hotlink = cursor.fetchall()
    return '''<img src="https://img.logo.dev/''' + hotlink[0] + '''?token=pk_MlGd8p4FQpWW8IXQCtEv6g"/>'''
