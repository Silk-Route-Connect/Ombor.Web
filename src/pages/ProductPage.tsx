import React, { useEffect, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useStore } from '../stores/StoreContext';
import ProductTable from '../components/product/ProductTable';
import ProductFormModal from '../components/product/ProductFormModal';
import ProductSidePane from '../components/product/ProductSidePane';

const ProductPage: React.FC = observer(() => {
  const { productStore, categoryStore } = useStore();

  useEffect(() => {
    productStore.loadProducts();
    categoryStore.loadCategories();
  }, [productStore, categoryStore]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    productStore.setSearchQuery(e.target.value);

  const handlePage = (_: unknown, page: number) =>
    productStore.setPage(page);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Товары</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Поиск товаров..."
            value={productStore.searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ backgroundColor: '#fff', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => productStore.openFormModal(null)}
          >
            Добавить
          </Button>
        </Stack>
      </Stack>

      {productStore.isLoading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ProductTable />
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={productStore.totalPages}
              page={productStore.page}
              onChange={handlePage}
              color="primary"
            />
          </Box>
        </>
      )}

      <ProductFormModal />
      <ProductSidePane />
    </Box>
  );
});

export default ProductPage;
