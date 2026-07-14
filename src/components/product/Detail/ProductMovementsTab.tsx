import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { ProductMovement } from "models/product";
import { numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

import { cardIconSx, detailTableSx, quantityInSx, quantityOutSx } from "./detailTableSx";
import HistoryEmptyState from "./HistoryEmptyState";
import TransactionKindChip from "./TransactionKindChip";

interface ProductMovementsTabProps {
	/** Newest first, as served. */
	movements: ProductMovement[];
}

type SortCol = "date" | "type" | "warehouse" | "in" | "out" | "balance";

const Dash: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		—
	</Box>
);

/**
 * «Движения» per the bundle: the warehouse ledger with the served running
 * balance and the opening-stock summary row. Sortable on every column
 * (defaults to date, newest first). The opening figure is the remainder before
 * the chronologically oldest movement (balanceAfter − delta) — derived by date
 * so it stays correct regardless of the display sort.
 */
export const ProductMovementsTab: React.FC<ProductMovementsTabProps> = ({ movements }) => {
	const { t } = useTranslation();
	const [sortCol, setSortCol] = useState<SortCol>("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const oldest =
		movements.length > 0
			? movements.reduce((a, b) => (Date.parse(a.date) <= Date.parse(b.date) ? a : b))
			: null;
	const openingBalance = oldest ? oldest.balanceAfter - oldest.quantity : 0;

	const rows = useMemo(() => {
		const accessor = (m: ProductMovement): string | number => {
			switch (sortCol) {
				case "date":
					return m.date;
				case "type":
					return m.kind;
				case "warehouse":
					return m.warehouseName;
				case "in":
					return m.quantity > 0 ? m.quantity : 0;
				case "out":
					return m.quantity < 0 ? -m.quantity : 0;
				case "balance":
					return m.balanceAfter;
				default:
					return "";
			}
		};
		const sorted = [...movements].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? sorted.reverse() : sorted;
	}, [movements, sortCol, sortDir]);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	return (
		<DetailCard
			title={t("product.detail.moves.title")}
			icon={<LayersOutlinedIcon sx={cardIconSx} />}
		>
			{movements.length === 0 ? (
				<HistoryEmptyState
					icon={<LayersOutlinedIcon sx={{ fontSize: 22 }} />}
					title={t("product.detail.moves.emptyTitle")}
					body={t("product.detail.moves.emptyBody")}
				/>
			) : (
				<Box component="table" sx={detailTableSx}>
					<thead>
						<tr>
							<DetailSortHeader
								col="date"
								label={t("product.detail.txns.date")}
								active={sortCol === "date"}
								dir={sortDir}
								onSort={onSort}
							/>
							<DetailSortHeader
								col="type"
								label={t("product.detail.txns.type")}
								active={sortCol === "type"}
								dir={sortDir}
								onSort={onSort}
							/>
							<DetailSortHeader
								col="warehouse"
								label={t("product.detail.table.warehouse")}
								active={sortCol === "warehouse"}
								dir={sortDir}
								onSort={onSort}
							/>
							<DetailSortHeader
								col="in"
								label={t("product.detail.moves.in")}
								active={sortCol === "in"}
								dir={sortDir}
								onSort={onSort}
								align="right"
							/>
							<DetailSortHeader
								col="out"
								label={t("product.detail.moves.out")}
								active={sortCol === "out"}
								dir={sortDir}
								onSort={onSort}
								align="right"
							/>
							<DetailSortHeader
								col="balance"
								label={t("product.detail.moves.balance")}
								active={sortCol === "balance"}
								dir={sortDir}
								onSort={onSort}
								align="right"
							/>
						</tr>
					</thead>
					<tbody>
						{rows.map((movement) => (
							<tr key={movement.id}>
								<td>
									<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
										{formatDateTime(movement.date)}
									</Box>
								</td>
								<td>
									<TransactionKindChip kind={movement.kind} />
								</td>
								<td>
									<WarehouseLink id={movement.warehouseId} name={movement.warehouseName} />
								</td>
								<td className="r">
									{movement.quantity > 0 ? (
										<Box component="span" sx={quantityInSx}>
											{formatQuantity(movement.quantity)}
										</Box>
									) : (
										<Dash />
									)}
								</td>
								<td className="r">
									{movement.quantity < 0 ? (
										<Box component="span" sx={quantityOutSx}>
											{formatQuantity(Math.abs(movement.quantity))}
										</Box>
									) : (
										<Dash />
									)}
								</td>
								<td className="r">
									<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
										{formatQuantity(movement.balanceAfter)}
									</Box>
								</td>
							</tr>
						))}
						<tr className="total">
							<td colSpan={2}>
								<Box component="span" sx={{ color: "text.secondary", fontWeight: 600 }}>
									{t("product.detail.moves.opening")}
								</Box>
							</td>
							<td></td>
							<td className="r"></td>
							<td className="r"></td>
							<td className="r">
								<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
									{formatQuantity(openingBalance)}
								</Box>
							</td>
						</tr>
					</tbody>
				</Box>
			)}
		</DetailCard>
	);
};

export default ProductMovementsTab;
