import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import MovementKindChip from "components/shared/Chip/MovementKindChip";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { Measurement, ProductTransaction } from "models/product";
import { transactionDetailPath } from "routing/paths";
import { formatDate } from "utils/dateUtils";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { entityNumberSortValue, formatOptionalNumber } from "utils/formatEntityId";
import { measurementShort } from "utils/productUtils";
import { directionOf, isRefundType, lineNet } from "utils/transactionUtils";

import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Theme, useMediaQuery } from "@mui/material";

interface ProductTransactionsTabProps {
	productName: string;
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

/**
 * Stock goes in on a supply and a sale refund, out on a sale and a supply
 * refund — read from the document type (the served line quantity is unsigned).
 */
const stockDirection = (row: TransactionRow): "in" | "out" =>
	(directionOf(row.transactionType) === "Supply") !== isRefundType(row.transactionType)
		? "in"
		: "out";

const sourcePath = (row: TransactionRow): string =>
	transactionDetailPath(row.transactionType, row.transactionId);

/**
 * «Продажи и поставки»: every sale / supply / refund line of the product, newest
 * first; the № (or the whole row) opens its document. «Цена» shows only on wide
 * screens (xl) — beside the rail at 1366–1440px the seven columns would scroll
 * sideways; the CSV and the document keep it.
 */
export const ProductTransactionsTab: React.FC<ProductTransactionsTabProps> = ({
	productName,
	transactions,
	measurement,
	onOpen,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<TransactionRow>();
	const showPrice = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"), { noSsr: true });

	const rows = useMemo<TransactionRow[]>(
		() => transactions.map((txn, index) => ({ ...txn, id: index, transactionId: txn.id })),
		[transactions],
	);

	const columns = useMemo<Column<TransactionRow>[]>(() => {
		const all: Column<TransactionRow>[] = [
			{
				key: "number",
				headerName: t("product.detail.txns.number"),
				sortValue: (r) => entityNumberSortValue(r.transactionNumber),
				renderCell: (r) => <DocNumberCell number={r.transactionNumber} to={sourcePath(r)} />,
			},
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
				sortValue: (r) => (stockDirection(r) === "in" ? 1 : -1) * Math.abs(r.quantity),
				renderCell: (r) => (
					<QuantityCell
						value={Math.abs(r.quantity)}
						measurement={measurement}
						direction={stockDirection(r)}
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
		];
		return showPrice ? all : all.filter((col) => col.key !== "price");
	}, [t, measurement, showPrice]);

	const handleExport = () => {
		exportToCsv<TransactionRow>(
			`product_${productName}_transactions_${csvDateStamp()}`,
			[
				{
					header: t("product.detail.txns.number"),
					value: (r) => formatOptionalNumber(r.transactionNumber, t("common.noNumber")),
				},
				{ header: t("product.detail.txns.date"), value: (r) => formatDate(r.date) },
				{ header: t("product.detail.txns.partner"), value: (r) => r.partnerName },
				{
					header: t("product.detail.txns.type"),
					value: (r) => t(`common.movementKind.${r.transactionType}`),
				},
				{
					header: t("product.detail.table.quantity"),
					value: (r) => (stockDirection(r) === "in" ? 1 : -1) * Math.abs(r.quantity),
				},
				{ header: t("warehouse.stock.unit"), value: () => measurementShort(t, measurement) },
				{ header: t("product.detail.txns.price"), value: (r) => r.unitPrice },
				{ header: t("product.detail.txns.total"), value: lineTotal },
			],
			tableOrder.apply(rows),
		);
	};

	return (
		<DetailTableCard exportCsv={{ onExport: handleExport, rowCount: rows.length }}>
			<DetailTable<TransactionRow>
				exportOrder={tableOrder}
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
		</DetailTableCard>
	);
};

export default ProductTransactionsTab;
