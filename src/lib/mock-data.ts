import { Product } from './types';

const womenImages = [
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80"
];

const menImages = [
  "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1490578474895-699bc4e3f49f?auto=format&fit=crop&q=80"
];

const childrenImages = [
  "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80"
];

const accessoriesImages = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1509941943102-10c232535736?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80"
];

const categories = ["women", "men", "children", "accessories"];
const types = ["dresses", "shirts", "pants", "jackets", "sneakers", "bags", "watches"];
const colorsList = ["Black", "White", "Navy", "Beige", "Grey", "Red", "Olive"];
const sizesList = ["XS", "S", "M", "L", "XL"];

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  
  for (let i = 1; i <= 49; i++) {
    // Semi-random selection to ensure distribution
    const catIndex = i % categories.length;
    const category = categories[catIndex];
    
    let imagesPool = accessoriesImages;
    if (category === "women") imagesPool = womenImages;
    if (category === "men") imagesPool = menImages;
    if (category === "children") imagesPool = childrenImages;
    
    const imageUrl = imagesPool[i % imagesPool.length];
    
    // Pick 2 random colors
    const prodColors = [colorsList[i % colorsList.length], colorsList[(i + 2) % colorsList.length]];
    // Pick 3 random sizes
    const prodSizes = [sizesList[(i) % sizesList.length], sizesList[(i+1) % sizesList.length], sizesList[(i+2) % sizesList.length]];
    
    // Construct variant items
    const variants: { url: string; color?: string; size?: string; quantity?: number }[] = [];
    let totalStock = 0;
    
    prodColors.forEach(color => {
      prodSizes.forEach(size => {
        const qty = Math.floor(Math.random() * 20) + 1;
        totalStock += qty;
        variants.push({
          url: imageUrl, // for simplicity, reusing the same image
          color: color,
          size: size,
          quantity: qty
        });
      });
    });

    const basePrice = 400 + (Math.floor(Math.random() * 200) * 10); // Between 400 to 2400
    const hasDiscount = Math.random() > 0.7; // 30% chance
    
    products.push({
      id: `generated-product-${i}`,
      name: `Premium ${category.charAt(0).toUpperCase() + category.slice(1)} ${types[i % types.length]}`,
      description: "A wonderful piece crafted with the finest materials to ensure luxurious comfort and effortless style.",
      price: basePrice,
      discountPrice: hasDiscount ? Math.floor(basePrice * 0.8) : undefined,
      category: category,
      type: types[i % types.length],
      images: [imageUrl],
      imageVariants: variants,
      sizes: prodSizes,
      colors: prodColors,
      stock: totalStock,
      isNew: i <= 8, // Make the first 8 products "New Arrivals"
      createdAt: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
      popularity: 100 - i
    });
  }
  return products;
};

export const mockProducts: Product[] = generateProducts();
