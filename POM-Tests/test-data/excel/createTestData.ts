/**
 * Script to create Excel test data file
 * Run: npx ts-node data/excel/createTestData.ts
 */

import * as XLSX from 'xlsx';
import path from 'path';

// Login test data
const loginData = [
  {
    testCase: 'Valid Login - Admin',
    username: 'MIJIRBC',
    password: 'Assetuse@1',
    expectedResult: 'success',
    errorMessage: '',
  }, 

];

// User data
const userData = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0101',
    role: 'Admin',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '555-0102',
    role: 'User',
  },
  {
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@example.com',
    phone: '555-0103',
    role: 'Manager',
  },
];

// Create workbook
const workbook = XLSX.utils.book_new();

// Create Login sheet
const loginSheet = XLSX.utils.json_to_sheet(loginData);
XLSX.utils.book_append_sheet(workbook, loginSheet, 'Login');

// Create Users sheet
const userSheet = XLSX.utils.json_to_sheet(userData);
XLSX.utils.book_append_sheet(workbook, userSheet, 'Users');

// Write to file
const outputPath = path.join(__dirname, 'testData.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Excel test data file created: ${outputPath}`);
