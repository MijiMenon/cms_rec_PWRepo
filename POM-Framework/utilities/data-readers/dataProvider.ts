import path from 'path';
import { CsvReader } from './csvReader';
import { ExcelReader } from './excelReader';
import { logger } from '../logger';
import { TestData } from '../../interfaces';
import { promises as fs } from 'fs';

/**
 * DataProvider - Unified interface for reading test data from various sources
 * Supports caching to improve performance
 */
export class DataProvider {
  private static cache: Map<string, TestData[]> = new Map();
  private static cacheEnabled: boolean = true;

  /**
   * Enable or disable caching
   */
  static setCaching(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) {
      this.clearCache();
    }
  }

  /**
   * Clear the data cache
   */
  static clearCache(): void {
    this.cache.clear();
    logger.info('Data cache cleared');
  }

  /**
   * Get data from cache or read from file
   */
  private static async getData(filePath: string, sheetName?: string): Promise<TestData[]> {
    const cacheKey = sheetName ? `${filePath}:${sheetName}` : filePath;

    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      logger.info(`Returning cached data for: ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    const ext = path.extname(filePath).toLowerCase();
    let data: TestData[];

    if (ext === '.csv') {
      data = await CsvReader.read(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      data = await ExcelReader.read(filePath, sheetName);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Supported types: .csv, .xlsx, .xls`);
    }

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, data);
      logger.info(`Cached data for: ${cacheKey}`);
    }

    return data;
  }

  /**
   * Read test data from file (auto-detects format)
   */
  static async getTestData(filePath: string, sheetName?: string): Promise<TestData[]> {
    logger.info(`Loading test data from: ${filePath}`);
    return await this.getData(filePath, sheetName);
  }

  /**
   * Get test data from data directory
   */
  static async getTestDataFromDataDir(
    fileName: string,
    subDir?: string,
    sheetName?: string
  ): Promise<TestData[]> {
    const dataDir = path.join(process.cwd(), 'POM-Tests/test-data');
    const filePath = subDir
      ? path.join(dataDir, subDir, fileName)
      : path.join(dataDir, fileName);

    return await this.getTestData(filePath, sheetName);
  }

  /**
   * Get CSV data from data/csv directory
   */
  static async getCsvData(fileName: string): Promise<TestData[]> {
    return await this.getTestDataFromDataDir(fileName, 'csv');
  }

  /**
   * Get Excel data from data/excel directory
   */
  static async getExcelData(fileName: string, sheetName?: string): Promise<TestData[]> {
    return await this.getTestDataFromDataDir(fileName, 'excel', sheetName);
  }

  /**
   * Get specific row by index
   */
  static async getRow(filePath: string, rowIndex: number, sheetName?: string): Promise<TestData> {
    const data = await this.getData(filePath, sheetName);

    if (rowIndex < 0 || rowIndex >= data.length) {
      throw new Error(`Row index ${rowIndex} out of bounds. Total rows: ${data.length}`);
    }

    return data[rowIndex];
  }

  /**
   * Filter test data by condition
   */
  static async getFilteredData(
    filePath: string,
    filterFn: (row: TestData) => boolean,
    sheetName?: string
  ): Promise<TestData[]> {
    const data = await this.getData(filePath, sheetName);
    return data.filter(filterFn);
  }

  /**
   * Get test data with specific tag/category
   */
  static async getDataByTag(
    filePath: string,
    tagColumn: string,
    tagValue: string,
    sheetName?: string
  ): Promise<TestData[]> {
    return await this.getFilteredData(
      filePath,
      row => row[tagColumn]?.toString().toLowerCase() === tagValue.toLowerCase(),
      sheetName
    );
  }

  /**
   * Get data for specific test scenario
   */
  static async getDataForScenario(
    filePath: string,
    scenarioName: string,
    sheetName?: string
  ): Promise<TestData[]> {
    return await this.getDataByTag(filePath, 'scenario', scenarioName, sheetName);
  }

  /**
   * Convert test data to typed interface
   */
  static convertToType<T>(data: TestData[]): T[] {
    return data as unknown as T[];
  }

  /**
   * Get row count
   */
  static async getRowCount(filePath: string, sheetName?: string): Promise<number> {
    const data = await this.getData(filePath, sheetName);
    return data.length;
  }

  /**
   * Validate required fields in test data
   */
  static validateRequiredFields(data: TestData[], requiredFields: string[]): boolean {
    for (const row of data) {
      for (const field of requiredFields) {
        if (row[field] === undefined || row[field] === null || row[field] === '') {
          logger.error(`Missing required field "${field}" in row: ${JSON.stringify(row)}`);
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Merge data from multiple sources
   */
  static async mergeData(filePaths: string[], sheetNames?: string[]): Promise<TestData[]> {
    const allData: TestData[] = [];

    for (let i = 0; i < filePaths.length; i++) {
      const filePath = filePaths[i];
      const sheetName = sheetNames?.[i];
      const data = await this.getData(filePath, sheetName);
      allData.push(...data);
    }

    logger.info(`Merged data from ${filePaths.length} sources. Total rows: ${allData.length}`);
    return allData;
  }

  /**
   * Read JSON data and parse it to TestData format
   */
  static async getTestDataFromJson(filePath: string): Promise<TestData> {
    logger.info(`Loading JSON test data from: ${filePath}`);
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const jsonData: TestData = JSON.parse(fileContent);
    logger.info(`JSON data loaded successfully from: ${filePath}`);
    return jsonData;
  }
}
