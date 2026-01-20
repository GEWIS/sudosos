#!/usr/bin/env node

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the dashboard directory from command line args or use default
const dashboardDir = process.argv[2] || join(__dirname, '../apps/dashboard');
const localesDir = join(dashboardDir, 'src/locales');
const languages = ['en', 'nl', 'pl'];

// Check if locales directory exists
if (!existsSync(localesDir)) {
  console.error(`Error: Locales directory not found at ${localesDir}`);
  process.exit(1);
}

console.log(`Checking translations in: ${localesDir}\n`);

// Structure: { category: { file: { lang: keys } } }
const translations = {};

// Read all translation files
languages.forEach((lang) => {
  const langDir = join(localesDir, lang);

  // Read common, components, and modules
  ['common', 'components', 'modules'].forEach((category) => {
    const categoryDir = join(langDir, category);
    if (existsSync(categoryDir)) {
      const files = readdirSync(categoryDir);
      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const filePath = join(categoryDir, file);
          const content = JSON.parse(readFileSync(filePath, 'utf8'));

          if (!translations[category]) translations[category] = {};
          if (!translations[category][file]) translations[category][file] = {};

          translations[category][file][lang] = getAllKeys(content);
        }
      });
    }
  });
});

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Compare keys across languages
console.log('=== Translation Key Comparison ===\n');

let hasMissingKeys = false;

Object.keys(translations)
  .sort()
  .forEach((category) => {
    Object.keys(translations[category])
      .sort()
      .forEach((file) => {
        const fileTranslations = translations[category][file];

        // Get all unique keys across all languages
        const allKeys = new Set();
        languages.forEach((lang) => {
          if (fileTranslations[lang]) {
            fileTranslations[lang].forEach((key) => allKeys.add(key));
          }
        });

        // Check which keys are missing in which languages
        const missingKeys = {};
        languages.forEach((lang) => {
          missingKeys[lang] = [];
          const langKeys = fileTranslations[lang] || [];
          allKeys.forEach((key) => {
            if (!langKeys.includes(key)) {
              missingKeys[lang].push(key);
            }
          });
        });

        // Report missing keys
        const hasIssues = languages.some((lang) => missingKeys[lang].length > 0);
        if (hasIssues) {
          hasMissingKeys = true;
          console.log(`\n- ${category}/${file}`);
          languages.forEach((lang) => {
            if (missingKeys[lang].length > 0) {
              console.log(`  ${lang.toUpperCase()} is missing ${missingKeys[lang].length} key(s):`);
              missingKeys[lang].forEach((key) => {
                console.log(`     - ${key}`);
              });
            } else {
              console.log(`  ${lang.toUpperCase()} has all keys (${fileTranslations[lang].length} total)`);
            }
          });
        }
      });
  });

if (!hasMissingKeys) {
  console.log('All translation files have consistent keys across all languages!\n');
  process.exit(0);
} else {
  console.log('\nTranslation key mismatches detected! Please fix the issues above.\n');
  process.exit(1);
}
