import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import { NavLink } from 'react-router-dom';

const drawerWidth = 220;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
];

export default function Sidebar() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            sx={{
              '&.active': {
                backgroundColor: '#e3f2fd',
                borderRadius: '8px',
                marginX: 1,
              },
              marginX: 1,
              borderRadius: '8px',
            }}
          >
            <ListItemIcon sx={{ color: '#1976d2', minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} sx={{ color: '#333' }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
