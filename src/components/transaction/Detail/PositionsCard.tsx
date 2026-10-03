import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NoValue from "components/shared/Table/cells/NoValue";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TransactionLine } from "models/transaction";
import { designTokens } from "theme";
import { discountLabel } from "utils/transactionUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

/** Base quantity with its unit; a line entered in packs adds the pack count below. */
const LineQuantity: React.FC<{ line: TransactionLine }> = ({ line }) => {
	const { t } = useTranslation();
	return (
		<>
			<QuantityCell value={line.quantity} unit={line.unit} />
			{line.packageSize && line.packageSize > 0 ? (
				<Box sx={{ fontSize: 12, color: "text.secondary" }}>
					{Math.round(line.quantity / line.packageSize)} {t("transaction.new.line.packShort")}
				</Box>
			) : null}
		</>
	);
};

/**
 * The document's lines — Товар · Кол-во · Цена · Скидка · Сумма — on the shared
 * detail table, with the document's summary footer below.
 */
export const PositionsCard: React.FC<{
	lines: TransactionLine[];
	footer?: React.ReactNode;
	count: number;
}> = ({ lines, footer, count }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<TransactionLine>[]>(
		() => [
			{
				key: "product",
				headerName: t("transaction.detail.col.product"),
				sortValue: (l) => l.productName,
				renderCell: (l) => <ProductLink id={l.productId} name={l.productName} />,
			},
			{
				key: "quantity",
				headerName: t("transaction.detail.col.qty"),
				align: "right",
				sortValue: (l) => l.quantity,
				renderCell: (l) => <LineQuantity line={l} />,
			},
			{
				key: "unitPrice",
				headerName: t("transaction.detail.col.unitPrice"),
				align: "right",
				sortValue: (l) => l.unitPrice,
				renderCell: (l) => <MoneyCell value={l.unitPrice} />,
			},
			{
				key: "discount",
				headerName: t("transaction.detail.col.discount"),
				align: "right",
				sortValue: (l) => l.discount,
				renderCell: (l) => {
					const label = discountLabel(l);
					return label ? (
						<Box component="span" sx={{ color: designTokens.saffron700, fontWeight: 600 }}>
							{label}
						</Box>
					) : (
						<NoValue />
					);
				},
			},
			{
				key: "total",
				headerName: t("transaction.detail.col.lineTotal"),
				align: "right",
				sortValue: (l) => l.total,
				renderCell: (l) => <MoneyCell value={l.total} main />,
			},
		],
		[t],
	);

	return (
		<DetailCard
			title={t("transaction.detail.positions")}
			icon={<Inventory2OutlinedIcon sx={detailCardIconSx} />}
			count={count}
		>
			<DetailTable<TransactionLine> rows={lines} columns={columns} />
			{footer}
		</DetailCard>
	);
};

export default PositionsCard;
