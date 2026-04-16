import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Store in /tmp for Vercel serverless compatibility, otherwise use local directory out of the box
const DB_PATH = process.env.VERCEL || process.env.NODE_ENV === 'production'
  ? '/tmp/profiles.db' 
  : path.resolve('./profiles.db');

let dbInstance = null;

export const getDb = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Bootstrap the schema if it doesn't exist
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE COLLATE NOCASE NOT NULL,
      gender TEXT NOT NULL,
      gender_probability REAL NOT NULL,
      sample_size INTEGER NOT NULL,
      age INTEGER NOT NULL,
      age_group TEXT NOT NULL,
      country_id TEXT NOT NULL,
      country_probability REAL NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  return dbInstance;
};
