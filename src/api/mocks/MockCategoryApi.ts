import { CategoryDto } from '../../models/CategoryDto'; // adjust path as needed

export class MockCategoryApi {
  async apiCategoryGet(): Promise<CategoryDto[]> {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Electronics',
            description: 'Phones, Laptops, Accessories',
          },
          {
            id: 2,
            name: 'Groceries',
            description: 'Food and drinks',
          },
          {
            id: 3,
            name: 'Books',
            description: 'All kinds of books',
          },
        ]);
      }, 600),
    );
  }
}
