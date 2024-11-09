import sqlite3
import openpyxl

def xlsx_to_sqlite(xlsx_file, db_file, table_name):
    # Load the Excel file
    wb = openpyxl.load_workbook(xlsx_file)
    sheet = wb.active

    # Connect to the SQLite database (or create it)
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    # Get column names from the second row (remember rows and cols start from 1 in openpyxl)
    columns = [cell.value for cell in sheet[2]]

    # Create the table based on the column names
    cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
    columns_str = ', '.join([f'"{col}" TEXT' for col in columns])
    cursor.execute(f"CREATE TABLE {table_name} ({columns_str})")

    # Iterate over the rows, starting from the third row (after deleting the first row)
    for row in sheet.iter_rows(min_row=3, values_only=True):
        # Prepare the data to insert
        row_data = tuple(row)
        placeholders = ', '.join(['?' for _ in row_data])
        print(columns)
        cursor.execute(f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})", row_data)

    # Commit changes and close the connection
    conn.commit()
    conn.close()
    print(f"Data from {xlsx_file} has been inserted into the {table_name} table in {db_file}.")



if __name__ == '__main__':
    xlsx_to_sqlite('original_dataset/s&p500.xlsx', 'sp500.db', 'company')