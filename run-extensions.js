const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Ecotwin@216@db.vgsbcamzpqicvyvdtnch.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");
    
    const sql = fs.readFileSync(path.join(__dirname, 'supabase_schema_extensions.sql'), 'utf8');
    
    console.log("Executing schema extensions...");
    await client.query(sql);
    
    console.log("Schema extensions executed successfully.");
    
    console.log("Notifying PostgREST to reload schema cache...");
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log("Cache reloaded.");
    
  } catch (err) {
    console.error("Error executing schema extensions:", err);
  } finally {
    await client.end();
  }
}

run();
