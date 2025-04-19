import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  TableContainer,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreContext';
import { useState } from 'react';
import { CategoryDto } from '../../models/CategoryDto';
import { useSnackbar } from 'notistack';
import ConfirmDialog from '../shared/ConfirmDialog';

const CategoryTable = observer(() => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);
  const { categoryStore } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const categories = categoryStore.filteredCategories;

  if (categories.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <Typography variant="body1" color="text.secondary">
          Категории не найдены.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width="10%">#</TableCell>
            <TableCell>Название</TableCell>
            <TableCell>Описание</TableCell>
            <TableCell align="right" width="20%">
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {categories.map((cat, index) => (
            <TableRow key={cat.id} hover>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell align="right">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => categoryStore.openFormModal(cat)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => setDeleteTarget(cat)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить категорию?"
        content={`Вы уверены что хотите удалить "${deleteTarget?.name}"?`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;

          setIsDeleting(true);
          await categoryStore.deleteCategory(deleteTarget.id);
          enqueueSnackbar('Категория удалена', { variant: 'info' });
          setIsDeleting(false);
          setDeleteTarget(null);
        }}
      />
    </TableContainer>
  );
});

export default CategoryTable;
