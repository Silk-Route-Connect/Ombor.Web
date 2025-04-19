import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { InputAdornment } from '@mui/material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useStore } from '../stores/StoreContext';
import CategoryTable from '../components/category/CategoryTable';
import CategoryFormModal from '../components/category/CategoryFormModal';

const CategoryPage = observer(() => {
  const { categoryStore } = useStore();

  useEffect(() => {
    categoryStore.loadCategories();
  }, [categoryStore]);

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
      >
        <Typography variant="h5">Категории</Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          mt={{ xs: 2, sm: 0 }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Поиск категорий..."
            value={categoryStore.searchQuery}
            onChange={(e) => categoryStore.setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: '#fff',
              borderRadius: 1,
              minWidth: 250,
            }}
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => categoryStore.openFormModal(null)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Добавить
          </Button>
        </Stack>
      </Stack>

      {categoryStore.isLoading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <CategoryTable />
      )}

      <CategoryFormModal />
    </Box>
  );
});

export default CategoryPage;
