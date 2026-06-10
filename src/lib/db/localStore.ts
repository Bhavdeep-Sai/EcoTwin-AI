import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Ensure directory and file exist
async function ensureDb() {
  const dir = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify({ activities: [], ai_insights: [] }));
    }
  } catch (error) {
    console.error("Failed to initialize local DB:", error);
  }
}

export async function getDb() {
  await ensureDb();
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

export async function saveDb(data: any) {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}
