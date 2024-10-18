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

    #in what concerns to wealth distribution, should we measure it by marketCap or by shares' value (investment made) held by holders
    #shouldn't the sum of shares' values be equal to the marketCap of the company?

    wealth_distribution_per_sector(cursor1)
    print("\n-----------------------\n")
    ownership_concentration(cursor2)
    print("\n-----------------------\n")
    conn1.close()
    conn2.close()

def execute_query(cursor, query):
    try:
        # Execute the query
        cursor.execute(query)

        # Fetch all results
        results = cursor.fetchall()

        return results

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")

def wealth_distribution_per_sector(cursor1):

    top_3_wealth = 0
    total_wealth = 0
    remaining_wealth = 0
    pctg_wealth_distribution_per_sector_top3 = 0
    pctg_remaining_wealth_distribution_per_sector = 0

    # SQL query to calculate total shareholding value by company
    query_wealth_distribution_per_sector = '''
    SELECT sector, SUM (marketCap) AS marketValue
    FROM company
    GROUP BY sector
    ORDER BY marketValue DESC
    '''  
    results = execute_query(cursor1, query_wealth_distribution_per_sector)

    # Top 3 companies by shareholding value
    print("\nTop 3 sectors by market capitalization\n")
    for row_number in range(0,3):
        print(f"{results[row_number][0]}: ${int(results[row_number][1]):,.2f}")

    
    # Sum the shareholding value of the top 10 companies
    for row_number in range(0,3):
        top_3_wealth += results[row_number][1]
    
    for row in results:
        total_wealth += row[1]

    remaining_wealth = total_wealth - top_3_wealth
    
    pctg_wealth_distribution_per_sector_top3 = (top_3_wealth / total_wealth) * 100  
    pctg_remaining_wealth_distribution_per_sector = (remaining_wealth / total_wealth) * 100


    print("\nComparison of wealth Distribution:")
    print(f"Total market capitalization of Top 3 Sectors: ${top_3_wealth:,.2f}")
    print(f"Total market capitalization of Other Sectors: ${remaining_wealth:,.2f}")
    print(f"Top 3 as % of Total: {pctg_wealth_distribution_per_sector_top3:.2f}%")
    print(f"Others as % of Total: {pctg_remaining_wealth_distribution_per_sector:.2f}%")

def ownership_concentration(cursor2):
    top_holder_names = []

    # SQL query to calculate top holders
    query_top_holders = '''
    SELECT name, SUM (value) AS shares_value
    FROM company
    GROUP BY name
    ORDER BY shares_value DESC
    '''
    results_top_holders = execute_query(cursor2, query_top_holders)
    
    print("\nTop 10 holders by shares value\n")
    for row_number in range(0,10):
        top_holder_names.append(results_top_holders[row_number][0])
        print(f"{results_top_holders[row_number][0]}: ${int(results_top_holders[row_number][1]):,.2f}")

    query_ownership_holders = '''
    SELECT symbol, SUM (pctg) AS ownership
    FROM company
    GROUP BY isin
    ORDER BY ownership DESC
    '''

    results_ownership = execute_query(cursor2, query_ownership_holders)

    query_ownership_top10_holders = '''
    SELECT symbol, SUM (pctg) AS ownership
    FROM company
    WHERE name IN ({})
    GROUP BY isin
    ORDER BY ownership DESC
    '''.format(','.join(f"'{holder}'" for holder in top_holder_names))

    results_ownership_top10 = execute_query(cursor2, query_ownership_top10_holders)

    #divide, for each company, %owned on results_ownership_top10 by %owned on results_ownership. This way, we can see
    #how much of each company in terms of % is owned just by the top 10 holders. then, verify how many companies are
    #50% or more owned by just the top 10 holders and verify where the top 10 companies place in terms of being owned
    #by the top 10 holders, to verify how much the top 10 holders invest on the top 10 companies

if __name__ == '__main__':
    connect_db()