import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { getLogger } from '../utils/logger'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.')
  return db
}

export function initDb(dbPath: string): void {
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  runMigrations()
  getLogger().info(`Database initialized at ${dbPath}`)
}

function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

  for (const file of files) {
    const already = db.prepare('SELECT 1 FROM migrations WHERE name = ?').get(file)
    if (already) continue

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    db.exec(sql)
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(file)
    getLogger().info(`Applied migration: ${file}`)
  }
}
