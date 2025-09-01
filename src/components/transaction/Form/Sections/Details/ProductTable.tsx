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
import { translate } from "i18n/i18n";
import { Product } from "models/product";

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

export interface ProductTableProps {
	rows: Product[];
	mode: "Sale" | "Supply";
	selectedId: number | null;
	onSelect(product: Product): void;
	onAdd(product: Product): void;
	onSearchChange?(text: string): void;
}

interface RowProps {
	row: Product;
	disabled: boolean;
	selected: boolean;
	onSelect(): void;
	onAdd(): void;
}

const CELL = { py: 1, px: 1 };

/* ---------- Row component ---------- */
const ProductRow: React.FC<RowProps> = ({ row, disabled, selected, onSelect, onAdd }) => (
	<TableRow
		hover
		selected={selected}
		onClick={onSelect}
		onDoubleClick={disabled ? undefined : onAdd}
		sx={{ cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1 }}
	>
		<TableCell sx={CELL}>{row.name}</TableCell>
		<TableCell sx={CELL}>{row.sku}</TableCell>
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
				disabled={disabled}
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

const MemoRow = memo(
	ProductRow,
	(a, b) =>
		a.selected === b.selected &&
		a.disabled === b.disabled &&
		a.row.id === b.row.id &&
		a.row.salePrice === b.row.salePrice &&
		a.row.supplyPrice === b.row.supplyPrice,
);

export interface ProductTableHandle {
	focus(): void; // parent may call
}

const ProductTable = forwardRef<ProductTableHandle, ProductTableProps>(
	({ rows, mode, selectedId, onSelect, onAdd, onSearchChange }, ref) => {
		const theme = useTheme();
		const containerRef = useRef<HTMLDivElement>(null);

		/* index of highlighted row */
		const [idx, setIdx] = useState(() =>
			selectedId != null ? rows.findIndex((r) => r.id === selectedId) : -1,
		);

		/* keep in sync with external selection */
		useEffect(() => {
			if (selectedId == null) return;
			const i = rows.findIndex((r) => r.id === selectedId);
			if (i !== idx) setIdx(i);
		}, [selectedId, rows, idx]);

		/* auto-scroll selected row into view */
		useEffect(() => {
			if (idx < 0) return;
			const container = containerRef.current;
			if (!container) return;

			const rowEl = container.querySelectorAll("tbody tr")[idx] as HTMLElement | undefined;
			if (!rowEl) return;

			const headerH = (container.querySelector("thead") as HTMLElement | null)?.offsetHeight ?? 0;

			const rowTop = rowEl.offsetTop;
			const rowBottom = rowTop + rowEl.offsetHeight;
			const visibleTop = container.scrollTop + headerH;
			const visibleBottom = container.scrollTop + container.clientHeight;

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
				onSelect(row);
			},
			[onSelect],
		);
		const addFn = useCallback(
			(row: Product, i: number) => () => {
				setIdx(i);
				onSelect(row);
				onAdd(row);
			},
			[onAdd, onSelect],
		);

		/* buffered search typing */
		const buf = useRef("");
		const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

		const keyDown = (e: KeyboardEvent<HTMLDivElement>) => {
			if (!rows.length) return;

			const step = (delta: number) => {
				let next = idx;
				/* skip disabled rows */
				do {
					next = (next + delta + rows.length) % rows.length;
				} while (next !== idx && mode === "Sale" && rows[next].salePrice <= 0);
				setIdx(next);
				onSelect(rows[next]);
			};

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					step(+1);
					return;
				case "ArrowUp":
					e.preventDefault();
					step(-1);
					return;
				case "Enter":
					e.preventDefault();
					if (idx >= 0 && rows[idx].salePrice > 0) onAdd(rows[idx]);
					return;
				default:
					break;
			}

			if (onSearchChange && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				buf.current += e.key;
				clearTimeout(timer.current!);
				timer.current = setTimeout(() => {
					onSearchChange(buf.current);
					buf.current = "";
				}, 300);
			}
		};

		/* expose focus() to parent */
		useImperativeHandle(ref, () => ({
			focus: () => containerRef.current?.focus(),
		}));

		return (
			<TableContainer
				ref={containerRef}
				tabIndex={0}
				aria-label="Product list"
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
						{rows.map((row, i) => {
							const disabled = mode === "Sale" && row.salePrice <= 0;
							return (
								<MemoRow
									key={row.id}
									row={row}
									disabled={disabled}
									selected={i === idx}
									onSelect={selectFn(row, i)}
									onAdd={addFn(row, i)}
								/>
							);
						})}

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
