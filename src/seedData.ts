import categoryStore from './stores/CategoryStore';
import productStore from './stores/ProductStore';
import { CategoryDto } from './models/CategoryDto';
import { ProductDto } from './models/ProductDto';

export function seedData(): void {
  // Fake categories
  const fakeCategories: CategoryDto[] = [
    { id: 1, name: 'Электроника', description: 'Гаджеты и техника' },
    { id: 2, name: 'Продукты',      description: 'Продовольственные товары' },
    { id: 3, name: 'Книги',         description: 'Печатные издания' },
    { id: 4, name: 'Одежда',        description: 'Модная одежда' },
  ];
  categoryStore.categories = fakeCategories;

  // Fake products
  const fakeProducts: ProductDto[] = [
    {
      id: 101,
      name: 'iPhone 13',
      categoryId: 1,
      incomePrice: 7_000_000,
      salePrice: 8_500_000,
      stock: 12,
      unit: 'шт',
      barcode: '111222333444',
      sku: 'IP13-BLK-256',              // ← sku
      description: 'Apple iPhone 13, 256 GB, чёрный', // ← description
    },
    // …other products…
  ];
  productStore.products = fakeProducts;
}
