/**
 * Script to update all import paths from old structure to new structure
 * Run: node update-imports.js
 */

const fs = require('fs');
const path = require('path');

// Mapping of old paths to new paths
const pathMappings = {
  // Old relative paths to new relative paths
  "'../../types'": "'../../interfaces'",
  "'../../utils/logger'": "'../../utilities/logger'",
  "'../../utils/screenshotHelper'": "'../../utilities/screenshotHelper'",
  "'../../utils/helpers'": "'../../utilities/helpers'",
  "'../../utils/dataReaders/dataProvider'": "'../../utilities/data-readers/dataProvider'",
  "'../../utils/dataReaders/csvReader'": "'../../utilities/data-readers/csvReader'",
  "'../../utils/dataReaders/excelReader'": "'../../utilities/data-readers/excelReader'",
  "'../utils/logger'": "'../utilities/logger'",
  "'../utils/screenshotHelper'": "'../utilities/screenshotHelper'",
  "'../utils/dataReaders/dataProvider'": "'../utilities/data-readers/dataProvider'",
  "'../logger'": "'./logger'",

  // Absolute imports
  "from '../fixtures'": "from '../test-fixtures'",
  "from '../types'": "from '../interfaces'",

  // Update paths in files
  "'./src/hooks/globalSetup.ts'": "'./POM-Framework/test-hooks/globalSetup.ts'",
  "'./src/hooks/globalTeardown.ts'": "'./POM-Framework/test-hooks/globalTeardown.ts'",

  // Screenshot paths
  "'screenshots/": "'POM-Tests/screenshots/",
  "'logs/": "'POM-Tests/logs/",
  "process.cwd(), 'logs'": "process.cwd(), 'POM-Tests/logs'",
  "process.cwd(), 'screenshots'": "process.cwd(), 'POM-Tests/screenshots'",
  "process.cwd(), 'data'": "process.cwd(), 'POM-Tests/test-data'",
  "'data/csv'": "'POM-Tests/test-data/csv'",
  "'data/excel'": "'POM-Tests/test-data/excel'",
};

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply all path mappings
    for (const [oldPath, newPath] of Object.entries(pathMappings)) {
      if (content.includes(oldPath)) {
        content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error updating ${filePath}:`, error.message);
  }
}

function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'src' && file !== 'data' && file !== 'reports') {
        walkDirectory(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

console.log('🚀 Updating import paths...\n');

// Update POM-Framework files
walkDirectory('./POM-Framework', updateFile);

// Update POM-Tests files
walkDirectory('./POM-Tests', updateFile);

console.log('\n✅ Import paths updated successfully!');
