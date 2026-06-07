import { createClient } from '@supabase/supabase-js';

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
