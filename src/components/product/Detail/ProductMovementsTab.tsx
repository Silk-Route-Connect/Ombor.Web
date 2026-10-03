import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { movementKindLabelKey } from "components/shared/Chip/movementKind";
import MovementKindChip from "components/shared/Chip/MovementKindChip";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import DateCell from "components/shared/Table/cells/DateCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Measurement, ProductMovement } from "models/product";
import { numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

interface ProductMovementsTabProps {
	/** Newest first, as served. */
	movements: ProductMovement[];
	measurement: Measurement;
}

/** A transfer is served as two movements sharing the line id — rows key by position. */
type MovementRow = ProductMovement & { eventId: number };

/**
 * «Движения»: the product's stock ledger across warehouses — one signed
 * quantity column and the served running balance, with the opening-stock band.
 * The opening figure is the remainder before the chronologically oldest
 * movement (balanceAfter − delta), so it holds under any display sort.
 */
export const ProductMovementsTab: React.FC<ProductMovementsTabProps> = ({
	movements,
	measurement,
}) => {
	const { t } = useTranslation();

	const rows = useMemo<MovementRow[]>(
		() => movements.map((m, index) => ({ ...m, id: index, eventId: m.id })),
		[movements],
	);

	const oldest =
		movements.length > 0
			? movements.reduce((a, b) => (Date.parse(a.date) <= Date.parse(b.date) ? a : b))
			: null;
	const openingBalance = oldest ? oldest.balanceAfter - oldest.quantity : 0;

	const columns = useMemo<Column<MovementRow>[]>(
		() => [
			{
				key: "date",
				headerName: t("product.detail.txns.date"),
				sortValue: (m) => Date.parse(m.date),
				renderCell: (m) => <DateCell value={m.date} />,
			},
			{
				key: "warehouse",
				headerName: t("product.detail.table.warehouse"),
				sortValue: (m) => m.warehouseName,
				renderCell: (m) => <WarehouseLink id={m.warehouseId} name={m.warehouseName} />,
			},
			{
				key: "type",
				headerName: t("product.detail.txns.type"),
				sortValue: (m) => t(movementKindLabelKey(m.kind)),
				renderCell: (m) => <MovementKindChip kind={m.kind} />,
			},
			{
				key: "quantity",
				headerName: t("product.detail.table.quantity"),
				align: "right",
				sortValue: (m) => m.quantity,
				renderCell: (m) => (
					<QuantityCell
						value={m.quantity}
						measurement={measurement}
						direction={m.quantity >= 0 ? "in" : "out"}
					/>
				),
			},
			{
				key: "balance",
				headerName: t("product.detail.moves.balance"),
				align: "right",
				sortValue: (m) => m.balanceAfter,
				renderCell: (m) => <QuantityCell value={m.balanceAfter} measurement={measurement} />,
			},
		],
		[t, measurement],
	);

	return (
		<DetailCard
			title={t("product.detail.moves.title")}
			icon={<LayersOutlinedIcon sx={detailCardIconSx} />}
		>
			<DetailTable<MovementRow>
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				empty={
					<TableEmptyState
						icon={<LayersOutlinedIcon />}
						title={t("product.detail.moves.emptyTitle")}
						hint={t("product.detail.moves.emptyBody")}
					/>
				}
				footer={
					<tr className="total">
						<td colSpan={4}>{t("product.detail.moves.opening")}</td>
						<Box component="td" className="r" sx={numericSx}>
							{formatQuantity(openingBalance)}
						</Box>
					</tr>
				}
			/>
		</DetailCard>
	);
};

export default ProductMovementsTab;
