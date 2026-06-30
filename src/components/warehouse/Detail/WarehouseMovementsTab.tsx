import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import DetailCard from "components/shared/Detail/DetailCard";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { detailTableSx } from "components/shared/Detail/detailTableChrome";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import TablePager from "components/shared/Table/TablePager";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import MovementKindChip from "components/warehouse/MovementKindChip";
import {
	WAREHOUSE_MOVEMENT_KINDS,
	WarehouseMovement,
	WarehouseMovementKind,
} from "models/warehouse";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";

import FilterListIcon from "@mui/icons-material/FilterList";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, MenuItem, TextField, Typography } from "@mui/material";

interface WarehouseMovementsTabProps {
	movements: WarehouseMovement[];
}

type SortCol = "date" | "event" | "product" | "counterparty" | "quantity" | "balance";

const ALL_TYPES = "__all__";

const Dash: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * «Движения» tab per the bundle: the warehouse stock ledger with typed event
 * chips, signed +/− quantities (green in / red out) and the served running
 * per-product balance. Searchable by product, filterable by event type, sortable
 * on every column (defaults to date, newest first).
 */
export const WarehouseMovementsTab: React.FC<WarehouseMovementsTabProps> = ({ movements }) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [type, setType] = useState<WarehouseMovementKind | typeof ALL_TYPES>(ALL_TYPES);
	const [sortCol, setSortCol] = useState<SortCol>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const rows = useMemo(() => {
		const filtered = movements.filter((movement) => {
			if (type !== ALL_TYPES && movement.kind !== type) {
				return false;
			}
			if (query.trim() && !matchesSearch(movement.productName, query)) {
				return false;
			}
			return true;
		});
		const accessor = (m: WarehouseMovement): string | number => {
			switch (sortCol) {
				case "date":
					return m.date;
				case "event":
					return t(`warehouse.movement.${m.kind}`);
				case "product":
					return m.productName;
				case "counterparty":
					return m.counterparty ?? "";
				case "quantity":
					return m.quantity;
				case "balance":
					return m.balanceAfter;
				default:
					return "";
			}
		};
		const sorted = [...filtered].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? sorted.reverse() : sorted;
	}, [movements, query, type, sortCol, sortDir, t]);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	const isFiltering = query.trim() !== "" || type !== ALL_TYPES;

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset to the first page whenever the filters or sort change.
	useEffect(() => setPage(0), [query, type, sortCol, sortDir]);

	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<DetailCard>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					p: "14px 16px",
					borderBottom: 1,
					borderColor: "divider",
					flexWrap: "wrap",
				}}
			>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder={t("warehouse.movements.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 240 } }}
				/>
				<TextField
					select
					size="small"
					value={type}
					onChange={(e) => setType(e.target.value as WarehouseMovementKind | typeof ALL_TYPES)}
					sx={{
						width: 210,
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
						"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
					}}
					slotProps={{
						input: {
							startAdornment: (
								<FilterListIcon sx={{ fontSize: 16, color: "text.disabled", mr: "6px" }} />
							),
						},
					}}
				>
					<MenuItem value={ALL_TYPES}>{t("warehouse.movements.allTypes")}</MenuItem>
					{WAREHOUSE_MOVEMENT_KINDS.map((kind) => (
						<MenuItem key={kind} value={kind}>
							{t(`warehouse.movement.${kind}`)}
						</MenuItem>
					))}
				</TextField>
				<Box sx={{ flexGrow: 1 }} />
				<Typography sx={{ ...numericSx, fontSize: 12.5, color: "text.secondary" }}>
					{t("warehouse.movements.count", { value: rows.length })}
				</Typography>
			</Box>

			{rows.length === 0 ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "6px",
						p: "40px 24px 44px",
						textAlign: "center",
					}}
				>
					<LayersOutlinedIcon sx={{ fontSize: 24, color: "text.disabled", mb: "6px" }} />
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
						{isFiltering
							? t("warehouse.movements.emptyFilteredTitle")
							: t("warehouse.movements.emptyTitle")}
					</Typography>
					<Typography
						sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 320, lineHeight: 1.5 }}
					>
						{isFiltering
							? t("warehouse.movements.emptyFilteredBody")
							: t("warehouse.movements.emptyBody")}
					</Typography>
				</Box>
			) : (
				<>
					<Box component="table" sx={detailTableSx}>
						<thead>
							<tr>
								<DetailSortHeader
									col="date"
									label={t("warehouse.movements.date")}
									active={sortCol === "date"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="event"
									label={t("warehouse.movements.event")}
									active={sortCol === "event"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="product"
									label={t("warehouse.movements.product")}
									active={sortCol === "product"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="counterparty"
									label={t("warehouse.movements.counterparty")}
									active={sortCol === "counterparty"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="quantity"
									label={t("warehouse.movements.quantity")}
									active={sortCol === "quantity"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
								<DetailSortHeader
									col="balance"
									label={t("warehouse.movements.balance")}
									active={sortCol === "balance"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
							</tr>
						</thead>
						<tbody>
							{paged.map((movement) => {
								const unit = MEASUREMENT_SHORT[movement.measurement];
								const isIn = movement.quantity > 0;
								return (
									<tr key={movement.id}>
										<td>
											<Box
												component="span"
												sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
											>
												{formatDate(movement.date)}
											</Box>
										</td>
										<td>
											<MovementKindChip kind={movement.kind} />
										</td>
										<td>
											<ProductLink id={movement.productId} name={movement.productName} />
										</td>
										<td>
											{movement.kind === "Transfer" && movement.counterpartyWarehouseId ? (
												<WarehouseLink
													id={movement.counterpartyWarehouseId}
													name={movement.counterparty ?? "—"}
												/>
											) : movement.counterparty ? (
												<Box component="span" sx={{ color: "text.secondary" }}>
													{movement.counterparty}
												</Box>
											) : movement.note ? (
												<Box component="span" sx={{ color: "text.disabled" }}>
													{movement.note}
												</Box>
											) : (
												<Dash />
											)}
										</td>
										<td className="r">
											<Box
												component="span"
												sx={{
													...numericSx,
													fontWeight: 700,
													color: isIn ? "success.main" : "error.main",
												}}
											>
												{isIn ? "+" : "−"}
												{formatQuantity(Math.abs(movement.quantity))} {unit}
											</Box>
										</td>
										<td className="r">
											<Box
												component="span"
												sx={{ ...numericSx, fontWeight: 600, color: designTokens.gray700 }}
											>
												{formatQuantity(movement.balanceAfter)} {unit}
											</Box>
										</td>
									</tr>
								);
							})}
						</tbody>
					</Box>
					<TablePager
						count={rows.length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={setPage}
						onRowsPerPageChange={(value) => {
							setRowsPerPage(value);
							setPage(0);
						}}
					/>
				</>
			)}
		</DetailCard>
	);
};

export default WarehouseMovementsTab;
