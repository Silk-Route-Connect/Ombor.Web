// src/components/product/ProductDetailsGrid.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const Item = styled(Paper)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,           // square corners
  overflow: 'hidden',
}));

const Label = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(0.5, 1),
}));

const Value = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

export interface ProductDetailsGridProps {
  product: {
    categoryName: string;
    sku: string;
    supplier: string;
    incomePrice: string;
    salePrice: string;
    stock: number;
    unit: string;
    barcode: string;
    description: string;
    sold30d: number;
    avgMargin: string;
    daysCover: string;
  };
}

const ProductDetailsGrid: React.FC<ProductDetailsGridProps> = ({ product }) => (
  <Box sx={{ flexGrow: 1 }}>
    {/* no gutter between cells */}
    <Grid container spacing={0} columns={12}>
      {/* 3 cols */}
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Категория</Typography></Label>
          <Value><Typography variant="body2">{product.categoryName}</Typography></Value>
        </Item>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Артикул</Typography></Label>
          <Value><Typography variant="body2">{product.sku}</Typography></Value>
        </Item>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Поставщик</Typography></Label>
          <Value><Typography variant="body2">{product.supplier}</Typography></Value>
        </Item>
      </Grid>

      {/* 2 cols */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Item>
          <Label><Typography variant="caption">Цена закупки</Typography></Label>
          <Value><Typography variant="body2">{product.incomePrice}</Typography></Value>
        </Item>
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Item>
          <Label><Typography variant="caption">Цена продажи</Typography></Label>
          <Value><Typography variant="body2">{product.salePrice}</Typography></Value>
        </Item>
      </Grid>

      {/* 3 cols */}
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Остаток</Typography></Label>
          <Value><Typography variant="body2">{product.stock}</Typography></Value>
        </Item>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Ед. изм.</Typography></Label>
          <Value><Typography variant="body2">{product.unit}</Typography></Value>
        </Item>
      </Grid>

      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Штрихкод</Typography></Label>
          <Value><Typography variant="body2">{product.barcode}</Typography></Value>
        </Item>
      </Grid>

      {/* full width */}
      <Grid size={12}>
        <Item>
          <Label><Typography variant="caption">Описание</Typography></Label>
          <Value><Typography variant="body2">{product.description}</Typography></Value>
        </Item>
      </Grid>

      {/* 3 cols */}
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Продано (30 дн.)</Typography></Label>
          <Value><Typography variant="body2">{product.sold30d}</Typography></Value>
        </Item>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Средняя маржа</Typography></Label>
          <Value><Typography variant="body2">{product.avgMargin}</Typography></Value>
        </Item>
      </Grid>
      <Grid size={{ xs: 12, sm: 4, md: 4 }}>
        <Item>
          <Label><Typography variant="caption">Дней запаса</Typography></Label>
          <Value><Typography variant="body2">{product.daysCover}</Typography></Value>
        </Item>
      </Grid>
    </Grid>
  </Box>
);

export default ProductDetailsGrid;
