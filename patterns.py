import sqlite3
import numpy as np
from scipy.stats import pearsonr


def connect_db():
    # Path to your database
    database_path1 = r"sp500.db"
    database_path2 = r"sp500_top10_holders.db"

    # Connect to the SQLite database
    conn1 = sqlite3.connect(database_path1)
    conn2 = sqlite3.connect(database_path2)

    # Create a cursor object to interact with the database
    cursor1 = conn1.cursor()
    cursor2 = conn2.cursor()

    conn1.execute("ATTACH DATABASE ? AS db2", (database_path2,))

    # Create a view that joins the tables on 'isin'
    create_view_query = """
    CREATE TEMPORARY TABLE IF NOT EXISTS joined_sp500 AS
    SELECT *
    FROM main.company AS sp500
    JOIN db2.company AS holders
    ON sp500.isin = holders.isin;
    """
    
    # Execute the query to create the view
    conn1.execute(create_view_query)
    
    # Create a cursor for working with the joined view
    cursor = conn1.cursor()

    # in what concerns to wealth distribution, should we measure it by marketCap or by shares' value (investment made) held by holders
    # can be important to make the comparison between these two, to see which holder invested their money better 
    # (e.g, holder A invested 10 in a company that's worth 20, holder B invested 15 in the same company, the holder A wins)
    #get_all_sectors(cursor)
    #ownership_concentration(cursor2)
    #print("\n-----------------------\n")
    #ownership_concentration_by_sector(cursor, "Technology")
    #print("\n-----------------------\n")
    #ownership_concentration_by_state(cursor, "CA")
    #print("\n-----------------------\n")
    get_all_shareholders(cursor)
    conn1.close()
    conn2.close()

def execute_query(cursor, query, params=()):
    try:
        # Execute the query
        cursor.execute(query, params)

        # Fetch all results
        results = cursor.fetchall()

        return results

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

def ownership_concentration(cursor2):

    query_total_shares_value = '''
    SELECT SUM(value) as total_shares_value
    FROM company
    '''

    results_total_shares_value = execute_query(cursor2, query_total_shares_value)
    print("Total shares value: ", results_total_shares_value[0][0])

    top_holder_names = []

    # SQL query to calculate top holders
    query_top_holders = '''
    SELECT name, SUM (value) AS shares_value_by_holder
    FROM company
    GROUP BY name
    ORDER BY shares_value_by_holder DESC
    '''
    results_top_holders = execute_query(cursor2, query_top_holders)
    
    print("\nTop 10 holders by shares value\n")
    for row_number in range(0,10):
        top_holder_names.append(results_top_holders[row_number][0])
        print(f"{results_top_holders[row_number][0]}: ${int(results_top_holders[row_number][1]):,.2f}")

    print("\nTop 10 holders by shares value in relation to the total shares value invested(%)\n")
    for row_number in range(0,10):
        print(f"{results_top_holders[row_number][0]}: %{(int(results_top_holders[row_number][1]) / results_total_shares_value[0][0]) * 100:,.2f}")


def ownership_concentration_by_sector(cursor, sector_name):
    query_total_shares_value_by_sector = '''
    SELECT SUM(value)
    FROM joined_sp500
    WHERE sector = ?
    '''

    results_total_shares_value_by_sector = execute_query(cursor, query_total_shares_value_by_sector, (sector_name,))
    print("Total shares value in the", sector_name, " sector: ", results_total_shares_value_by_sector[0][0])

    top_holder_names_by_sector = []

    query_top_holders_by_sector = '''
    SELECT name, SUM(value) AS shares_value_by_holder_by_sector
    FROM joined_sp500
    WHERE sector = ?
    GROUP BY name
    ORDER BY shares_value_by_holder_by_sector DESC
    '''

    results_top_holders_by_sector = execute_query(cursor, query_top_holders_by_sector, (sector_name,))

    print("\nTop 10 holders by shares value in the", sector_name, " sector\n")
    for row_number in range(0,10):
        top_holder_names_by_sector.append(results_top_holders_by_sector[row_number][0])
        print(f"{results_top_holders_by_sector[row_number][0]}: ${int(results_top_holders_by_sector[row_number][1]):,.2f}")

    print("\nTop 10 holders by shares value in the", sector_name, " sector in relation to the total shares value invested(%)\n")
    for row_number in range(0,10):
        print(f"{results_top_holders_by_sector[row_number][0]}: %{(int(results_top_holders_by_sector[row_number][1]) / results_total_shares_value_by_sector[0][0]) * 100:,.2f}")

def ownership_concentration_by_state(cursor, state_name):
    query_total_shares_value_by_state = '''
    SELECT SUM(value)
    FROM joined_sp500
    WHERE state = ?
    '''

    results_total_shares_value_by_state = execute_query(cursor, query_total_shares_value_by_state, (state_name,))
    print("Total shares value in ", state_name, ":", results_total_shares_value_by_state[0][0])

    top_holder_names_by_state = []

    query_top_holders_by_state = '''
    SELECT name, SUM(value) AS shares_value_by_holder_by_state
    FROM joined_sp500
    WHERE state = ?
    GROUP BY name
    ORDER BY shares_value_by_holder_by_state DESC
    '''

    results_top_holders_by_state = execute_query(cursor, query_top_holders_by_state, (state_name,))

    print("\nTop 10 holders by shares value in ", state_name, "\n")
    for row_number in range(0,10):
        top_holder_names_by_state.append(results_top_holders_by_state[row_number][0])
        print(f"{results_top_holders_by_state[row_number][0]}: ${int(results_top_holders_by_state[row_number][1]):,.2f}")

    print("\nTop 10 holders by shares value in ", state_name, " in relation to the total shares value invested(%)\n")
    for row_number in range(0,10):
        print(f"{results_top_holders_by_state[row_number][0]}: %{(int(results_top_holders_by_state[row_number][1]) / results_total_shares_value_by_state[0][0]) * 100:,.2f}")

def get_all_sectors(cursor):
    query_get_sectors = '''
    SELECT DISTINCT sector
    FROM joined_sp500
    WHERE sector IS NOT NULL
    ORDER BY sector;
    '''
    
    results = execute_query(cursor, query_get_sectors)
    
    # Extract sector names into a list
    sector_list = [row[0] for row in results]
    print(sector_list)
    return sector_list

def get_all_shareholders(cursor):
    query_get_shareholders = '''
    SELECT DISTINCT name
    FROM joined_sp500
    WHERE name IS NOT NULL
    ORDER BY name;
    '''
    
    results = execute_query(cursor, query_get_shareholders)
    
    # Extract shareholder names into a list
    shareholder_list = [row[0] for row in results]
    print("\nList of all shareholders:")
    for shareholder in shareholder_list:
        print(shareholder)
    
    print(len(shareholder_list))
    return shareholder_list


if __name__ == '__main__':
    connect_db()
