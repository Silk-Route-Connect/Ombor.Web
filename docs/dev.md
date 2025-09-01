# Developer Setup Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (you have v23.9.0 ✅)
- VS Code
- Git

### Initial Setup

1. **Clone and Install**

```bash
git clone [repository-url]
cd Ombor.Web
npm install
```

2. **Environment Setup**

```bash
# Copy environment file
cp .env.example .env.development

# Update with your local API URL
# REACT_APP_OMBOR_API_BASE_URL=https://localhost:7015
```

3. **VS Code Extensions** (Required)
   Open VS Code and install:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

4. **Start Development**

```bash
npm start
```

Visit http://localhost:3000

## 📋 Code Style & Quality

### Automatic Features

When you save any file, the following happens automatically:

- ✅ Code formatting (Prettier)
- ✅ Import sorting
- ✅ Unused imports removal
- ✅ ESLint fixes
- ✅ Trailing spaces removal
- ✅ Final newline addition

### Manual Commands

```bash
# Check for issues
npm run lint          # Check ESLint issues
npm run type-check    # Check TypeScript
npm run format:check  # Check formatting

# Fix issues
npm run lint:fix      # Fix ESLint issues
npm run format        # Format all files

# Run all checks (before committing)
npm run lint && npm run type-check && npm run format:check
```

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── shared/         # Shared across features
│   ├── partner/        # Partner-specific components
│   ├── product/        # Product-specific components
│   └── ...
├── hooks/              # Custom React hooks
├── pages/              # Page components (routes)
├── services/           # API services
│   └── api/            # API client modules
├── stores/             # MobX state stores
├── styles/             # Global styles
├── models/             # TypeScript type definitions
├── utils/              # Utility functions
├── i18n/               # Internationalization
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## 💻 Development Workflow

### Creating a New Component

1. Create component file: `src/components/feature/ComponentName.tsx`

2. Use TypeScript and React.FC:

```tsx
import React from "react";
import { Box, Typography } from "@mui/material";

interface ComponentNameProps {
  title: string;
  onAction?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ title, onAction }) => {
  return (
    <Box>
      <Typography>{title}</Typography>
    </Box>
  );
};
```

### Working with MobX Stores

```tsx
import { observer } from "mobx-react-lite";
import { useStores } from "src/hooks/useStores";

export const MyComponent: React.FC = observer(() => {
  const { productStore } = useStores();

  return <div>{productStore.products.length} products</div>;
});
```

### API Services

```tsx
// In services/api/ProductApi.ts
export const getProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get("/products");
  return response.data;
};

// In component
useEffect(() => {
  getProducts().then(setProducts);
}, []);
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🐛 Debugging

### VS Code Debugging

1. Set breakpoints in code
2. Press F5
3. Select "Chrome Debug"
4. Debug will open in new Chrome window

### Browser DevTools

- React DevTools for component inspection
- Network tab for API debugging
- Console for logs (note: console.log generates warnings)

## ⚠️ Common Issues & Solutions

### Issue: "Cannot find module 'src/...'"

**Solution**: Imports use relative paths. Use `../components/Button` not `src/components/Button`

### Issue: ESLint not auto-fixing

**Solution**:

1. Check VS Code bottom-right shows "ESLint"
2. Restart VS Code
3. Run `npx eslint --fix src/YourFile.tsx` manually

### Issue: Prettier not formatting

**Solution**:

1. Check VS Code bottom-right shows "Prettier"
2. Ctrl+Shift+P → "Format Document With..." → Select Prettier
3. Check `.prettierrc` exists

### Issue: TypeScript errors in node_modules

**Solution**: Already fixed with `skipLibCheck: true` in tsconfig.json

## 📝 Code Guidelines

### DO's ✅

- Use TypeScript for all new files
- Use React.FC for functional components
- Use MobX observer for components using stores
- Handle loading and error states
- Use Material-UI components
- Write meaningful variable names
- Add interfaces for props

### DON'Ts ❌

- Don't use `any` type (use `unknown` if needed)
- Don't use console.log in production code
- Don't commit commented code
- Don't use inline styles (use MUI sx prop or SCSS)
- Don't ignore ESLint warnings

## 🔧 VS Code Settings

The project includes VS Code settings that provide:

- Auto-format on save
- ESLint integration
- Import sorting
- Tab size: 2 (using tabs)
- Line endings: LF
- Auto-save on focus change

## 📚 Key Technologies

- **React 19** - UI framework
- **TypeScript 5.3+** - Type safety
- **Material-UI 7** - Component library
- **MobX 6** - State management
- **React Router 7** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **date-fns** - Date utilities

## 🚦 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature

# Create Pull Request
```

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## 📞 Getting Help

1. Check this README first
2. Look for similar code in the project
3. Check MUI documentation: https://mui.com
4. Check React documentation: https://react.dev
5. Ask the team lead

## 🎯 Performance Tips

1. Use React.memo for expensive components
2. Use useMemo/useCallback appropriately
3. Lazy load routes with React.lazy
4. Optimize images (use WebP format)
5. Avoid inline function definitions in renders

## 🔒 Security

- Never commit `.env` files
- Keep dependencies updated
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS in production

## 📋 Checklist Before Committing

- [ ] Code compiles without errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code is formatted (`npm run format:check`)
- [ ] Tests pass (`npm test`)
- [ ] No console.log statements
- [ ] Imports are organized
- [ ] Types are properly defined
- [ ] Component has proper props interface

---
