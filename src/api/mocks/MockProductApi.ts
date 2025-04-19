import { ProductDto } from '../../models/ProductDto';

export class MockProductApi {
  async getProducts(): Promise<ProductDto[]> {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'iPhone 13',
            categoryId: 1,
            incomePrice: 7000000,
            salePrice: 8500000,
            stock: 10,
            unit: 'шт',
            barcode: '1234567890',
            sku: 'IP13-BLK-256',
            description: 'Apple iPhone 13, 256 GB, чёрный',
          },
          {
            id: 2,
            name: 'MacBook Pro',
            categoryId: 1,
            incomePrice: 20000000,
            salePrice: 23500000,
            stock: 4,
            unit: 'шт',
            barcode: '9876543210',
            sku: 'MBP-16-512',
            description: 'Apple MacBook Pro 16", 512 GB, серый',
          },
        ]);
      }, 500),
    );
  }

  // Create/update/delete can be added later
}
