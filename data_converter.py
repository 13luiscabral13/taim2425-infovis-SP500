import csv
import sqlite3
import pandas as pd

# Convert CSV to SQLite
def csv_to_sqlite(csv_file, sqlite_file, table_name):
    conn = sqlite3.connect(sqlite_file)
    cursor = conn.cursor()

    with open(csv_file, 'r') as f:
        reader = csv.reader(f)
        columns = next(reader)
        query = 'CREATE TABLE IF NOT EXISTS {} ({})'.format(table_name, ', '.join(columns))
        cursor.execute(query)

        query = 'INSERT INTO {} VALUES ({})'.format(table_name, ', '.join(['?'] * len(columns)))
        cursor.executemany(query, reader)

    conn.commit()
    conn.close()


# Convert Excel to SQLite
def excel_to_sqlite(excel_file, sqlite_file, table_name):
    # The second row of the Excel file is the column names
    df = pd.read_excel(excel_file)

    # Delete first row
    df = df.iloc[1:]
    columns = df.columns.tolist()

    conn = sqlite3.connect(sqlite_file)
    cursor = conn.cursor()

    query = 'CREATE TABLE IF NOT EXISTS {} ({})'.format(table_name, ', '.join(columns))
    cursor.execute(query)

    query = 'INSERT INTO {} VALUES ({})'.format(table_name, ', '.join(['?'] * len(columns)))
    cursor.executemany(query, df.values.tolist())
    
    conn.commit()
    conn.close()



if __name__ == '__main__':
    excel_to_sqlite('s&p500.xlsx', 's&p500.db', 'company')