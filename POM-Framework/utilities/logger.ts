import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'POM-Tests/logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const log = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    return stack ? `${log}\n${stack}` : log;
  })
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'test-execution.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // File transport for errors only
    new winston.transports.File({
      filename: path.join(logsDir, 'errors.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Log test start
 */
export function logTestStart(testName: string): void {
  logger.info(`${'='.repeat(80)}`);
  logger.info(`TEST STARTED: ${testName}`);
  logger.info(`${'='.repeat(80)}`);
}

/**
 * Log test end
 */
export function logTestEnd(testName: string, status: 'PASSED' | 'FAILED'): void {
  logger.info(`${'='.repeat(80)}`);
  logger.info(`TEST ${status}: ${testName}`);
  logger.info(`${'='.repeat(80)}`);
}

/**
 * Log step
 */
export function logStep(step: string): void {
  logger.info(`STEP: ${step}`);
}

/**
 * Log assertion
 */
export function logAssertion(assertion: string): void {
  logger.info(`VERIFY: ${assertion}`);
}

/**
 * Log test data
 */
export function logTestData(data: Record<string, any>): void {
  logger.info(`TEST DATA: ${JSON.stringify(data, null, 2)}`);
}
