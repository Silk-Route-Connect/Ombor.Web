import React, { useEffect, useState, ChangeEvent } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useStore } from '../../stores/StoreContext';

export interface ProductFormData {
  name: string;
  categoryId: number;
  incomePrice: number;
  salePrice: number;
  stock: number;
  unit: string;
  barcode: string;
  sku: string;               // ← added
  description?: string;    // ← added
}

const ProductFormModal: React.FC = observer(() => {
  const { productStore, categoryStore } = useStore();
  const { enqueueSnackbar } = useSnackbar();

  const isOpen = productStore.isFormModalOpen;
  const isEdit = !!productStore.selectedProduct;

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
  const [submitting, setSubmitting] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (isEdit && productStore.selectedProduct) {
        setForm({ ...productStore.selectedProduct });
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
    }
  }, [isOpen, isEdit, productStore.selectedProduct]);

  // Ensure categories are loaded before rendering dropdown
  useEffect(() => {
    if (isOpen && categoryStore.categories.length === 0) {
      categoryStore.loadCategories();
    }
  }, [isOpen, categoryStore]);

  const handleChange =
    (field: keyof ProductFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
      const value =
        typeof e.target.value === 'string' &&
        ['incomePrice', 'salePrice', 'stock', 'categoryId'].includes(field)
          ? Number(e.target.value)
          : e.target.value;
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
    setSubmitting(true);
    try {
      if (isEdit && productStore.selectedProduct) {
        await productStore.updateProduct({ id: productStore.selectedProduct.id, ...form });
        enqueueSnackbar('Товар обновлён', { variant: 'success' });
      } else {
        await productStore.createProduct(form);
        enqueueSnackbar('Товар добавлен', { variant: 'success' });
      }
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} columns={12}>
          {/* Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Название"
              value={form.name}
              onChange={handleChange('name')}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth error={!!errors.categoryId}>
              <InputLabel>Категория</InputLabel>
              <Select
                label="Категория"
                value={form.categoryId}
                onChange={handleChange('categoryId')}
              >
                {categoryStore.categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Income Price */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Цена закупки"
              type="number"
              value={form.incomePrice}
              onChange={handleChange('incomePrice')}
              fullWidth
              error={!!errors.incomePrice}
              helperText={errors.incomePrice}
            />
          </Grid>

          {/* Sale Price */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Цена продажи"
              type="number"
              value={form.salePrice}
              onChange={handleChange('salePrice')}
              fullWidth
              error={!!errors.salePrice}
              helperText={errors.salePrice}
            />
          </Grid>

          {/* Stock */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Остаток"
              type="number"
              value={form.stock}
              onChange={handleChange('stock')}
              fullWidth
            />
          </Grid>

          {/* Unit */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Единица измерения"
              value={form.unit}
              onChange={handleChange('unit')}
              fullWidth
            />
          </Grid>

          {/* Barcode */}
          <Grid size={12}>
            <TextField
              label="Штрихкод"
              value={form.barcode}
              onChange={handleChange('barcode')}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? 'Сохранение...' : isEdit ? 'Обновить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default ProductFormModal;
