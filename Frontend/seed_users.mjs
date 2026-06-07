import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually load .env.local since running node directly doesn't load it
try {
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Warning: Failed to load .env.local file", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const usersToSeed = [
  { email: 'owner@kirana.com', password: 'OwnerPassword123!', role: 'owner' },
  { email: 'worker1@kirana.com', password: 'WorkerPass1!', role: 'worker' },
  { email: 'worker2@kirana.com', password: 'WorkerPass2!', role: 'worker' },
];

async function seed() {
  console.log("Seeding users...");
  for (const u of usersToSeed) {
    const { error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          role: u.role,
        }
      }
    });

    if (error) {
      console.error(`Failed to create ${u.email}:`, error.message);
    } else {
      console.log(`Successfully created ${u.email}`);
    }
  }
  console.log("Seeding complete.");
}

seed();
