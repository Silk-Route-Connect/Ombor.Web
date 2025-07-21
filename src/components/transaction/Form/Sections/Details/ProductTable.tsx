import React, {
	forwardRef,
	KeyboardEvent,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import AddIcon from "@mui/icons-material/Add";
import {
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from "@mui/material";
import { translate } from "i18n/i18n";
import { Product } from "models/product";

export interface ProductTableProps {
	rows: Product[];
	selectedId: number | null;
	onSelect(product: Product): void;
	onAdd(product: Product): void;
	onSearchChange?(text: string): void;
}

interface RowProps {
	row: Product;
	selected: boolean;
	onSelect(): void;
	onAdd(): void;
}

const CELL = { py: 1, px: 1 };

/* ---------- Row component ---------- */
const ProductRow: React.FC<RowProps> = ({ row, selected, onSelect, onAdd }) => (
	<TableRow
		hover
		selected={selected}
		onClick={onSelect}
		onDoubleClick={onAdd}
		sx={{ cursor: "pointer" }}
	>
		<TableCell sx={CELL}>{row.name}</TableCell>
		<TableCell sx={CELL}>{row.sku}</TableCell>
		<TableCell sx={CELL} align="right">
			{row.quantityInStock.toLocaleString()}
		</TableCell>
		<TableCell sx={CELL} align="right">
			{row.supplyPrice.toLocaleString()}
		</TableCell>
		<TableCell sx={CELL} align="right">
			{row.salePrice.toLocaleString()}
		</TableCell>
		<TableCell sx={CELL} align="right">
			{row.retailPrice.toLocaleString()}
		</TableCell>
		<TableCell sx={CELL}>
			<IconButton
				disabled={row.quantityInStock <= 0}
				size="small"
				color="primary"
				onClick={(e) => {
					e.stopPropagation();
					onAdd();
				}}
				aria-label={translate("add")}
			>
				<AddIcon fontSize="small" />
			</IconButton>
		</TableCell>
	</TableRow>
);

const MemoRow = memo(ProductRow, (a, b) => a.selected === b.selected && a.row.id === b.row.id);

export interface ProductTableHandle {
	focus(): void; // what parent will call
}

const ProductTable = forwardRef<ProductTableHandle, ProductTableProps>(
	({ rows: rawRows, selectedId, onSelect, onAdd, onSearchChange }, ref) => {
		const theme = useTheme();
		const containerRef = useRef<HTMLDivElement>(null);

		/* one-time number formatting */
		const rows = rawRows.map((r) =>
			Object.assign(r, {
				_supply: r.supplyPrice.toLocaleString(),
				_sale: r.salePrice.toLocaleString(),
				_retail: r.retailPrice.toLocaleString(),
			}),
		);
		console.log(rows.length);

		const [idx, setIdx] = useState(() =>
			selectedId != null ? rows.findIndex((r) => r.id === selectedId) : -1,
		);

		/* keep in sync with external selection */
		useEffect(() => {
			if (selectedId == null) return;
			const i = rows.findIndex((r) => r.id === selectedId);
			if (i !== idx) setIdx(i);
		}, [selectedId, rows, idx]);

		/* auto-scroll */
		useEffect(() => {
			if (idx < 0) return;

			const container = containerRef.current;
			if (!container) return;

			const rowEl = container.querySelectorAll("tr")[idx + 1] as HTMLElement; // +1 skips header
			if (!rowEl) return;

			const header = container.querySelector("thead") as HTMLElement | null;
			const headerH = header?.offsetHeight ?? 0;

			const rowTop = rowEl.offsetTop;
			const rowBottom = rowTop + rowEl.offsetHeight;

			const visibleTop = container.scrollTop + headerH;
			const visibleBottom = container.scrollTop + container.clientHeight;

			/* scroll only when the row is outside the visible window */
			if (rowTop < visibleTop) {
				container.scrollTop = rowTop - headerH;
			} else if (rowBottom > visibleBottom) {
				container.scrollTop = rowBottom - container.clientHeight;
			}
		}, [idx]);

		/* stable handlers */
		const selectFn = useCallback(
			(row: Product, i: number) => () => {
				setIdx(i);
				onSelect(row); // ← sync, no flicker
			},
			[onSelect],
		);
		const addFn = useCallback(
			(row: Product, i: number) => () => {
				setIdx(i); // local highlight
				onSelect(row); // external MobX selection
				onAdd(row); // add to lines
			},
			[onAdd, onSelect],
		);

		/* buffered typing */
		const buf = useRef("");
		const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

		const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
			if (!rows.length) return;

			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const next = Math.min(Math.max(idx + (e.key === "ArrowDown" ? 1 : -1), 0), rows.length - 1);
				setIdx(next);
				onSelect(rows[next]); // ← sync
				return;
			}

			if (e.key === "Enter") {
				e.preventDefault();
				if (idx >= 0 && rows[idx]) onAdd(rows[idx]);
				return;
			}

			if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				buf.current += e.key;
				clearTimeout(timer.current!);
				timer.current = setTimeout(() => {
					onSearchChange?.(buf.current);
					buf.current = "";
				}, 300);
			}
		};

		useImperativeHandle(ref, () => ({
			focus: () => containerRef.current?.focus(),
		}));

		return (
			<TableContainer
				ref={containerRef}
				tabIndex={0}
				onKeyDown={keyDown}
				sx={{
					height: "100%",
					overflowY: "auto",
					outline: "none",
					"& .MuiTableRow-root:hover": { bgcolor: "action.hover" },
				}}
			>
				<Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
					<TableHead>
						<TableRow sx={{ bgcolor: theme.palette.background.paper }}>
							<TableCell sx={{ ...CELL, width: "25%" }}>{translate("product.name")}</TableCell>
							<TableCell sx={{ ...CELL, width: "10%" }}>{translate("product.sku")}</TableCell>
							<TableCell sx={{ ...CELL, width: "15%" }} align="right">
								{translate("product.stock")}
							</TableCell>
							<TableCell sx={{ ...CELL, width: "15%" }} align="right">
								{translate("product.supplyPrice")}
							</TableCell>
							<TableCell sx={{ ...CELL, width: "15%" }} align="right">
								{translate("product.salePrice")}
							</TableCell>
							<TableCell sx={{ ...CELL, width: "15%" }} align="right">
								{translate("product.retailPrice")}
							</TableCell>
							<TableCell sx={{ ...CELL, width: 48 }} />
						</TableRow>
					</TableHead>

					<TableBody>
						{rows.map((row, i) => (
							<MemoRow
								key={row.id}
								row={row}
								selected={i === idx}
								onSelect={selectFn(row, i)}
								onAdd={addFn(row, i)} // note i
							/>
						))}

						{rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={7} sx={{ py: 3 }}>
									<Typography variant="body2" color="text.secondary" align="center">
										{translate("noData")}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		);
	},
);

ProductTable.displayName = "ProductTable";

export default ProductTable;
