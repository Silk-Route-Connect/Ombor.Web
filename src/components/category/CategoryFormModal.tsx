import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreContext';
import { CategoryDto } from '../../models/CategoryDto';
import { useSnackbar } from 'notistack'; // replace with Swagger model later

const CategoryFormModal = observer(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const { categoryStore } = useStore();
  const { enqueueSnackbar } = useSnackbar();
  const isEdit = categoryStore.selectedCategory !== null;

  const [form, setForm] = useState<Omit<CategoryDto, 'id'>>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (categoryStore.isFormModalOpen) {
      if (isEdit) {
        const { name, description } = categoryStore.selectedCategory!;
        setForm({ name, description });
      } else {
        setForm({ name: '', description: '' });
      }
    }
  }, [categoryStore.isFormModalOpen, isEdit, categoryStore.selectedCategory]);

  const handleClose = () => {
    categoryStore.closeFormModal();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  
    if (name === 'name' && value.trim()) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleSubmit = async () => {
    const validationErrors: { name?: string } = {};
  
    if (!form.name.trim()) {
      validationErrors.name = 'Name is required';
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
  
    setErrors({});
    setIsSubmitting(true);
  
    try {
      if (isEdit) {
        await categoryStore.updateCategory({
          id: categoryStore.selectedCategory!.id,
          ...form,
        });
        enqueueSnackbar('Category updated', { variant: 'success' });
      } else {
        await categoryStore.createCategory(form);
        enqueueSnackbar('Category created', { variant: 'success' });
      }
  
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={categoryStore.isFormModalOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
        <DialogTitle>
            {isEdit ? 'Редактировать категорию' : 'Добавить категорию'}
        </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
        <TextField
            label="Название"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
            />
        <TextField
            label="Описание"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            />
        </Stack>
      </DialogContent>
      <DialogActions>
  <Button onClick={handleClose}>Отмена</Button>
  <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
    {isSubmitting
      ? 'Сохранение...'
      : isEdit
        ? 'Обновить'
        : 'Создать'}
  </Button>
</DialogActions>
    </Dialog>
  );
});

export default CategoryFormModal;
