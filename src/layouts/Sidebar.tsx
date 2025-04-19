// src/components/layouts/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  Inventory2Outlined as ProductionIcon,
  SwapHorizOutlined as TransactionsIcon,
  GroupOutlined as PartnersIcon,
  MonetizationOnOutlined as FinanceIcon,
  PeopleAltOutlined as EmployeeIcon,
  BarChartOutlined as ReportsIcon,
  SettingsOutlined as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { NavLink, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar() {
  const [prodOpen, setProdOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [transOpen, setTransOpen] = useState(false);
  const [finOpen, setFinOpen] = useState(false);
  const [hrOpen, setHrOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/categories') ||
        path.startsWith('/products')   ||
        path.startsWith('/tags')
    ) setProdOpen(true);

    if (path.startsWith('/customers') ||
        path.startsWith('/suppliers')
    ) setPartnersOpen(true);

    if (path.startsWith('/sales') ||
        path.startsWith('/supplies')
    ) setTransOpen(true);

    if (path.startsWith('/finances')) setFinOpen(true);
    if (path.startsWith('/employees') ||
        path.startsWith('/payroll')
    ) setHrOpen(true);
  }, [location.pathname]);

  const commonSx = {
    marginX: 1,
    borderRadius: '8px',
    '&.active': { backgroundColor: '#e3f2fd' },
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <List>

        {/* Dashboard */}
        <ListItemButton component={NavLink} to="/" sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* Продукция */}
        <ListItemButton onClick={() => setProdOpen(!prodOpen)} sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <ProductionIcon />
          </ListItemIcon>
          <ListItemText primary="Продукция" />
          {prodOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={prodOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={NavLink} to="/categories" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Категории" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/products" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Товары" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/tags" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Теги" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Partners */}
        <ListItemButton onClick={() => setPartnersOpen(!partnersOpen)} sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <PartnersIcon />
          </ListItemIcon>
          <ListItemText primary="Партнёры" />
          {partnersOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={partnersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={NavLink} to="/customers" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Клиенты" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/suppliers" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Поставщики" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Transactions */}
        <ListItemButton onClick={() => setTransOpen(!transOpen)} sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <TransactionsIcon />
          </ListItemIcon>
          <ListItemText primary="Транзакции" />
          {transOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={transOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={NavLink} to="/sales" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Продажи" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/supplies" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Поставки" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Финансы */}
        <ListItemButton onClick={() => setFinOpen(!finOpen)} sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <FinanceIcon />
          </ListItemIcon>
          <ListItemText primary="Финансы" />
          {finOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={finOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={NavLink} to="/finances/incomes" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Доходы" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/finances/expenses" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Расходы" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/finances/debts" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Долги" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Кадры */}
        <ListItemButton onClick={() => setHrOpen(!hrOpen)} sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <EmployeeIcon />
          </ListItemIcon>
          <ListItemText primary="Кадры" />
          {hrOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={hrOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={NavLink} to="/employees" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Сотрудники" />
            </ListItemButton>
            <ListItemButton component={NavLink} to="/payroll" sx={{ pl: 4, ...commonSx }}>
              <ListItemText primary="Зарплаты" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Отчёты */}
        <ListItemButton component={NavLink} to="/reports" sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <ReportsIcon />
          </ListItemIcon>
          <ListItemText primary="Отчёты" />
        </ListItemButton>

        {/* Настройки */}
        <ListItemButton component={NavLink} to="/settings" sx={commonSx}>
          <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Настройки" />
        </ListItemButton>

      </List>
    </Drawer>
  );
}
