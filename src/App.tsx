import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/DashboardPage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import { stores } from './stores/RootStore';
import { StoreContext } from './stores/StoreContext';
import { SnackbarProvider } from 'notistack';

function App() {
  return (
    <StoreContext.Provider value={stores}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="categories" element={<CategoryPage />} />
              <Route path="products" element={<ProductPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SnackbarProvider>
    </StoreContext.Provider>
  );
}

export default App;
