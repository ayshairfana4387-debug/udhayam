import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/userSchemes.json');

// In-memory cache synced with disk
let userSchemes = [];

function ensureDataDirectory() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadUserSchemes() {
  try {
    ensureDataDirectory();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      userSchemes = JSON.parse(content);
    } else {
      userSchemes = [];
      saveUserSchemes(userSchemes);
    }
  } catch (error) {
    console.error('Failed to load userSchemes.json:', error);
    userSchemes = [];
  }
  return userSchemes;
}

export function saveUserSchemes(data) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    userSchemes = data;
    return true;
  } catch (error) {
    console.error('Failed to save userSchemes.json:', error);
    return false;
  }
}

// Initial load on startup
loadUserSchemes();

export function getAllSchemes() {
  if (!userSchemes || userSchemes.length === 0) {
    loadUserSchemes();
  }
  return userSchemes;
}
