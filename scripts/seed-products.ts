import { ProductService } from '../src/products/product.service';
import { ProductInput } from '../src/products/product.types';

// Sample products data
const sampleProducts: ProductInput[] = [
  {
    productId: 'SKU-001',
    title: 'Váy xòe đen dáng A',
    description: 'Chất liệu tuyết mưa, phù hợp công sở',
    price: 350000,
    currency: 'VND',
    brand: 'YourBrand',
    categories: ['dress'],
    tags: ['den', 'cong so', 'size M'],
    stock: 12,
    metadata: { color: 'black', sizes: ['S','M','L'] },
    userId: 'merchant-1',
  },
  {
    productId: 'SKU-002',
    title: 'Áo sơ mi trắng công sở',
    description: 'Chất liệu cotton cao cấp, form dáng chuẩn',
    price: 280000,
    currency: 'VND',
    brand: 'OfficeStyle',
    categories: ['shirt'],
    tags: ['trang', 'cong so', 'cotton'],
    stock: 25,
    metadata: { color: 'white', sizes: ['S','M','L','XL'] },
    userId: 'merchant-1',
  },
  {
    productId: 'SKU-003',
    title: 'Quần jean xanh đậm',
    description: 'Quần jean slim fit, chất liệu denim cao cấp',
    price: 450000,
    currency: 'VND',
    brand: 'DenimCo',
    categories: ['pants'],
    tags: ['jean', 'xanh', 'slim fit'],
    stock: 18,
    metadata: { color: 'blue', sizes: ['28','30','32','34'] },
    userId: 'merchant-1',
  },
  {
    productId: 'SKU-004',
    title: 'Áo khoác dạ xám',
    description: 'Áo khoác dạ ấm áp, phong cách vintage',
    price: 650000,
    currency: 'VND',
    brand: 'VintageStyle',
    categories: ['jacket'],
    tags: ['da', 'xam', 'vintage', 'am'],
    stock: 8,
    metadata: { color: 'gray', sizes: ['S','M','L'] },
    userId: 'merchant-1',
  },
  {
    productId: 'SKU-005',
    title: 'Giày cao gót đen',
    description: 'Giày cao gót 7cm, da thật, thoải mái',
    price: 520000,
    currency: 'VND',
    brand: 'HeelMaster',
    categories: ['shoes'],
    tags: ['giay', 'cao got', 'den', 'da'],
    stock: 15,
    metadata: { color: 'black', sizes: ['36','37','38','39'] },
    userId: 'merchant-1',
  },
];

async function seedProducts() {
  console.log('🌱 Seeding products...');
  
  // This would need to be run in the context of the NestJS application
  // For now, just log the sample data
  console.log('Sample products to be seeded:');
  sampleProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.title} - ${product.price} VND`);
  });
  
  console.log('✅ Sample products ready for seeding');
  console.log('💡 To actually seed, call ProductService.upsertProducts() from within the app');
}

if (require.main === module) {
  seedProducts().catch(console.error);
}

export { sampleProducts };
