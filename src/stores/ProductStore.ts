import { makeAutoObservable, runInAction } from 'mobx';
import { ProductDto } from '../models/ProductDto';
import { MockProductApi } from '../api/mocks/MockProductApi';
import categoryStore from './CategoryStore';

export class ProductStore {
  products: ProductDto[] = [];
  selectedProduct: ProductDto | null = null;
  isLoading = false;
  searchQuery = '';
  page = 1;
  pageSize = 10;
  isFormModalOpen = false;
  isSidePaneOpen = false;              // renamed

  private productApi = new MockProductApi();

  constructor() {
    makeAutoObservable(this);
  }

  openFormModal(product: ProductDto | null): void {
    this.selectedProduct = product;
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.selectedProduct = null;
    this.isFormModalOpen = false;
  }

  /** renamed from openDrawer */
  openSidePane(product: ProductDto): void {
    this.selectedProduct = product;
    this.isSidePaneOpen = true;
  }

  /** renamed from closeDrawer */
  closeSidePane(): void {
    this.selectedProduct = null;
    this.isSidePaneOpen = false;
  }

  async loadProducts(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await this.productApi.getProducts();
      runInAction(() => {
        this.products = response;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async createProduct(data: Omit<ProductDto, 'id'>): Promise<void> {
    const newProduct: ProductDto = {
      id: Math.floor(Math.random() * 1_000_000),
      ...data,
    };
    await new Promise((r) => setTimeout(r, 400));
    runInAction(() => {
      this.products.unshift(newProduct);
    });
  }

  async updateProduct(updated: ProductDto): Promise<void> {
    await new Promise((r) => setTimeout(r, 400));
    runInAction(() => {
      const idx = this.products.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        this.products[idx] = updated;
      }
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    runInAction(() => {
      this.products = this.products.filter((p) => p.id !== id);
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.page = 1;
  }

  setPage(page: number): void {
    this.page = page;
  }

  get filteredProducts(): ProductDto[] {
    const q = this.searchQuery.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q),
    );
  }

  get paginatedProducts(): ProductDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  formatUZS(value: number): string {
    return value.toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0,
    });
  }

  getCategoryName(categoryId: number): string {
    const c = categoryStore.categories.find((c) => c.id === categoryId);
    return c?.name ?? '—';
  }
}

const productStore = new ProductStore();
export default productStore;
