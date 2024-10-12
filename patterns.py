import sqlite3


def connect_db():
    # Path to your database
    database_path1 = r"c:\FEUP\5ano\1semestre\TAIM\taim2425-infovis-SP500\sp500.db"
    database_path2 = r"c:\FEUP\5ano\1semestre\TAIM\taim2425-infovis-SP500\sp500_top10_holders.db"

    # Connect to the SQLite database
    conn1 = sqlite3.connect(database_path1)
    conn2 = sqlite3.connect(database_path2)

    # Create a cursor object to interact with the database
    cursor1 = conn1.cursor()
    cursor2 = conn2.cursor()

    most_lucrative_sectors(cursor1)
    print("\n-----------------------\n")
    top_institutional_holders(cursor2)
    print("\n-----------------------\n")
    conn1.close()
    conn2.close()

def execute_query(cursor, query):
    try:
        # Execute the query
        cursor.execute(query)

        # Fetch all results
        results = cursor.fetchall()

        # Print the results
        for row in results:
            print(row)

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

def most_lucrative_sectors(cursor):

    # SQL query to fetch total profits by sector
    query = '''
    SELECT sector, SUM(totalRevenue) AS total_profit
    FROM company
    GROUP BY sector
    ORDER BY total_profit DESC;
    '''
    execute_query(cursor, query)

def top_institutional_holders(cursor):

    # SQL query to assess top institutional holders influence
    query = '''
    SELECT symbol, SUM(pctg) AS owned
    FROM company
    GROUP BY SYMBOL
    ORDER BY owned DESC
    '''
    execute_query(cursor, query)

if __name__ == '__main__':
    connect_db()
    