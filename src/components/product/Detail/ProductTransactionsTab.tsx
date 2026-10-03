import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import MovementKindChip from "components/shared/Chip/MovementKindChip";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import DateCell from "components/shared/Table/cells/DateCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { Measurement, ProductTransaction } from "models/product";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { directionOf, lineNet } from "utils/transactionUtils";

import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

interface ProductTransactionsTabProps {
	transactions: ProductTransaction[];
	measurement: Measurement;
	/** Opens the sale / supply the line belongs to. */
	onOpen: (path: string) => void;
}

/** One row per line; the served `id` is the transaction's, so two lines may share it. */
type TransactionRow = ProductTransaction & { transactionId: number };

/** Line net after the served discount — the amount actually booked (frontend-18). */
const lineTotal = (txn: ProductTransaction): number =>
	lineNet({
		quantity: Math.abs(txn.quantity),
		unitPrice: txn.unitPrice,
		discount: txn.discount,
		discountType: txn.discountType,
	});

const sourcePath = (row: TransactionRow): string =>
	directionOf(row.transactionType) === "Supply"
		? supplyDetailPath(row.transactionId)
		: saleDetailPath(row.transactionId);

/**
 * «Транзакции»: every sale / supply / refund line of the product, newest first;
 * a row opens its document. The served line carries no document number, so
 * this table has no № column (frontend-gaps follow-up).
 */
export const ProductTransactionsTab: React.FC<ProductTransactionsTabProps> = ({
	transactions,
	measurement,
	onOpen,
}) => {
	const { t } = useTranslation();

	const rows = useMemo<TransactionRow[]>(
		() => transactions.map((txn, index) => ({ ...txn, id: index, transactionId: txn.id })),
		[transactions],
	);

	const columns = useMemo<Column<TransactionRow>[]>(
		() => [
			{
				key: "date",
				headerName: t("product.detail.txns.date"),
				sortValue: (r) => Date.parse(r.date),
				renderCell: (r) => <DateCell value={r.date} />,
			},
			{
				key: "partner",
				headerName: t("product.detail.txns.partner"),
				sortValue: (r) => r.partnerName,
				renderCell: (r) => <PartnerLink id={r.partnerId} name={r.partnerName} />,
			},
			{
				key: "type",
				headerName: t("product.detail.txns.type"),
				sortValue: (r) => t(`common.movementKind.${r.transactionType}`),
				renderCell: (r) => <MovementKindChip kind={r.transactionType} />,
			},
			{
				key: "quantity",
				headerName: t("product.detail.table.quantity"),
				align: "right",
				sortValue: (r) => r.quantity,
				renderCell: (r) => (
					<QuantityCell
						value={r.quantity}
						measurement={measurement}
						direction={r.quantity >= 0 ? "in" : "out"}
					/>
				),
			},
			{
				key: "price",
				headerName: t("product.detail.txns.price"),
				align: "right",
				sortValue: (r) => r.unitPrice,
				renderCell: (r) => <MoneyCell value={r.unitPrice} />,
			},
			{
				key: "total",
				headerName: t("product.detail.txns.total"),
				align: "right",
				sortValue: lineTotal,
				renderCell: (r) => <MoneyCell value={lineTotal(r)} main />,
			},
		],
		[t, measurement],
	);

	return (
		<DetailCard
			title={t("product.detail.txns.title")}
			icon={<SwapHorizOutlinedIcon sx={detailCardIconSx} />}
		>
			<DetailTable<TransactionRow>
				rows={rows}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				pagination
				onRowClick={(r) => onOpen(sourcePath(r))}
				empty={
					<TableEmptyState
						icon={<SwapHorizOutlinedIcon />}
						title={t("product.detail.txns.emptyTitle")}
						hint={t("product.detail.txns.emptyBody")}
					/>
				}
			/>
		</DetailCard>
	);
};

export default ProductTransactionsTab;
