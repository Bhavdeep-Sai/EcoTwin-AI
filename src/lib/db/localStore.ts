import fs from 'fs/promises'
import path from 'path'
import type { LocalDatabase } from '@/types'

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json')

const EMPTY_DB: LocalDatabase = {
  activities: [],
  ai_insights: [],
}

// Ensure directory and file exist with correct shape
async function ensureDb(): Promise<void> {
  const dir = path.dirname(DB_PATH)
  try {
    await fs.mkdir(dir, { recursive: true })
    try {
      await fs.access(DB_PATH)
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2))
    }
  } catch (error) {
    console.error('Failed to initialize local DB:', error)
  }
}

export async function getDb(): Promise<LocalDatabase> {
  await ensureDb()
  const data = await fs.readFile(DB_PATH, 'utf8')
  const parsed = JSON.parse(data) as Partial<LocalDatabase>
  // Ensure both arrays exist even if file is malformed
  return {
    activities: parsed.activities ?? [],
    ai_insights: parsed.ai_insights ?? [],
  }
}

export async function saveDb(data: LocalDatabase): Promise<void> {
  await ensureDb()
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
}
