import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import { detailTableSx } from "components/shared/Detail/detailTableChrome";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import TablePager from "components/shared/Table/TablePager";
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

const ALL_TYPES = "__all__";

const Dash: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * «Движения» tab per the bundle: the warehouse stock ledger with typed event
 * chips, signed +/− quantities (green in / red out) and the served running
 * per-product balance. Searchable by product and filterable by event type.
 */
export const WarehouseMovementsTab: React.FC<WarehouseMovementsTabProps> = ({ movements }) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [type, setType] = useState<WarehouseMovementKind | typeof ALL_TYPES>(ALL_TYPES);

	const rows = useMemo(
		() =>
			movements.filter((movement) => {
				if (type !== ALL_TYPES && movement.kind !== type) {
					return false;
				}
				if (query.trim() && !matchesSearch(movement.productName, query)) {
					return false;
				}
				return true;
			}),
		[movements, query, type],
	);

	const isFiltering = query.trim() !== "" || type !== ALL_TYPES;

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

	// Reset to the first page whenever the filters change.
	useEffect(() => setPage(0), [query, type]);

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
								<Box component="th">{t("warehouse.movements.date")}</Box>
								<Box component="th">{t("warehouse.movements.event")}</Box>
								<Box component="th">{t("warehouse.movements.product")}</Box>
								<Box component="th">{t("warehouse.movements.counterparty")}</Box>
								<Box component="th" className="r">
									{t("warehouse.movements.quantity")}
								</Box>
								<Box component="th" className="r">
									{t("warehouse.movements.balance")}
								</Box>
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
											<Box component="span" sx={{ fontWeight: 600 }}>
												{movement.productName}
											</Box>
										</td>
										<td>
											{movement.counterparty ? (
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
