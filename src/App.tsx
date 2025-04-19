import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import { SnackbarProvider } from 'notistack';
import { JSX, useEffect } from 'react';
import { seedData } from './seedData';
import { useStore } from './stores/StoreContext';

function App(): JSX.Element {
  const { categoryStore, productStore } = useStore();

  useEffect(() => {
    // seed fake data for both categories and products
    seedData();

    // if you still want to load real/mock-API data afterwards:
    // categoryStore.loadCategories();
    // productStore.loadProducts();
  }, [categoryStore, productStore]);

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<CategoryPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="products" element={<ProductPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  );
}

export default App;

