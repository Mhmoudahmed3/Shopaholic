import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = 'https://fjeigpoknbpklukqiwvt.supabase.co';
const supabaseKey = 'sb_publishable_dsZJaoZpr1sjG4WQTCAjeA_PCxnajzW'; // In real usage, use service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
  try {
    const productsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'products.json'), 'utf8'));
    console.log(`Read ${productsData.length} products from json`);
    
    // Process in chunks of 50 to avoid timeouts/overloading
    const chunkSize = 50;
    for (let i = 0; i < productsData.length; i += chunkSize) {
      const chunk = productsData.slice(i, i + chunkSize).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        discount_price: p.discountPrice,
        category: p.category,
        type: p.type,
        images: p.images,
        image_variants: p.imageVariants,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        rating: p.rating,
        reviews_count: p.reviewsCount,
        created_at: p.createdAt || new Date().toISOString()
      }));
      
      const { error } = await supabase.from('products').upsert(chunk);
      if (error) {
        console.error(`Error seeding chunk ${i}-${i + chunkSize}:`, error);
      } else {
        console.log(`Successfully seeded products ${i} to ${i + chunk.length}`);
      }
    }
    
    console.log('Seeding products finished!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seedProducts();
