import sqlite3
import json
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

    # Create a temporary table that joins the tables on 'isin'
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



    shareholder_list = get_all_shareholders(cursor)
    sector_list = get_all_sectors(cursor)
    state_list = get_all_states(cursor)

    ownership_concentration(cursor2)#- done
    ownership_concentration_by_sector(cursor, sector_list)#- done
    ownership_concentration_by_state(cursor, state_list)#- done
    shareholder_per_sector(cursor, shareholder_list)#- done
    shareholder_per_company(cursor, shareholder_list)#- done
    #shareholder_per_sector_per_company(cursor, shareholder_list, sector_list,)#- done 

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
    WHERE class = "Top Institutional Holders"
    '''

    results_total_shares_value = execute_query(cursor2, query_total_shares_value)

    # SQL query to calculate top holders
    query_top_holders = '''
    SELECT name, SUM (value) AS shares_value_by_holder
    FROM company
    WHERE class = "Top Institutional Holders"
    GROUP BY name
    ORDER BY shares_value_by_holder DESC
    '''
    results_top_holders = execute_query(cursor2, query_top_holders)
    
    # Create JSON-compatible dictionary with formatted values
    ownership_data = {
        "total_shares_value": f"${results_total_shares_value[0][0]:,.2f}",
        "top_holders": []
    }

    # Populate the dictionary with holder names and share values formatted as strings
    for row in results_top_holders:
        holder_data = {
            "name": row[0],
            "value": f"${row[1]:,.2f}"  # format as a string with $ and commas
        }
        ownership_data["top_holders"].append(holder_data)

    # Write the dictionary to a JSON file
    with open('ownership_concentration.json', 'w') as json_file:
        json.dump(ownership_data, json_file, indent=4)

    print("\nJSON data has been saved to ownership_data.json")
    

def ownership_concentration_by_sector(cursor, sector_list):
    sector_data = []

    for sector in sector_list:
        query_total_shares_value_by_sector = '''
        SELECT SUM(value)
        FROM joined_sp500
        WHERE sector = ? AND class = "Top Institutional Holders"
        '''

        results_total_shares_value_by_sector = execute_query(cursor, query_total_shares_value_by_sector, (sector,))

        query_top_holders_by_sector = '''
        SELECT name, SUM(value) AS shares_value_by_holder_by_sector
        FROM joined_sp500
        WHERE sector = ? AND class = "Top Institutional Holders"
        GROUP BY name
        ORDER BY shares_value_by_holder_by_sector DESC
        '''

        results_top_holders_by_sector = execute_query(cursor, query_top_holders_by_sector, (sector,))
        
        # Store sector data in JSON-compatible format
        sector_info = {
            "sector": sector,
            "total_shares_value": f"${results_total_shares_value_by_sector[0][0]:,.2f}",
            "top_holders": []
        }

        # Populate top holders data with formatted values
        for row in results_top_holders_by_sector:
            holder_data = {
                "name": row[0],
                "value": f"${row[1]:,.2f}"
            }
            sector_info["top_holders"].append(holder_data)

        # Append the sector information to the main list
        sector_data.append(sector_info)

    # Write the structured data to a JSON file
    with open('ownership_concentration_by_sector.json', 'w') as json_file:
        json.dump(sector_data, json_file, indent=4)

    print("\nJSON data has been saved to ownership_concentration_by_sector.json")


def ownership_concentration_by_state(cursor, state_list):
    state_data = []

    for state in state_list:
        query_total_shares_value_by_state = '''
        SELECT SUM(value)
        FROM joined_sp500
        WHERE state = ? AND class = "Top Institutional Holders"
        '''

        results_total_shares_value_by_state = execute_query(cursor, query_total_shares_value_by_state, (state,))

        query_top_holders_by_state = '''
        SELECT name, SUM(value) AS shares_value_by_holder_by_state
        FROM joined_sp500
        WHERE state = ? AND class = "Top Institutional Holders"
        GROUP BY name
        ORDER BY shares_value_by_holder_by_state DESC
        '''

        results_top_holders_by_state = execute_query(cursor, query_top_holders_by_state, (state,))
        
        # Store sector data in JSON-compatible format
        sector_info = {
            "state": state,
            "total_shares_value": f"${results_total_shares_value_by_state[0][0]:,.2f}",
            "top_holders": []
        }

        # Populate top holders data with formatted values
        for row in results_top_holders_by_state:
            holder_data = {
                "name": row[0],
                "value": f"${row[1]:,.2f}"
            }
            sector_info["top_holders"].append(holder_data)

        # Append the sector information to the main list
        state_data.append(sector_info)

    # Write the structured data to a JSON file
    with open('ownership_concentration_by_state.json', 'w') as json_file:
        json.dump(state_data, json_file, indent=4)

    print("\nJSON data has been saved to ownership_concentration_by_sector.json")


def shareholder_per_sector(cursor, shareholder_list):
    shareholders_per_sector_data = {}

    for shareholder in shareholder_list:
        query_shareholder_per_sector = '''
        SELECT name, sector, SUM(value) AS shareholder_per_sector_value
        FROM joined_sp500
        WHERE name = ? AND class = "Top Institutional Holders"
        GROUP BY name, sector 
        ORDER BY shareholder_per_sector_value
        '''
        results_shareholder_per_sector = execute_query(cursor, query_shareholder_per_sector, (shareholder,))

        # Convert results to list of tuples for each shareholder
        sector_values = [(row[1], row[2]) for row in results_shareholder_per_sector]
        
        # Add data to the main dictionary
        shareholders_per_sector_data[shareholder] = sector_values

    # Write the dictionary to a JSON file
    with open('shareholder_per_sector.json', 'w') as json_file:
        json.dump(shareholders_per_sector_data, json_file, indent=4)

    print("\nJSON data has been saved to shareholder_per_sector.json")

def shareholder_per_company(cursor, shareholder_list):
    shareholders_per_company_data = {}

    for shareholder in shareholder_list:
        query_shareholder_per_company = '''
        SELECT name, isin, SUM(value) AS shareholder_per_sector_value
        FROM joined_sp500
        WHERE name = ? AND class = "Top Institutional Holders"
        GROUP BY name, isin 
        ORDER BY shareholder_per_sector_value
        '''
        results_shareholder_per_company = execute_query(cursor, query_shareholder_per_company, (shareholder,))
        
        # Convert results to list of tuples for each shareholder
        sector_values = [(row[1], row[2]) for row in results_shareholder_per_company]
        
        # Add data to the main dictionary
        shareholders_per_company_data[shareholder] = sector_values

    # Write the dictionary to a JSON file
    with open('shareholder_per_company.json', 'w') as json_file:
        json.dump(shareholders_per_company_data, json_file, indent=4)

    print("\nJSON data has been saved to shareholder_per_sector.json")


def shareholder_per_sector_per_company(cursor, shareholder_list, sector_list):
    for shareholder in shareholder_list:
        for sector in sector_list:
            query_shareholder_per_company = '''
            SELECT name, sector, isin, SUM(value) AS shareholder_per_sector_value
            FROM joined_sp500
            WHERE name = ? AND sector = ? AND class = "Top Institutional Holders"
            GROUP BY name, sector, isin 
            ORDER BY shareholder_per_sector_value
            '''
            results_shareholder_per_sector_per_company = execute_query(cursor, query_shareholder_per_company, (shareholder, sector))
            print(results_shareholder_per_sector_per_company)


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
    return sector_list

def get_all_shareholders(cursor):
    query_get_shareholders = '''
    SELECT DISTINCT name
    FROM joined_sp500
    WHERE name IS NOT NULL AND class = "Top Institutional Holders"
    ORDER BY name;
    '''
    
    results = execute_query(cursor, query_get_shareholders)
    
    # Extract shareholder names into a list
    shareholder_list = [row[0] for row in results]
    return shareholder_list

def get_all_states(cursor):
    query_get_states = '''
    SELECT DISTINCT state
    FROM joined_sp500
    WHERE state IS NOT NULL
    ORDER BY state;
    '''
    results = execute_query(cursor, query_get_states)
    
    # Extract shareholder names into a list
    state_list = [row[0] for row in results]
    return state_list


if __name__ == '__main__':
    connect_db()
