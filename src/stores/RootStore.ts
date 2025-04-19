import categoryStore from './CategoryStore';
import productStore from './ProductStore';

export const stores = {
    categoryStore,
    productStore
};

export type RootStoreType = typeof stores;
