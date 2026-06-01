# Employee & Payroll Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the Employee and Payroll screens to the "Bukhara Teal" design system — page-head + summary cards + design-matching table rows, a new routed employee detail page, and right-side form sheets — reusing the shared `DataTable`.

**Architecture:** Apply the Partners reference pattern (`docs/design-handoff/project/partners.jsx`) adapted to the Employee data model (status, not archive). Introduce small shared primitives (`SummaryCards`, `FormSheet`, `InitialsAvatar`, `SegmentedControl`), derive summaries in pure util functions, express table design through `DataTable` column renderers, and add `/employees/:id` mirroring `WarehouseDetailPage`. Forms keep their existing `react-hook-form`+`zod` hooks; only the container changes from `Dialog` to `FormSheet`.

**Tech Stack:** React 19, TypeScript, MUI 7 (Emotion), MobX, React Router 7, custom `translate()` i18n.

---

## ⚠️ Verification model for this project (READ FIRST)

This repo has **no unit-test suite** (zero `*.test.*` files, no Jest config; the CRA `test` script is unused). **Do not add tests** — it would diverge from the codebase. The real verification loop, per `CLAUDE.md`, is run **on every touched file** at the end of each task:

```bash
# 1. Format (Prettier is enforced as an ESLint error)
node_modules/.bin/prettier --write <files>

# 2. Lint clean (CRA treats warnings as overlay errors)
node_modules/.bin/eslint --max-warnings 0 <files>

# 3. Type-check the file in isolation (npm run type-check is BROKEN — do not use it)
node_modules/.bin/tsc --noEmit --moduleResolution node --module esnext --target ES2020 \
  --jsx react-jsx --esModuleInterop --skipLibCheck --resolveJsonModule \
  --lib ES2022,dom,dom.iterable --baseUrl src <file.tsx>
```

`tsc` may report **one pre-existing false positive** in `src/services/api/BaseApi.ts` — ignore it. JSON files only need steps 1–2 (prettier validates JSON syntax).

**Live preview** (Claude Preview MCP) is used at the integration checkpoints noted in Tasks 8, 9, 11, 12: `preview_start` server `ombor-web` (port 3000) → wait for `/static/js/bundle.js` > ~100KB → log in `+998900000001` / `Password123!` → prefer `preview_inspect` (computed styles) over screenshots for color/font claims.

**i18n rule:** every new key goes into **both** `src/i18n/ru/*.json` and `src/i18n/uz/*.json`. RU is the active default. No inline RU/UZ string literals in components.

**Commit** at the end of every task (branch is already `redesign/employee-payroll`).

---

## File Structure

**New files**
- `src/components/shared/Cards/SummaryCards.tsx` — shared summary-card row (`SummaryCard` + `SummaryCards`).
- `src/components/shared/Dialog/FormSheet/FormSheet.tsx` — right-anchored Drawer form chrome (replaces `Dialog` container).
- `src/components/shared/Avatar/InitialsAvatar.tsx` — deterministic initials avatar.
- `src/components/shared/Inputs/SegmentedControl/SegmentedControl.tsx` — pill toggle (status filter).
- `src/utils/employeeStats.ts` — employee list summary derivation.
- `src/utils/payrollStats.ts` — currency-aware payroll summary derivation.
- `src/components/employee/EmployeeSummary.tsx` — employee list KPI row.
- `src/components/employee/EmployeeDialogs.tsx` — shared form/payment/delete dialogs (mirrors `WarehouseDialogs`).
- `src/components/payroll/PayrollSummary.tsx` — payroll list KPI row.
- `src/pages/EmployeeDetailPage.tsx` — routed detail page.
- `src/components/employee/Detail/EmployeeDetailsTab.tsx` — detail "Детали" tab body (no drawer footer).

**Modified files**
- `src/components/employee/Header/EmployeeHeader.tsx` — page-head + segmented status filter.
- `src/components/employee/Table/employeeTableConfig.tsx` — avatar+name, salary hero, phone renderers.
- `src/components/employee/Form/EmployeeFormModal.tsx` — `Dialog` → `FormSheet`.
- `src/pages/EmployeePage.tsx` — summary, row-click navigation, `EmployeeDialogs`, drop `SidePane`.
- `src/components/payroll/Header/PayrollHeader.tsx` — page-head.
- `src/components/payroll/Table/payrollTableConfig.tsx` — employee avatar cell, amount hero, method chip.
- `src/components/payroll/Form/PayrollFormModal.tsx` — `Dialog` → `FormSheet`.
- `src/pages/PayrollPage.tsx` — summary row.
- `src/App.tsx` — add `/employees/:id` route.
- `src/i18n/{ru,uz}/employee.json`, `src/i18n/{ru,uz}/payroll.json` — new keys.

**Reused as-is:** `components/employee/Chip/EmployeeStatusChip`, `components/employee/SidePane/Tabs/PayrollTab` (drives `selectedEmployeeStore`), `components/shared/Dialog/Form/FormDialogFooter`, `SaveButton`, `PhoneListField`, `EmployeeAutocomplete`, `utils/formatCurrency.formatMoney`.

---

## Task 1: Shared `SummaryCards` primitive

**Files:**
- Create: `src/components/shared/Cards/SummaryCards.tsx`

Extracts the card duplicated in `WarehouseSummary.tsx` and `WarehouseDetailPage.tsx` into a reusable primitive. (Warehouse files are left untouched — out of scope.)

- [ ] **Step 1: Create the component**

```tsx
import React from "react";

import { Box, Paper, Typography } from "@mui/material";

export interface SummaryCardProps {
	icon: React.ReactNode;
	tone: "teal" | "saffron";
	caption: string;
	value: string;
	unit?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ icon, tone, caption, value, unit }) => (
	<Paper
		elevation={1}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: 1.75,
			border: 1,
			borderColor: "divider",
			borderRadius: 1.5,
			p: 2,
		}}
	>
		<Box
			sx={{
				width: 42,
				height: 42,
				flexShrink: 0,
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: tone === "teal" ? "primary.light" : "secondary.light",
				color: tone === "teal" ? "primary.main" : "secondary.dark",
			}}
		>
			{icon}
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				sx={{
					fontSize: "1.5rem",
					fontWeight: 700,
					letterSpacing: "-0.02em",
					lineHeight: 1.1,
					mt: 0.25,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{value}
				{unit && (
					<Typography
						component="span"
						sx={{ ml: 0.5, fontSize: "0.8125rem", fontWeight: 600, color: "text.disabled" }}
					>
						{unit}
					</Typography>
				)}
			</Typography>
		</Box>
	</Paper>
);

/** Responsive row of summary cards. `columns` controls the sm+ column count. */
const SummaryCards: React.FC<{ cards: SummaryCardProps[]; columns?: number }> = ({
	cards,
	columns = 3,
}) => (
	<Box
		sx={{
			display: "grid",
			gap: 2,
			gridTemplateColumns: { xs: "1fr", sm: `repeat(${columns}, 1fr)` },
			mb: 3,
		}}
	>
		{cards.map((card) => (
			<SummaryCard key={card.caption} {...card} />
		))}
	</Box>
);

export default SummaryCards;
```

- [ ] **Step 2: Verify** — run prettier + eslint + isolated tsc on the new file (see "Verification model").
  Expected: prettier writes/no-ops, eslint 0 problems, tsc no errors (ignore the BaseApi.ts false positive).

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Cards/SummaryCards.tsx
git commit -m "feat(shared): add reusable SummaryCards primitive"
```

---

## Task 2: Shared `FormSheet` primitive

**Files:**
- Create: `src/components/shared/Dialog/FormSheet/FormSheet.tsx`

Right-anchored Drawer that provides the design "sheet" chrome (header + scrollable body + sticky footer). It is **presentational only** — the form hook, validation, and discard `ConfirmDialog` stay in the calling modal wrapper. Footer reuses the existing `SaveButton`.

- [ ] **Step 1: Create the component**

```tsx
import React from "react";
import SaveButton from "components/shared/Buttons/SaveButton";
import { translate } from "i18n/i18n";

import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, Drawer, IconButton, LinearProgress, Typography } from "@mui/material";

interface FormSheetProps {
	open: boolean;
	title: string;
	subtitle?: string;
	isSaving: boolean;
	canSave: boolean;
	/** Drawer paper width in px. */
	width?: number;
	onClose: () => void;
	onSave: () => void;
	children: React.ReactNode;
}

const FormSheet: React.FC<FormSheetProps> = ({
	open,
	title,
	subtitle,
	isSaving,
	canSave,
	width = 520,
	onClose,
	onSave,
	children,
}) => (
	<Drawer
		anchor="right"
		open={open}
		onClose={(_, reason) => {
			if (isSaving && reason === "backdropClick") {
				return;
			}
			onClose();
		}}
		ModalProps={{ keepMounted: false }}
		sx={(theme) => ({
			zIndex: theme.zIndex.drawer + 2,
			"& .MuiDrawer-paper": {
				width: { xs: "100%", sm: width },
				maxWidth: "100%",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
			},
		})}
	>
		{/* Header */}
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: 2,
				p: 2.5,
				borderBottom: 1,
				borderColor: "divider",
			}}
		>
			<Box sx={{ flexGrow: 1, minWidth: 0 }}>
				<Typography variant="h2">{title}</Typography>
				{subtitle && (
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			<IconButton
				aria-label={translate("common.close")}
				onClick={onClose}
				disabled={isSaving}
				sx={{ mt: -0.5, mr: -0.5 }}
			>
				<CloseIcon />
			</IconButton>
		</Box>

		{isSaving && (
			<Box sx={{ position: "relative", height: 4 }}>
				<LinearProgress sx={{ position: "absolute", inset: 0 }} />
			</Box>
		)}

		{/* Body */}
		<Box sx={{ flex: 1, overflowY: "auto", p: 2.5 }}>{children}</Box>

		{/* Footer */}
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				gap: 1,
				p: 2,
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			<Button onClick={onClose} disabled={isSaving}>
				{translate("common.cancel")}
			</Button>
			<SaveButton
				disabled={!canSave}
				loading={isSaving}
				tooltip={!canSave ? translate("common.form.completeRequired") : undefined}
				onSave={onSave}
			/>
		</Box>
	</Drawer>
);

export default FormSheet;
```

- [ ] **Step 2: Verify** — prettier + eslint + isolated tsc on the new file.
  Note: confirm `SaveButton` prop names match `components/shared/Buttons/SaveButton` (`disabled`, `loading`, `tooltip`, `onSave`) — these are taken from `FormDialogFooter.tsx`. If `SaveButton` differs, match its actual signature.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Dialog/FormSheet/FormSheet.tsx
git commit -m "feat(shared): add FormSheet drawer form container"
```

---

## Task 3: Shared `InitialsAvatar` primitive

**Files:**
- Create: `src/components/shared/Avatar/InitialsAvatar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import React from "react";

import { Avatar, SxProps, Theme } from "@mui/material";

interface InitialsAvatarProps {
	name: string;
	size?: number;
	sx?: SxProps<Theme>;
}

/** First letters of up to the first two words, uppercased. */
function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) {
		return "?";
	}
	const first = parts[0]?.[0] ?? "";
	const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
	return (first + second).toUpperCase();
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 34, sx }) => (
	<Avatar
		sx={{
			width: size,
			height: size,
			fontSize: size * 0.4,
			fontWeight: 600,
			bgcolor: "primary.light",
			color: "primary.main",
			...sx,
		}}
	>
		{getInitials(name)}
	</Avatar>
);

export default InitialsAvatar;
```

- [ ] **Step 2: Verify** — prettier + eslint + isolated tsc on the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Avatar/InitialsAvatar.tsx
git commit -m "feat(shared): add InitialsAvatar"
```

---

## Task 4: Shared `SegmentedControl` primitive

**Files:**
- Create: `src/components/shared/Inputs/SegmentedControl/SegmentedControl.tsx`

A pill toggle for the employee status filter. Generic over the value type. Always keeps one selection (no null deselect).

- [ ] **Step 1: Create the component**

```tsx
import React from "react";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

interface SegmentedControlProps<T extends string> {
	value: T;
	options: SegmentedOption<T>[];
	onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
	value,
	options,
	onChange,
}: SegmentedControlProps<T>) {
	return (
		<ToggleButtonGroup
			exclusive
			size="small"
			value={value}
			onChange={(_, next) => {
				if (next !== null) {
					onChange(next as T);
				}
			}}
			sx={{
				bgcolor: "grey.50",
				borderRadius: 1,
				p: 0.5,
				gap: 0.5,
				"& .MuiToggleButton-root": {
					border: 0,
					borderRadius: 1,
					px: 1.5,
					py: 0.5,
					textTransform: "none",
					fontWeight: 600,
					fontSize: "0.8125rem",
					color: "text.secondary",
					"&.Mui-selected": {
						bgcolor: "background.paper",
						color: "text.primary",
						boxShadow: 1,
						"&:hover": { bgcolor: "background.paper" },
					},
				},
			}}
		>
			{options.map((opt) => (
				<ToggleButton key={opt.value} value={opt.value}>
					{opt.label}
				</ToggleButton>
			))}
		</ToggleButtonGroup>
	);
}

export default SegmentedControl;
```

- [ ] **Step 2: Verify** — prettier + eslint + isolated tsc on the new file.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/Inputs/SegmentedControl/SegmentedControl.tsx
git commit -m "feat(shared): add SegmentedControl"
```

---

## Task 5: Summary derivation utilities

**Files:**
- Create: `src/utils/employeeStats.ts`
- Create: `src/utils/payrollStats.ts`

- [ ] **Step 1: Create `employeeStats.ts`**

```ts
import { Employee } from "models/employee";

export interface EmployeesSummary {
	total: number;
	active: number;
	onVacation: number;
	terminated: number;
	/**
	 * Sum of salaries of ACTIVE employees. `salary` has no currency in the
	 * model — treated as UZS by assumption (see redesign spec). Isolated here
	 * so it is easy to change when the backend clarifies currency.
	 */
	salaryFund: number;
}

export function getEmployeesSummary(employees: Employee[]): EmployeesSummary {
	const active = employees.filter((e) => e.status === "Active");
	return {
		total: employees.length,
		active: active.length,
		onVacation: employees.filter((e) => e.status === "OnVacation").length,
		terminated: employees.filter((e) => e.status === "Terminated").length,
		salaryFund: active.reduce((sum, e) => sum + (e.salary ?? 0), 0),
	};
}
```

- [ ] **Step 2: Create `payrollStats.ts`**

The summary is currency-aware: amounts are grouped by each payment's primary currency (`components[0].currency`) and **never summed across currencies**.

```ts
import { Payment, PaymentCurrency } from "models/payment";

export interface PayrollSummary {
	/** Current-month total per currency, e.g. { UZS: 12000000, USD: 300 }. */
	paidThisMonth: Partial<Record<PaymentCurrency, number>>;
	/** Number of payments in the current month. */
	paymentCount: number;
	/** Distinct employees paid in the current month. */
	employeeCount: number;
}

function isCurrentMonth(isoDate: string, now: Date): boolean {
	const d = new Date(isoDate);
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function getPayrollSummary(payments: Payment[], now: Date = new Date()): PayrollSummary {
	const thisMonth = payments.filter((p) => isCurrentMonth(p.date, now));

	const paidThisMonth: Partial<Record<PaymentCurrency, number>> = {};
	const employees = new Set<number>();

	for (const p of thisMonth) {
		const currency = p.components[0]?.currency ?? "UZS";
		paidThisMonth[currency] = (paidThisMonth[currency] ?? 0) + p.amount;
		if (p.employeeId != null) {
			employees.add(p.employeeId);
		}
	}

	return {
		paidThisMonth,
		paymentCount: thisMonth.length,
		employeeCount: employees.size,
	};
}

/**
 * Picks the currency with the largest total for the hero figure. Returns null
 * when there were no payments this month. Other currencies (if any) are exposed
 * via `others` so the caller can render an honest "+N more" note.
 */
export function primaryPaidThisMonth(
	paid: Partial<Record<PaymentCurrency, number>>,
): { currency: PaymentCurrency; amount: number; others: PaymentCurrency[] } | null {
	const entries = Object.entries(paid) as [PaymentCurrency, number][];
	if (entries.length === 0) {
		return null;
	}
	entries.sort((a, b) => b[1] - a[1]);
	const [currency, amount] = entries[0];
	return { currency, amount, others: entries.slice(1).map(([c]) => c) };
}
```

- [ ] **Step 3: Verify** — prettier + eslint + isolated tsc on both files.

- [ ] **Step 4: Commit**

```bash
git add src/utils/employeeStats.ts src/utils/payrollStats.ts
git commit -m "feat(utils): add employee & payroll summary derivations"
```

---

## Task 6: i18n keys (ru + uz)

**Files:**
- Modify: `src/i18n/ru/employee.json`, `src/i18n/uz/employee.json`
- Modify: `src/i18n/ru/payroll.json`, `src/i18n/uz/payroll.json`

Add the keys below. **Add the same keys to the matching `uz` file** with UZ-Latin values. (If a `uz` value is uncertain, mirror the RU meaning in UZ-Latin — do not leave it missing; a missing key renders the raw key in the UI.)

- [ ] **Step 1: Add to `src/i18n/ru/employee.json`** (insert before the closing brace)

```json
  "employee.subtitle": "Команда",
  "employee.newButton": "Новый сотрудник",
  "employee.filter.all": "Все",
  "employee.summary.total": "Всего сотрудников",
  "employee.summary.active": "Активные",
  "employee.summary.onVacation": "В отпуске",
  "employee.summary.salaryFund": "Фонд оплаты труда",
  "employee.detail.notFound": "Сотрудник не найден",
  "employee.detail.tab.details": "Детали",
  "employee.detail.tab.payroll": "Зарплаты",
  "employee.detail.totalPaid": "Всего выплачено"
```

- [ ] **Step 2: Add the same keys to `src/i18n/uz/employee.json`** with UZ-Latin values, e.g.:

```json
  "employee.subtitle": "Jamoa",
  "employee.newButton": "Yangi xodim",
  "employee.filter.all": "Barchasi",
  "employee.summary.total": "Jami xodimlar",
  "employee.summary.active": "Faol",
  "employee.summary.onVacation": "Ta'tilda",
  "employee.summary.salaryFund": "Ish haqi fondi",
  "employee.detail.notFound": "Xodim topilmadi",
  "employee.detail.tab.details": "Tafsilotlar",
  "employee.detail.tab.payroll": "Maoshlar",
  "employee.detail.totalPaid": "Jami to'langan"
```

- [ ] **Step 3: Add to `src/i18n/ru/payroll.json`** (before the closing brace)

```json
  "payroll.subtitle": "Выплаты сотрудникам",
  "payroll.newButton": "Новая выплата",
  "payroll.summary.paidThisMonth": "Выплачено за месяц",
  "payroll.summary.count": "Количество выплат",
  "payroll.summary.employees": "Сотрудников оплачено",
  "payroll.summary.moreCurrencies": "+{{count}} валют"
```

- [ ] **Step 4: Add the same keys to `src/i18n/uz/payroll.json`**

```json
  "payroll.subtitle": "Xodimlarga to'lovlar",
  "payroll.newButton": "Yangi to'lov",
  "payroll.summary.paidThisMonth": "Oylik to'langan",
  "payroll.summary.count": "To'lovlar soni",
  "payroll.summary.employees": "To'langan xodimlar",
  "payroll.summary.moreCurrencies": "+{{count}} valyuta"
```

- [ ] **Step 5: Verify** — prettier on all four JSON files; confirm valid JSON.

```bash
node_modules/.bin/prettier --write src/i18n/ru/employee.json src/i18n/uz/employee.json src/i18n/ru/payroll.json src/i18n/uz/payroll.json
```

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ru/employee.json src/i18n/uz/employee.json src/i18n/ru/payroll.json src/i18n/uz/payroll.json
git commit -m "i18n: add employee & payroll redesign keys (ru + uz)"
```

---

## Task 7: Employee list — header, summary, table renderers

**Files:**
- Rewrite: `src/components/employee/Header/EmployeeHeader.tsx`
- Create: `src/components/employee/EmployeeSummary.tsx`
- Rewrite: `src/components/employee/Table/employeeTableConfig.tsx`

- [ ] **Step 1: Rewrite `EmployeeHeader.tsx`** — page-head (title + subtitle + primary button) and a segmented status filter on its own toolbar row.

```tsx
import React from "react";
import SegmentedControl, {
	SegmentedOption,
} from "components/shared/Inputs/SegmentedControl/SegmentedControl";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

interface EmployeeHeaderProps {
	searchValue: string;
	selectedStatus: EmployeeStatus | null;
	onSearch: (value: string) => void;
	onStatusChange: (value: EmployeeStatus | null) => void;
	onCreate: () => void;
}

type StatusFilterValue = "all" | EmployeeStatus;

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
	searchValue,
	selectedStatus,
	onSearch,
	onStatusChange,
	onCreate,
}) => {
	const statusOptions: SegmentedOption<StatusFilterValue>[] = [
		{ value: "all", label: translate("employee.filter.all") },
		...EMPLOYEE_STATUSES.map((status) => ({
			value: status,
			label: translate(`employee.status.${status}`),
		})),
	];

	return (
		<Box sx={{ mb: 3 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: 2,
					mb: 2,
				}}
			>
				<Box>
					<Typography variant="h1">{translate("employeesTitle")}</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
						{translate("employee.subtitle")}
					</Typography>
				</Box>
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
					{translate("employee.newButton")}
				</Button>
			</Box>

			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					gap: 2,
				}}
			>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={translate("searchEmployeesPlaceholder")}
				/>
				<SegmentedControl<StatusFilterValue>
					value={selectedStatus ?? "all"}
					options={statusOptions}
					onChange={(value) => onStatusChange(value === "all" ? null : value)}
				/>
			</Box>
		</Box>
	);
};

export default EmployeeHeader;
```

- [ ] **Step 2: Create `EmployeeSummary.tsx`**

```tsx
import React from "react";
import SummaryCards from "components/shared/Cards/SummaryCards";
import { translate } from "i18n/i18n";
import { formatMoney } from "utils/formatCurrency";
import { EmployeesSummary } from "utils/employeeStats";

import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

const EmployeeSummary: React.FC<{ summary: EmployeesSummary }> = ({ summary }) => (
	<SummaryCards
		columns={4}
		cards={[
			{
				icon: <PeopleAltOutlinedIcon />,
				tone: "teal",
				caption: translate("employee.summary.total"),
				value: summary.total.toString(),
			},
			{
				icon: <CheckCircleOutlineIcon />,
				tone: "teal",
				caption: translate("employee.summary.active"),
				value: summary.active.toString(),
			},
			{
				icon: <BeachAccessOutlinedIcon />,
				tone: "teal",
				caption: translate("employee.summary.onVacation"),
				value: summary.onVacation.toString(),
			},
			{
				icon: <PaymentsOutlinedIcon />,
				tone: "saffron",
				caption: translate("employee.summary.salaryFund"),
				value: formatMoney(summary.salaryFund),
				unit: "UZS",
			},
		]}
	/>
);

export default EmployeeSummary;
```

- [ ] **Step 3: Rewrite `employeeTableConfig.tsx`** — avatar+name (position as muted second line), status chip, salary hero (right-aligned tabular), date, phone.

```tsx
import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { formatMoney } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

import EmployeeStatusChip from "../Chip/EmployeeStatusChip";

export const employeeColumns: Column<Employee>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("employee.name"),
		sortable: true,
		width: "30%",
		renderCell: (employee) => (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
				<InitialsAvatar name={employee.name} />
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
						{employee.name}
					</Typography>
					<Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
						{employee.position}
					</Typography>
				</Box>
			</Box>
		),
	},
	{
		key: "status",
		field: "status",
		headerName: translate("employee.status"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => <EmployeeStatusChip status={employee.status} />,
	},
	{
		key: "salary",
		field: "salary",
		headerName: translate("employee.salary"),
		sortable: true,
		align: "right",
		width: "20%",
		renderCell: (employee) => (
			<Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
				{formatMoney(employee.salary)}
				<Typography component="span" sx={{ ml: 0.5, color: "text.disabled", fontSize: "0.75rem" }}>
					UZS
				</Typography>
			</Typography>
		),
	},
	{
		key: "dateOfEmployment",
		field: "dateOfEmployment",
		headerName: translate("employee.dateOfEmployment"),
		sortable: true,
		width: "17%",
		renderCell: (employee) => new Date(employee.dateOfEmployment).toLocaleDateString(),
	},
	{
		key: "contactInfo",
		field: "contactInfo",
		headerName: translate("employee.phoneNumber"),
		sortable: false,
		width: "18%",
		renderCell: (employee) => employee.contactInfo?.phoneNumbers[0] || translate("common.dash"),
	},
];
```

- [ ] **Step 4: Verify** — prettier + eslint + isolated tsc on all three files.
  Confirm the MUI icon imports exist (`BeachAccessOutlined`, `CheckCircleOutline` are standard `@mui/icons-material` exports).

- [ ] **Step 5: Commit**

```bash
git add src/components/employee/Header/EmployeeHeader.tsx src/components/employee/EmployeeSummary.tsx src/components/employee/Table/employeeTableConfig.tsx
git commit -m "feat(employee): redesign list header, summary cards, table rows"
```

---

## Task 8: Employee list page — summary, navigation, shared dialogs, FormSheet

**Files:**
- Create: `src/components/employee/EmployeeDialogs.tsx`
- Rewrite: `src/components/employee/Form/EmployeeFormModal.tsx`
- Rewrite: `src/pages/EmployeePage.tsx`

- [ ] **Step 1: Convert `EmployeeFormModal.tsx` to `FormSheet`** — keep `useEmployeeForm` and the discard `ConfirmDialog`; swap the `Dialog`/`FormDialogHeader`/`DialogContent`/`FormDialogFooter` chrome for `FormSheet`.

```tsx
import React from "react";
import EmployeeFormFields from "components/employee/Form/EmployeeFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormSheet from "components/shared/Dialog/FormSheet/FormSheet";
import { EmployeeFormPayload, useEmployeeForm } from "hooks/employee/useEmployeeForm";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { dialogTranslation } from "utils/translationUtils";

interface EmployeeFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	employee?: Employee | null;
	onClose: () => void;
	onSave: (payload: EmployeeFormPayload) => void;
}

const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
	isOpen,
	isSaving,
	employee,
	onClose,
	onSave,
}) => {
	const { form, canSave, submit, requestClose, discardOpen, confirmDiscard, cancelDiscard } =
		useEmployeeForm({ isOpen, isSaving, employee, onSave, onClose });

	const title = employee ? translate("employee.editTitle") : translate("employee.createTitle");

	return (
		<>
			<FormSheet
				open={isOpen}
				title={title}
				subtitle={employee?.name}
				isSaving={isSaving}
				canSave={canSave}
				width={560}
				onClose={requestClose}
				onSave={submit}
			>
				<EmployeeFormFields form={form} disabled={isSaving} />
			</FormSheet>

			<ConfirmDialog
				isOpen={discardOpen}
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default EmployeeFormModal;
```

- [ ] **Step 2: Create `EmployeeDialogs.tsx`** — shared form/payment/delete dialogs driven by `employeeStore.dialogMode`, rendered by both the list and the detail page (mirrors `WarehouseDialogs`).

```tsx
import React from "react";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

/**
 * Employee mutation dialogs (create/edit, salary payment, delete), driven by the
 * shared `employeeStore.dialogMode`. Rendered by both the employee list and the
 * employee detail page so either can trigger them.
 */
const EmployeeDialogs: React.FC = observer(() => {
	const { employeeStore, payrollStore } = useStore();
	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	const handleFormSave = (payload: EmployeeFormPayload) =>
		employeeStore.selectedEmployee
			? employeeStore.update({ id: employeeStore.selectedEmployee.id, ...payload })
			: employeeStore.create({ ...payload });

	const handlePayrollSave = async (payload: PayrollFormPayload) => {
		await payrollStore.create(payload);
		employeeStore.closeDialog();
	};

	const handleDeleteConfirmed = () => {
		if (employeeStore.selectedEmployee) {
			employeeStore.delete(employeeStore.selectedEmployee.id);
		}
	};

	return (
		<>
			<EmployeeFormModal
				isOpen={dialogKind === "form"}
				isSaving={employeeStore.isSaving}
				employee={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handleFormSave}
			/>

			<PayrollFormModal
				isOpen={dialogKind === "payment"}
				isSaving={payrollStore.isSaving}
				mode={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handlePayrollSave}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "delete"}
				title={translate("common.deleteTitle")}
				content={translate("employee.deleteConfirmation", {
					employeeName: employeeStore.selectedEmployee?.name ?? "",
				})}
				onConfirm={handleDeleteConfirmed}
				onCancel={employeeStore.closeDialog}
			/>
		</>
	);
});

export default EmployeeDialogs;
```

Note: `PayrollFormModal`'s `mode` prop accepts the selected `Employee` (locks the employee) per `PayrollFormMode` — same value the old `EmployeePage` passed.

- [ ] **Step 3: Rewrite `EmployeePage.tsx`** — summary row, row-click navigation to detail, shared `EmployeeDialogs`; remove the `EmployeeSidePane`.

```tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import EmployeeSummary from "components/employee/EmployeeSummary";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeeTable from "components/employee/Table/EmployeeTable";
import { getEmployeesSummary } from "utils/employeeStats";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box } from "@mui/material";

const EmployeePage: React.FC = observer(() => {
	const { employeeStore } = useStore();
	const navigate = useNavigate();

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const employees = employeeStore.filteredEmployees;
	const summary =
		employeeStore.allEmployees === "loading"
			? null
			: getEmployeesSummary(employeeStore.allEmployees);

	return (
		<Box>
			<EmployeeHeader
				searchValue={employeeStore.searchTerm}
				selectedStatus={employeeStore.filterStatus}
				onSearch={(value) => employeeStore.setSearch(value)}
				onStatusChange={(value) => employeeStore.setFilterStatus(value)}
				onCreate={employeeStore.openCreate}
			/>

			{summary && <EmployeeSummary summary={summary} />}

			<EmployeeTable
				data={employees}
				pagination
				onSort={employeeStore.setSort}
				onEdit={employeeStore.openEdit}
				onDelete={employeeStore.openDelete}
				onPayment={employeeStore.openPayment}
				onViewDetails={(employee) => navigate(`/employees/${employee.id}`)}
			/>

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeePage;
```

Note: the `titleCount` prop was removed from `EmployeeHeader` (count now lives in the summary). `EmployeeTable`'s `onViewDetails` signature is unchanged — it still receives the `Employee`; we navigate instead of opening a drawer.

- [ ] **Step 4: Verify** — prettier + eslint + isolated tsc on the three files.

- [ ] **Step 5: Live preview checkpoint** — `preview_start` `ombor-web`, wait for bundle, log in, go to `/employees`. Confirm: summary cards render with real counts, segmented status filter switches rows, a row click navigates to `/employees/:id` (page will be built next task — a 404/blank is expected until Task 9), the "Новый сотрудник" button opens the right-side `FormSheet`. Use `preview_console_logs` to confirm no runtime errors on the list.

- [ ] **Step 6: Commit**

```bash
git add src/components/employee/EmployeeDialogs.tsx src/components/employee/Form/EmployeeFormModal.tsx src/pages/EmployeePage.tsx
git commit -m "feat(employee): summary row, detail navigation, shared dialogs, form sheet"
```

---

## Task 9: Employee detail page (`/employees/:id`)

**Files:**
- Create: `src/components/employee/Detail/EmployeeDetailsTab.tsx`
- Create: `src/pages/EmployeeDetailPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `EmployeeDetailsTab.tsx`** — the "Детали" body (employment + contact info) adapted from `SidePane/Tabs/DetailsTab.tsx` **without** the drawer footer (actions live in the page header).

```tsx
import React from "react";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { formatDateTime } from "utils/dateUtils";

import EmailIcon from "@mui/icons-material/MailOutline";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import TelegramIcon from "@mui/icons-material/Telegram";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box>
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			{label}
		</Typography>
		<Typography variant="body1" sx={{ fontWeight: 500 }}>
			{children}
		</Typography>
	</Box>
);

const EmployeeDetailsTab: React.FC<{ employee: Employee }> = ({ employee }) => {
	const contact = employee.contactInfo;
	const hasContact =
		!!contact &&
		(contact.phoneNumbers?.length || contact.email || contact.address || contact.telegramAccount);

	return (
		<Paper elevation={1} sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, p: 3 }}>
			<Typography variant="subtitle2" sx={{ color: "text.secondary" }} gutterBottom>
				{translate("employee.details.employmentInfo")}
			</Typography>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
					gap: 2,
					mt: 2,
				}}
			>
				<Field label={translate("employee.position")}>{employee.position}</Field>
				<Field label={translate("employee.dateOfEmployment")}>
					{formatDateTime(employee.dateOfEmployment)}
				</Field>
			</Box>

			{hasContact && (
				<>
					<Divider sx={{ my: 3 }} />
					<Typography variant="subtitle2" sx={{ color: "text.secondary" }} gutterBottom>
						{translate("employee.details.contactInfo")}
					</Typography>
					<Stack spacing={1.5} mt={2}>
						{contact?.phoneNumbers?.map((phone, index) => (
							<Box key={`${phone}-${index}`} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<PhoneIcon fontSize="small" color="action" />
								<Typography variant="body2">{phone}</Typography>
							</Box>
						))}
						{contact?.email && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<EmailIcon fontSize="small" color="action" />
								<Typography variant="body2">{contact.email}</Typography>
							</Box>
						)}
						{contact?.address && (
							<Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
								<HomeIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
								<Typography variant="body2">{contact.address}</Typography>
							</Box>
						)}
						{contact?.telegramAccount && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<TelegramIcon fontSize="small" color="action" />
								<Typography variant="body2">{contact.telegramAccount}</Typography>
							</Box>
						)}
					</Stack>
				</>
			)}
		</Paper>
	);
};

export default EmployeeDetailsTab;
```

- [ ] **Step 2: Create `EmployeeDetailPage.tsx`** — mirrors `WarehouseDetailPage`. Loads the employee, drives `employeeStore.selectedEmployee` from the route (which makes `SelectedEmployeeStore` auto-load payroll history via its reaction), renders header + summary + tabs + `EmployeeDialogs`. The "Зарплаты" tab reuses the existing `PayrollTab`.

```tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeDetailsTab from "components/employee/Detail/EmployeeDetailsTab";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import EmployeeStatusChip from "components/employee/Chip/EmployeeStatusChip";
import PayrollTab from "components/employee/SidePane/Tabs/PayrollTab";
import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import SummaryCards from "components/shared/Cards/SummaryCards";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { useStore } from "stores/StoreContext";
import { formatDateTime } from "utils/dateUtils";
import { formatMoney } from "utils/formatCurrency";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";

const EmployeeDetailPage: React.FC = observer(() => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { employeeStore, selectedEmployeeStore } = useStore();
	const [tab, setTab] = useState<"details" | "payroll">("details");
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

	const employeeId = Number(id);

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const all = employeeStore.allEmployees;
	const isLoading = all === "loading";
	const employee: Employee | null = useMemo(
		() => (all === "loading" ? null : (all.find((e) => e.id === employeeId) ?? null)),
		[all, employeeId],
	);

	// Drive the selected employee (SelectedEmployeeStore reacts and loads payroll history).
	useEffect(() => {
		employeeStore.setSelectedEmployee(employee);
		return () => employeeStore.setSelectedEmployee(null);
	}, [employee, employeeStore]);

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
				<CircularProgress />
			</Box>
		);
	}

	if (!employee) {
		return (
			<Box>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employees")}>
					{translate("employeesTitle")}
				</Button>
				<Typography variant="body2" sx={{ color: "text.secondary", py: 6, textAlign: "center" }}>
					{translate("employee.detail.notFound")}
				</Typography>
			</Box>
		);
	}

	const history = selectedEmployeeStore.payrollHistory;
	const totalPaid =
		history === "loading" ? null : history.reduce((sum, p) => sum + p.amount, 0);

	const closeMenu = () => setMenuAnchor(null);
	const runMenu = (action: () => void) => () => {
		closeMenu();
		action();
	};

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 2,
					mb: 3,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
					<IconButton
						onClick={() => navigate("/employees")}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
					<InitialsAvatar name={employee.name} size={44} />
					<Box sx={{ minWidth: 0 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="h1">{employee.name}</Typography>
							<EmployeeStatusChip status={employee.status} />
						</Box>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
							{employee.position}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Button
						variant="contained"
						startIcon={<PaymentsOutlinedIcon />}
						onClick={() => employeeStore.openPayment(employee)}
					>
						{translate("employee.payroll")}
					</Button>
					<IconButton
						onClick={(e) => setMenuAnchor(e.currentTarget)}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<MoreVertIcon fontSize="small" />
					</IconButton>
					<Menu
						anchorEl={menuAnchor}
						open={Boolean(menuAnchor)}
						onClose={closeMenu}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem onClick={runMenu(() => employeeStore.openEdit(employee))}>
							<ListItemIcon>
								<EditOutlinedIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{translate("common.edit")}</ListItemText>
						</MenuItem>
						<MenuItem
							onClick={runMenu(() => employeeStore.openDelete(employee))}
							sx={{ color: "error.main" }}
						>
							<ListItemIcon>
								<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
							</ListItemIcon>
							<ListItemText>{translate("common.delete")}</ListItemText>
						</MenuItem>
					</Menu>
				</Box>
			</Box>

			{/* Summary */}
			<SummaryCards
				cards={[
					{
						icon: <PaymentsOutlinedIcon />,
						tone: "teal",
						caption: translate("employee.salary"),
						value: formatMoney(employee.salary),
						unit: "UZS",
					},
					{
						icon: <CalendarMonthOutlinedIcon />,
						tone: "teal",
						caption: translate("employee.dateOfEmployment"),
						value: formatDateTime(employee.dateOfEmployment),
					},
					{
						icon: <PaymentsOutlinedIcon />,
						tone: "saffron",
						caption: translate("employee.detail.totalPaid"),
						value: totalPaid === null ? "—" : formatMoney(totalPaid),
						unit: totalPaid === null ? undefined : "UZS",
					},
				]}
			/>

			{/* Tabs */}
			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				sx={{
					mb: 2,
					"& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.9375rem" },
				}}
			>
				<Tab value="details" label={translate("employee.detail.tab.details")} />
				<Tab value="payroll" label={translate("employee.detail.tab.payroll")} />
			</Tabs>

			{tab === "details" ? (
				<EmployeeDetailsTab employee={employee} />
			) : (
				<PayrollTab employeeId={employee.id} />
			)}

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeeDetailPage;
```

Note on `totalPaid` currency: `PayrollTab` already sums `amount` the same way for its footer. This summary card mirrors that existing behavior and labels UZS; if mixed-currency payroll becomes common, revisit to group by currency (same approach as `payrollStats`).

- [ ] **Step 3: Add the route in `src/App.tsx`** — import the page and add the child route directly after the `employees` route.

Add import (with the other page imports):

```tsx
import EmployeeDetailPage from "pages/EmployeeDetailPage";
```

Add route (immediately after `<Route path="employees" element={<EmployeePage />} />`):

```tsx
<Route path="employees/:id" element={<EmployeeDetailPage />} />
```

(`EmployeePage` is imported in `App.tsx` as `EmployeePage`.)

- [ ] **Step 4: Verify** — prettier + eslint + isolated tsc on `EmployeeDetailsTab.tsx`, `EmployeeDetailPage.tsx`, `App.tsx`.

- [ ] **Step 5: Live preview checkpoint** — reload, navigate `/employees` → click a row → lands on `/employees/:id`. Confirm: header (avatar, name, status chip, position, Выплата + ⋮), three summary cards, both tabs (Детали shows contact/employment; Зарплаты shows the employee's payroll history table). Check `preview_console_logs` for errors; confirm payroll history loaded (the reaction fired).

- [ ] **Step 6: Commit**

```bash
git add src/components/employee/Detail/EmployeeDetailsTab.tsx src/pages/EmployeeDetailPage.tsx src/App.tsx
git commit -m "feat(employee): add routed detail page at /employees/:id"
```

---

## Task 10: Payroll list — header, summary, table renderers

**Files:**
- Rewrite: `src/components/payroll/Header/PayrollHeader.tsx`
- Create: `src/components/payroll/PayrollSummary.tsx`
- Rewrite: `src/components/payroll/Table/payrollTableConfig.tsx`

- [ ] **Step 1: Rewrite `PayrollHeader.tsx`** — page-head + toolbar (search + employee autocomplete filter). Keep the autocomplete (long list, not segmented).

```tsx
import React from "react";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, FormControl, Typography } from "@mui/material";

interface PayrollHeaderProps {
	searchValue: string;
	selectedEmployee: Employee | null;
	onSearch: (value: string) => void;
	onEmployeeChange: (employeeId: number | null) => void;
	onCreate: () => void;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({
	searchValue,
	selectedEmployee,
	onSearch,
	onEmployeeChange,
	onCreate,
}) => (
	<Box sx={{ mb: 3 }}>
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				justifyContent: "space-between",
				alignItems: "flex-start",
				gap: 2,
				mb: 2,
			}}
		>
			<Box>
				<Typography variant="h1">{translate("payroll.pageTitle")}</Typography>
				<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
					{translate("payroll.subtitle")}
				</Typography>
			</Box>
			<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
				{translate("payroll.newButton")}
			</Button>
		</Box>

		<Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("payroll.searchPlaceholder")}
			/>
			<FormControl size="small" sx={{ minWidth: 220 }}>
				<EmployeeAutocomplete
					value={selectedEmployee}
					size="small"
					onChange={(employee) => onEmployeeChange(employee?.id || null)}
				/>
			</FormControl>
		</Box>
	</Box>
);

export default PayrollHeader;
```

- [ ] **Step 2: Create `PayrollSummary.tsx`** — currency-aware. Hero shows the dominant currency total; if other currencies are present this month, a `+N валют` note is appended via the `unit` slot.

```tsx
import React from "react";
import SummaryCards from "components/shared/Cards/SummaryCards";
import { translate } from "i18n/i18n";
import { formatMoney } from "utils/formatCurrency";
import { PayrollSummary as PayrollSummaryData, primaryPaidThisMonth } from "utils/payrollStats";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const PayrollSummary: React.FC<{ summary: PayrollSummaryData }> = ({ summary }) => {
	const primary = primaryPaidThisMonth(summary.paidThisMonth);
	const paidValue = primary === null ? "—" : formatMoney(primary.amount);
	const paidUnit =
		primary === null
			? undefined
			: primary.others.length > 0
				? `${primary.currency} · ${translate("payroll.summary.moreCurrencies", {
						count: primary.others.length,
					})}`
				: primary.currency;

	return (
		<SummaryCards
			cards={[
				{
					icon: <PaymentsOutlinedIcon />,
					tone: "saffron",
					caption: translate("payroll.summary.paidThisMonth"),
					value: paidValue,
					unit: paidUnit,
				},
				{
					icon: <ReceiptLongOutlinedIcon />,
					tone: "teal",
					caption: translate("payroll.summary.count"),
					value: summary.paymentCount.toString(),
				},
				{
					icon: <GroupOutlinedIcon />,
					tone: "teal",
					caption: translate("payroll.summary.employees"),
					value: summary.employeeCount.toString(),
				},
			]}
		/>
	);
};

export default PayrollSummary;
```

- [ ] **Step 3: Rewrite the `employeeName`, `amount`, and `method` renderers in `payrollTableConfig.tsx`** — employee avatar cell, amount as tabular hero, method as a chip. Keep the other columns (`paymentId`, `date`, `currency`, `notes`) unchanged. Replace the whole file with:

```tsx
import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import PaymentLink from "components/payment/Links/PaymentLink";
import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Payment } from "models/payment";
import { formatDateTime } from "utils/dateUtils";
import { formatMoney } from "utils/formatCurrency";

import { Box, Chip, Typography } from "@mui/material";

export const PAYROLL_COLUMN_KEYS = [
	"paymentId",
	"employeeName",
	"date",
	"amount",
	"currency",
	"method",
	"notes",
] as const;

export type PayrollColumnKey = (typeof PAYROLL_COLUMN_KEYS)[number];

export const PAYROLL_COLUMNS: Record<PayrollColumnKey, Column<Payment>> = {
	paymentId: {
		key: "id",
		field: "id",
		headerName: translate("payroll.paymentId"),
		sortable: true,
		width: "12%",
		renderCell: (payment) => <PaymentLink id={payment.id} />,
	},

	employeeName: {
		key: "employeeName",
		field: "employeeName",
		headerName: translate("employee.name"),
		sortable: true,
		width: "22%",
		renderCell: (payment) =>
			payment.employeeName ? (
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
					<InitialsAvatar name={payment.employeeName} size={30} />
					<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
						{payment.employeeName}
					</Typography>
				</Box>
			) : (
				translate("common.dash")
			),
	},

	date: {
		key: "date",
		field: "date",
		headerName: translate("payment.date"),
		sortable: true,
		width: "14%",
		renderCell: (payment) => formatDateTime(payment.date),
	},

	amount: {
		key: "amount",
		field: "amount",
		headerName: translate("payment.amount"),
		sortable: true,
		align: "right",
		width: "15%",
		renderCell: (payment) => (
			<Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
				{formatMoney(payment.amount)}
			</Typography>
		),
	},

	currency: {
		key: "currency",
		field: "components",
		headerName: translate("payment.currency"),
		width: "9%",
		renderCell: (payment) => payment.components[0]?.currency ?? translate("common.dash"),
	},

	method: {
		key: "method",
		field: "components",
		headerName: translate("payment.method"),
		width: "13%",
		renderCell: (payment) =>
			payment.components[0]?.method ? (
				<Chip
					label={translate(`payment.method.${payment.components[0].method}`)}
					size="small"
					variant="outlined"
				/>
			) : (
				translate("common.dash")
			),
	},

	notes: {
		key: "notes",
		field: "notes",
		headerName: translate("payment.notes"),
		width: "15%",
		renderCell: (payment) => (
			<Typography
				variant="body2"
				sx={{
					maxWidth: 250,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
				}}
			>
				{payment.notes || translate("common.dash")}
			</Typography>
		),
	},
} as const;
```

Note: there is a `payment.method.AccountBalance` value in the model; confirm `payment.method.AccountBalance` exists in `payment.json` (ru+uz). If missing, add it (`"Со счёта"` / UZ-Latin) in this task's i18n touch-up.

- [ ] **Step 4: Verify** — prettier + eslint + isolated tsc on the three files. Confirm icons (`GroupOutlined`, `ReceiptLongOutlined`) exist in `@mui/icons-material`.

- [ ] **Step 5: Commit**

```bash
git add src/components/payroll/Header/PayrollHeader.tsx src/components/payroll/PayrollSummary.tsx src/components/payroll/Table/payrollTableConfig.tsx
git commit -m "feat(payroll): redesign list header, summary cards, table rows"
```

---

## Task 11: Payroll page summary + FormSheet

**Files:**
- Rewrite: `src/components/payroll/Form/PayrollFormModal.tsx`
- Modify: `src/pages/PayrollPage.tsx`

- [ ] **Step 1: Convert `PayrollFormModal.tsx` to `FormSheet`** — keep `usePayrollForm` and the discard `ConfirmDialog`; move the employee lock/autocomplete + `PayrollFormFields` into the sheet body.

```tsx
import React from "react";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import PayrollFormFields from "components/payroll/Form/PayrollFormFields";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormSheet from "components/shared/Dialog/FormSheet/FormSheet";
import { PayrollFormMode, PayrollFormPayload, usePayrollForm } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { dialogTranslation } from "utils/translationUtils";

import { Box, Typography } from "@mui/material";

interface PayrollFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	mode: PayrollFormMode;
	onClose: () => void;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
}

const PayrollFormModal: React.FC<PayrollFormModalProps> = ({
	isOpen,
	isSaving,
	mode,
	onClose,
	onSave,
}) => {
	const {
		form,
		canSave,
		submit,
		requestClose,
		discardOpen,
		confirmDiscard,
		cancelDiscard,
		selectedEmployee,
		setEmployeeId,
		isEditMode,
		isEmployeeLocked,
	} = usePayrollForm({ isOpen, isSaving, mode, onSave, onClose });

	const title = isEditMode ? translate("payroll.editTitle") : translate("payroll.createTitle");

	return (
		<>
			<FormSheet
				open={isOpen}
				title={title}
				subtitle={isEmployeeLocked ? selectedEmployee?.name : undefined}
				isSaving={isSaving}
				canSave={canSave}
				onClose={requestClose}
				onSave={submit}
			>
				{isEmployeeLocked ? (
					<Box mb={2}>
						<Typography variant="body1" fontWeight={600}>
							{selectedEmployee?.name}
							{selectedEmployee?.position && ` • ${selectedEmployee.position}`}
						</Typography>
					</Box>
				) : (
					<Box mb={2}>
						<EmployeeAutocomplete
							value={selectedEmployee}
							onChange={(e) => setEmployeeId(e?.id ?? 0)}
							required
							error={!!form.formState.errors.employeeId}
							helperText={form.formState.errors.employeeId?.message}
						/>
					</Box>
				)}
				<PayrollFormFields form={form} disabled={isSaving} />
			</FormSheet>

			<ConfirmDialog
				isOpen={discardOpen}
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default PayrollFormModal;
```

- [ ] **Step 2: Add the summary row to `PayrollPage.tsx`** — derive from all payments and render `PayrollSummary` between header and table. Also drop the now-removed `titleCount` prop from the header call.

Add imports:

```tsx
import PayrollSummary from "components/payroll/PayrollSummary";
import { getPayrollSummary } from "utils/payrollStats";
```

Replace the `payrollCount` `useMemo` block with a summary derivation:

```tsx
	const allPayments = payrollStore.filteredPayrollPayments;
	const summary = allPayments === "loading" ? null : getPayrollSummary(allPayments);
```

Update the render so the header no longer passes `titleCount`, and `PayrollSummary` renders when available:

```tsx
			<PayrollHeader
				searchValue={payrollStore.searchTerm}
				selectedEmployee={payrollStore.selectedEmployee}
				onSearch={payrollStore.setSearch}
				onEmployeeChange={payrollStore.setFilterEmployeeId}
				onCreate={payrollStore.openCreate}
			/>

			{summary && <PayrollSummary summary={summary} />}

			<PayrollTable
				data={payrollStore.filteredPayrollPayments}
				onSort={payrollStore.setSort}
				onEdit={payrollStore.openEdit}
				onDelete={payrollStore.openDelete}
			/>
```

Leave the existing `PayrollFormModal` + `ConfirmDialog` (delete) usage and `handleSave`/`handleDeleteConfirmed`/`deleteMessage` logic in `PayrollPage.tsx` unchanged. Remove the now-unused `useMemo` import if `payrollCount` was its only use.

- [ ] **Step 3: Verify** — prettier + eslint + isolated tsc on both files.

- [ ] **Step 4: Live preview checkpoint** — reload `/payrolls`. Confirm: page-head, 3 summary cards (currency-aware "Выплачено за месяц"), restyled table (employee avatar, amount hero, method chip), and "Новая выплата" opens the right-side `FormSheet`. Open an employee's `Выплата` from `/employees/:id` and confirm the sheet shows the locked employee. Check `preview_console_logs`.

- [ ] **Step 5: Commit**

```bash
git add src/components/payroll/Form/PayrollFormModal.tsx src/pages/PayrollPage.tsx
git commit -m "feat(payroll): summary row and form sheet"
```

---

## Task 12: Cleanup, full verification, dead-code check

**Files:**
- Possibly delete: `src/components/employee/SidePane/EmployeeSidePane.tsx` (and `SidePane/Tabs/DetailsTab.tsx` if now unused)
- Verify: all files touched in Tasks 1–11

- [ ] **Step 1: Find remaining references to the old SidePane**

```bash
node_modules/.bin/eslint --max-warnings 0 "src/**/*.{ts,tsx}" 2>&1 | head -40
```

Then search usages:

```bash
git grep -n "EmployeeSidePane" -- src
git grep -n "SidePane/Tabs/DetailsTab" -- src
```

- [ ] **Step 2: Remove dead code** — if `EmployeeSidePane` has no remaining importers, delete it. Keep `SidePane/Tabs/PayrollTab.tsx` (reused by the detail page). Delete `SidePane/Tabs/DetailsTab.tsx` only if `git grep` shows no importers (the detail page uses the new `Detail/EmployeeDetailsTab.tsx`). Do **not** delete anything still referenced.

- [ ] **Step 3: Full lint + format pass on all touched files**

```bash
node_modules/.bin/prettier --write src/components/shared/Cards/SummaryCards.tsx src/components/shared/Dialog/FormSheet/FormSheet.tsx src/components/shared/Avatar/InitialsAvatar.tsx src/components/shared/Inputs/SegmentedControl/SegmentedControl.tsx src/utils/employeeStats.ts src/utils/payrollStats.ts src/components/employee/Header/EmployeeHeader.tsx src/components/employee/EmployeeSummary.tsx src/components/employee/Table/employeeTableConfig.tsx src/components/employee/EmployeeDialogs.tsx src/components/employee/Form/EmployeeFormModal.tsx src/pages/EmployeePage.tsx src/components/employee/Detail/EmployeeDetailsTab.tsx src/pages/EmployeeDetailPage.tsx src/App.tsx src/components/payroll/Header/PayrollHeader.tsx src/components/payroll/PayrollSummary.tsx src/components/payroll/Table/payrollTableConfig.tsx src/components/payroll/Form/PayrollFormModal.tsx src/pages/PayrollPage.tsx

node_modules/.bin/eslint --max-warnings 0 "src/**/*.{ts,tsx}"
```

Expected: eslint exits 0.

- [ ] **Step 4: Final live regression pass** — log in and walk: `/employees` (summary, filter, search, create sheet, edit sheet, delete confirm, row → detail) → `/employees/:id` (header actions, tabs, payroll history) → `/payrolls` (summary, table, create/edit sheet). Confirm `preview_console_logs` is clean and `preview_inspect` shows teal primary + Onest font on new chrome. If the webpack overlay shows a stale Prettier error after a rewrite (known Windows quirk), touch the file or restart the dev server and re-check with `prettier --check` + `eslint`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(employee,payroll): remove dead SidePane code; final lint/format pass"
```

---

## Self-review notes (author)

- **Spec coverage:** Shared primitives (Task 1–4), summary derivations (Task 5), i18n ru+uz (Task 6), Employee list header/summary/table (Task 7), list page nav + dialogs + FormSheet (Task 8), detail page `/employees/:id` (Task 9), Payroll header/summary/table (Task 10), Payroll page summary + FormSheet (Task 11), cleanup/verify (Task 12). All spec sections map to a task.
- **`StatusChip`:** dropped — `EmployeeStatusChip` already exists and is reused (spec's "StatusChip" requirement is satisfied by the existing component).
- **Verification:** adapted to the project's real loop (prettier/eslint/isolated-tsc/preview) because the repo has no test suite — consistent with `CLAUDE.md` and the spec's verification section.
- **Currency honesty:** salary fund labeled UZS (isolated in `employeeStats`); payroll never sums across currencies (`payrollStats` groups per currency; `primaryPaidThisMonth` surfaces the rest).
- **Risk to watch during execution:** verify `SaveButton` prop names (Task 2), `PayrollFormMode` accepting `Employee` (Task 8), and that `payment.method.AccountBalance` has an i18n key (Task 10). Each is called out inline.
