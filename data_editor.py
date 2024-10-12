import sqlite3
import re

def add_hotlink(sqlite_file, table_name, column_name):
    conn = sqlite3.connect(sqlite_file)
    cursor = conn.cursor()

    # Retrieve original link from website column
    cursor.execute(f"SELECT website FROM {table_name}")
    websites = cursor.fetchall()

    # Insert hotlink into the column
    for website in websites:
        # Reverse the string
        hotlink = re.search(r'(?<=\/\/)(www\.)?([^\/]+)', website[0]).group(2)
        cursor.execute(f"UPDATE {table_name} SET {column_name} = ? WHERE website = ?", (hotlink, website[0]))
    
    conn.commit()
    conn.close()
    print(f"Hotlinks have been added to the {column_name} column in the {table_name} table in {sqlite_file}.")

def add_shares_integer(sqlite_file, table_name, column_name):
    return

if __name__ == '__main__':
    add_hotlink('sp500.db', 'company', 'hotlink')
    add_shares_integer('sp500.db', 'company', 'hotlink')
