import { makeAutoObservable, runInAction } from 'mobx';
import { MockCategoryApi } from '../api/mocks/MockCategoryApi';
import { CategoryDto } from '../models/CategoryDto';

export class CategoryStore {
  categories: CategoryDto[] = [];
  selectedCategory: CategoryDto | null = null;
  isLoading = false;
  searchQuery = '';
  isFormModalOpen = false;

  private categoryApi = new MockCategoryApi();

  constructor() {
    makeAutoObservable(this);
  }

  openFormModal(category: CategoryDto | null) {
    this.selectedCategory = category;
    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.selectedCategory = null;
    this.isFormModalOpen = false;
  }

  async loadCategories() {
    this.isLoading = true;
    try {
      const response = await this.categoryApi.apiCategoryGet();
      runInAction(() => {
        this.categories = response;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  get filteredCategories() {
    const q = this.searchQuery.toLowerCase();
    return this.categories.filter((c) => c.name.toLowerCase().includes(q));
  }

  selectCategory(category: CategoryDto | null) {
    this.selectedCategory = category;
  }

  clearSelection() {
    this.selectedCategory = null;
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
  }

  async createCategory(category: Omit<CategoryDto, 'id'>) {
    // fake API delay + new ID
    const newCategory: CategoryDto = {
      ...category,
      id: Math.floor(Math.random() * 10000),
    };

    runInAction(() => {
      this.categories.push(newCategory);
    });
  }

  async updateCategory(category: CategoryDto) {
    runInAction(() => {
      const index = this.categories.findIndex((c) => c.id === category.id);
      if (index !== -1) {
        this.categories[index] = category;
      }
    });
  }

  async deleteCategory(id: number) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    runInAction(() => {
      this.categories = this.categories.filter((c) => c.id !== id);
    });
  }
}

const categoryStore = new CategoryStore();

export default categoryStore;
