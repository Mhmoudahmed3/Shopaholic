import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load env vars
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedHome() {
  try {
    const homeData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'homepage.json'), 'utf8'));
    console.log('Read homepage.json');
    
    // Check if ID 1 exists
    const { data: existing } = await supabase.from('homepage_content').select('id').eq('id', 1).single();
    
    if (existing) {
      const { error } = await supabase.from('homepage_content').update({
        hero: homeData.hero,
        promo: homeData.promo,
        newsletter: homeData.newsletter
      }).eq('id', 1);
      
      if (error) throw error;
      console.log('Successfully updated homepage_content in Supabase');
    } else {
      const { error } = await supabase.from('homepage_content').insert([{
        id: 1,
        hero: homeData.hero,
        promo: homeData.promo,
        newsletter: homeData.newsletter
      }]);
      
      if (error) throw error;
      console.log('Successfully inserted homepage_content into Supabase');
    }
    
  } catch (err) {
    console.error('Error seeding homepage:', err);
  }
}

seedHome();
