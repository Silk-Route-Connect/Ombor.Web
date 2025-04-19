// src/components/product/ProductSidePane.tsx
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores/StoreContext';
import ProductReports from './ProductReports';
import { formatUZS } from '../../utils/formatCurrency';
import ProductDetailsGrid from './SidePane/ProductDetail';

const tabLabels = ['Детали', 'Отчёты'];

const ProductSidePane: React.FC = observer(() => {
  const theme = useTheme();
  const { productStore } = useStore();
  const product = productStore.selectedProduct;
  const open = productStore.isSidePaneOpen;
  const [tabIndex, setTabIndex] = useState(0);

  const handleClose = (): void => {
    productStore.closeSidePane();
    setTabIndex(0);
  };

  if (!product) return null;

  // Compute extra detail fields
  const avgMargin = `${(((product.salePrice - product.incomePrice) / product.salePrice) * 100).toFixed(1)}%`;
  const daysCover =
    product.stock > 0
      ? Math.floor(product.stock / ((product.stock / 30) || 1)).toString()
      : '∞';
  const sold30d = 0; // TODO: replace with real sales data

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      // make the drawer sit above your AppBar
      sx={{
        zIndex: theme.zIndex.drawer + 1,
      }}
      PaperProps={{
        sx: {
          width: { xs: '90vw', sm: 900 },
          height: '100%',
          top: 0,
        },
      }}
    >
      {/* Sticky header */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: 'background.paper',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" noWrap>
              {product.name}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 1 }}
        >
          {tabLabels.map((label, i) => (
            <Tab key={i} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {tabIndex === 0 && (
          <ProductDetailsGrid
            product={{
              categoryName: productStore.getCategoryName(product.categoryId),
              sku: product.id.toString(),
              supplier: 'ООО «Ваш поставщик»',
              incomePrice: formatUZS(product.incomePrice),
              salePrice:   formatUZS(product.salePrice),
              stock:       product.stock,
              unit:        product.unit,
              barcode:     product.barcode,
              description: (product as any).description || '—',
              sold30d,
              avgMargin,
              daysCover,
            }}
          />
        )}

        {tabIndex === 1 && <ProductReports productId={product.id} />}
      </Box>
    </Drawer>
  );
});

export default ProductSidePane;
