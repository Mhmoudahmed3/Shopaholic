export * from './types';
export * from './mock-data';
// Note: DB-related functions (getProducts, getProduct, getRelatedProducts) 
// have been moved to src/lib/db.ts to avoid client-side build errors with 'fs'.
