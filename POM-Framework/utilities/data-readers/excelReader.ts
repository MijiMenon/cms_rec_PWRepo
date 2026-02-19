import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { logger } from '../logger';
import { TestData } from '../../interfaces';

/**
 * Excel Reader - Reads test data from Excel files
 */
export class ExcelReader {
  /**
   * Read Excel file and return data from specified sheet
   */
  static async read(filePath: string, sheetName?: string): Promise<TestData[]> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Excel file not found: ${absolutePath}`);
      }

      logger.info(`Reading Excel file: ${absolutePath}`);

      const workbook = XLSX.readFile(absolutePath);

      // Use specified sheet or first sheet
      const sheet = sheetName
        ? workbook.Sheets[sheetName]
        : workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) {
        throw new Error(`Sheet "${sheetName}" not found in Excel file`);
      }

      const data: TestData[] = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        defval: '',
      });

      logger.info(`Successfully read ${data.length} rows from Excel`);
      return data;
    } catch (error) {
      logger.error(`Error reading Excel file: ${error}`);
      throw error;
    }
  }

  /**
   * Get all sheet names from Excel file
   */
  static async getSheetNames(filePath: string): Promise<string[]> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Excel file not found: ${absolutePath}`);
      }

      const workbook = XLSX.readFile(absolutePath);
      return workbook.SheetNames;
    } catch (error) {
      logger.error(`Error getting sheet names: ${error}`);
      throw error;
    }
  }

  /**
   * Read all sheets from Excel file
   */
  static async readAllSheets(filePath: string): Promise<Record<string, TestData[]>> {
    try {
      const absolutePath = path.resolve(filePath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Excel file not found: ${absolutePath}`);
      }

      logger.info(`Reading all sheets from Excel file: ${absolutePath}`);

      const workbook = XLSX.readFile(absolutePath);
      const result: Record<string, TestData[]> = {};

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        result[sheetName] = XLSX.utils.sheet_to_json(sheet, {
          raw: false,
          defval: '',
        });
      });

      logger.info(`Successfully read ${Object.keys(result).length} sheets from Excel`);
      return result;
    } catch (error) {
      logger.error(`Error reading all sheets: ${error}`);
      throw error;
    }
  }

  /**
   * Read specific columns from Excel
   */
  static async readColumns(
    filePath: string,
    columns: string[],
    sheetName?: string
  ): Promise<TestData[]> {
    const allData = await this.read(filePath, sheetName);

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
   * Read Excel and filter rows by condition
   */
  static async readWithFilter(
    filePath: string,
    filterFn: (row: TestData) => boolean,
    sheetName?: string
  ): Promise<TestData[]> {
    const allData = await this.read(filePath, sheetName);
    return allData.filter(filterFn);
  }

  /**
   * Read single row by index
   */
  static async readRow(filePath: string, rowIndex: number, sheetName?: string): Promise<TestData> {
    const allData = await this.read(filePath, sheetName);

    if (rowIndex < 0 || rowIndex >= allData.length) {
      throw new Error(`Row index ${rowIndex} out of bounds`);
    }

    return allData[rowIndex];
  }

  /**
   * Get row count
   */
  static async getRowCount(filePath: string, sheetName?: string): Promise<number> {
    const data = await this.read(filePath, sheetName);
    return data.length;
  }
}
