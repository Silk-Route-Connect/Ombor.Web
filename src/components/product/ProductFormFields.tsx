import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreContext';
import { useSnackbar } from 'notistack';

export interface ProductFormData {
    name: string;
    categoryId: number;
    incomePrice: number;
    salePrice: number;
    stock: number;
    unit: string;
    barcode: string;
    sku: string;            // ← added
    description?: string;    // ← added
}
  

const ProductFormModal: React.FC = observer(() => {
  const { productStore, categoryStore } = useStore();
  const { enqueueSnackbar } = useSnackbar();

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    categoryId: 0,
    incomePrice: 0,
    salePrice: 0,
    stock: 0,
    unit: '',
    barcode: '',
    sku: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isEdit = productStore.selectedProduct !== null;

  useEffect(() => {
    if (productStore.selectedProduct) {
      const { name, categoryId, incomePrice, salePrice, stock, unit, barcode, sku, description } =
        productStore.selectedProduct;
      setForm({ name, categoryId, incomePrice, salePrice, stock, unit, barcode, sku, description });
    } else {
      setForm({
        name: '',
        categoryId: 0,
        incomePrice: 0,
        salePrice: 0,
        stock: 0,
        unit: '',
        barcode: '',
        sku: '',
        description: '',
      });
    }
    setErrors({});
  }, [productStore.selectedProduct]);

  const handleChange = (field: keyof ProductFormData, value: string | number): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Обязательное поле';
    if (form.incomePrice <= 0) newErrors.incomePrice = 'Введите корректную цену';
    if (form.salePrice <= 0) newErrors.salePrice = 'Введите корректную цену';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = (): void => {
    productStore.closeFormModal();
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && productStore.selectedProduct) {
        await productStore.updateProduct({
          id: productStore.selectedProduct.id,
          ...form,
        });
        enqueueSnackbar('Товар обновлён', { variant: 'success' });
      } else {
        await productStore.createProduct(form);
        enqueueSnackbar('Товар добавлен', { variant: 'success' });
      }
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = categoryStore.categories.map((c) => ({ id: c.id, name: c.name }));

  return (
    <Dialog open={productStore.isFormModalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} columns={12}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Название"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Категория</InputLabel>
              <Select
                label="Категория"
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', Number(e.target.value))}
              >
                {categoryOptions.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Цена закупки"
              type="number"
              value={form.incomePrice}
              onChange={(e) => handleChange('incomePrice', Number(e.target.value))}
              fullWidth
              error={!!errors.incomePrice}
              helperText={errors.incomePrice}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Цена продажи"
              type="number"
              value={form.salePrice}
              onChange={(e) => handleChange('salePrice', Number(e.target.value))}
              fullWidth
              error={!!errors.salePrice}
              helperText={errors.salePrice}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Остаток"
              type="number"
              value={form.stock}
              onChange={(e) => handleChange('stock', Number(e.target.value))}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Единица измерения"
              value={form.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Штрихкод"
              value={form.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
  <TextField
    label="SKU"
    value={form.sku}
    onChange={e => handleChange('sku', e.target.value)}
    fullWidth
    error={!!errors.sku}
    helperText={errors.sku}
  />
</Grid>

{/* Description */}
<Grid size={12}>
  <TextField
    label="Описание"
    value={form.description}
    onChange={e => handleChange('description', e.target.value)}
    fullWidth
    multiline
    rows={3}
  />
</Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ProductFormModal;
