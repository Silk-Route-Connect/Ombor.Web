// src/components/product/ProductReports.tsx
import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Paper,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useStore } from '../../stores/StoreContext';
import { formatUZS } from '../../utils/formatCurrency';

interface SalesEntry {
  date: string;
  units: number;
}
interface PurchaseEntry {
  date: string;
  price: number;
}

const presets = [
  { value: '7', label: '7 дней' },
  { value: '30', label: '30 дней' },
  { value: '180', label: '180 дней' },
  { value: 'custom', label: 'Своя' },
] as const;

export interface ProductReportsProps {
  productId: number;
}

const ProductReports: React.FC<ProductReportsProps> = ({ productId }) => {
  // ─── Hooks (always at top) ───
  const theme = useTheme();
  const { productStore } = useStore();

  const [preset, setPreset] = useState<typeof presets[number]['value']>('7');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    if (preset === 'custom') return;
    const days = Number(preset);
    const now = new Date();
    const from = new Date(now.getTime() - (days - 1) * 86400000);
    setStartDate(from.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  }, [preset]);

  const salesData = useMemo<SalesEntry[]>(() => {
    const arr: SalesEntry[] = [];
    const s = new Date(startDate);
    const e = new Date(endDate);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      arr.push({
        date: d.toISOString().slice(0, 10),
        units: Math.floor(Math.random() * 10),
      });
    }
    return arr;
  }, [startDate, endDate]);

  const product = useMemo(
    () => productStore.products.find((p) => p.id === productId),
    [productId, productStore.products]
  );

  const purchaseHistory = useMemo<PurchaseEntry[]>(() => {
    if (!product) return [];
    const history: PurchaseEntry[] = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now.getTime() - i * 864000000);
      history.push({
        date: d.toISOString().slice(0, 10),
        price: product.incomePrice - i * 5000,
      });
    }
    return history;
  }, [product]);

  // ─── Early return after hooks ───
  if (!product) {
    return null;
  }

  // ─── Compute KPIs ───
  const totalUnits = salesData.reduce((sum, e) => sum + e.units, 0);
  const daysCount = salesData.length;
  const avgDaily = daysCount ? totalUnits / daysCount : 0;
  const daysCover = avgDaily ? Math.floor(product.stock / avgDaily) : Infinity;
  const marginPercent =
    ((product.salePrice - product.incomePrice) / product.salePrice) * 100;
  const totalIncome = totalUnits * product.salePrice;  // новый KPI

  return (
    <Box>
      {/* Date Range Selector */}
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <ToggleButtonGroup
          value={preset}
          exclusive
          size="small"
          onChange={(_, v) => v && setPreset(v)}
        >
          {presets.map((p) => (
            <ToggleButton key={p.value} value={p.value}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {preset === 'custom' && (
          <Stack direction="row" spacing={1}>
            <TextField
              label="С"
              type="date"
              size="small"
              value={startDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setStartDate(e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="По"
              type="date"
              size="small"
              value={endDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEndDate(e.target.value)
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        )}
      </Stack>

      {/* KPI Cards */}
      <Stack direction="row" spacing={2} mb={3}>
        {[
          { label: 'Продано (шт.)', value: totalUnits },
          { label: 'Общий доход', value: `${formatUZS(totalIncome)}` },
          { label: 'Средняя маржа', value: marginPercent.toFixed(1) },
          { label: 'Дней запаса', value: isFinite(daysCover) ? daysCover : '∞' },
          { label: 'Остаток на складе', value: product.stock },
        ].map((kpi) => (
          <Paper
            key={kpi.label}
            elevation={1}
            sx={{
              p: 2,
              flex: 1,
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {kpi.label}
            </Typography>
            <Typography variant="h6">{kpi.value}</Typography>
          </Paper>
        ))}
      </Stack>

      {/* Sales Trend Chart */}
      <Typography variant="h6" gutterBottom>
        Динамика продаж
      </Typography>
      <Box sx={{ width: '100%', height: 240, mb: 3 }}>
        <ResponsiveContainer>
          <LineChart
            data={salesData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) => d.slice(5)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ReTooltip />
            <Line
              type="monotone"
              dataKey="units"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ProductReports;
