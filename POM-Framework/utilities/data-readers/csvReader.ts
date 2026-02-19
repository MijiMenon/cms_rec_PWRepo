import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { TestData } from '../../interfaces';

/**
 * CSV Reader - Reads test data from CSV files
 */
export class CsvReader {
  /**
   * Read CSV file and return data as array of objects
   */
  static async read(filePath: string): Promise<TestData[]> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`CSV file not found: ${absolutePath}`);
      }

      logger.info(`Reading CSV file: ${absolutePath}`);

      const fileContent = fs.readFileSync(absolutePath, 'utf-8');

      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        cast: true,
        cast_date: false,
      });

      logger.info(`Successfully read ${records.length} records from CSV`);
      return records;
    } catch (error) {
      logger.error(`Error reading CSV file: ${error}`);
      throw error;
    }
  }

  /**
   * Read specific columns from CSV
   */
  static async readColumns(filePath: string, columns: string[]): Promise<TestData[]> {
    const allData = await this.read(filePath);

    return allData.map(row => {
      const filteredRow: TestData = {};
      columns.forEach(column => {
        if (row[column] !== undefined) {
          filteredRow[column] = row[column];
        }
      });
      return filteredRow;
    });
  }

  /**
   * Read CSV and filter rows by condition
   */
  static async readWithFilter(
    filePath: string,
    filterFn: (row: TestData) => boolean
  ): Promise<TestData[]> {
    const allData = await this.read(filePath);
    return allData.filter(filterFn);
  }

  /**
   * Read single row by index
   */
  static async readRow(filePath: string, rowIndex: number): Promise<TestData> {
    const allData = await this.read(filePath);

    if (rowIndex < 0 || rowIndex >= allData.length) {
      throw new Error(`Row index ${rowIndex} out of bounds`);
    }

    return allData[rowIndex];
  }

  /**
   * Get row count
   */
  static async getRowCount(filePath: string): Promise<number> {
    const data = await this.read(filePath);
    return data.length;
  }
}
