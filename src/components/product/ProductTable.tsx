import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { observer } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import { useStore } from '../../stores/StoreContext';
import ConfirmDialog from '../shared/ConfirmDialog';
import { ProductDto } from '../../models/ProductDto';

const ProductTable: React.FC = observer(() => {
  const { productStore, categoryStore } = useStore();
  const { enqueueSnackbar } = useSnackbar();

  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const items = productStore.paginatedProducts;

  if (items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        Нет товаров по заданным параметрам.
      </Paper>
    );
  }

  const handleRowClick = (prod: ProductDto) => {
    productStore.openSidePane(prod);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>№</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Артикул</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell align="right">Цена закупки</TableCell>
              <TableCell align="right">Цена продажи</TableCell>
              <TableCell align="right">Остаток</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((prod, idx) => (
              <TableRow
                key={prod.id}
                hover
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(prod)}
              >
                <TableCell>
                  {idx + 1 + (productStore.page - 1) * productStore.pageSize}
                </TableCell>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.sku}</TableCell>
                <TableCell>
                  {productStore.getCategoryName(prod.categoryId)}
                </TableCell>
                <TableCell align="right">
                  {productStore.formatUZS(prod.incomePrice)}
                </TableCell>
                <TableCell align="right">
                  {productStore.formatUZS(prod.salePrice)}
                </TableCell>
                <TableCell align="right">{prod.stock}</TableCell>
                <TableCell
                  align="right"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="Редактировать">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => productStore.openFormModal(prod)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => setDeleteTarget(prod)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удаление товара"
        content={`Вы уверены, что хотите удалить товар «${deleteTarget?.name}»?`}
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          await productStore.deleteProduct(deleteTarget.id);
          enqueueSnackbar('Товар удалён', { variant: 'info' });
          setIsDeleting(false);
          setDeleteTarget(null);
        }}
      />
    </>
  );
});

export default ProductTable;
