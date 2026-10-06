import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { formatCurrency } from "utils/formatCurrency";
import { InvoiceLine } from "utils/invoiceDocument";

import { Box } from "@mui/material";

import PrintTable, { PrintColumn } from "./PrintTable";

/** The goods of a printed invoice: № · Товар · Кол-во · Цена · Скидка · Сумма. */
export const InvoiceLinesTable: React.FC<{ lines: InvoiceLine[] }> = ({ lines }) => {
	const { t } = useTranslation();

	const columns = useMemo<PrintColumn<InvoiceLine>[]>(
		() => [
			{ key: "index", header: t("print.col.index"), width: "5%", render: (_l, i) => i + 1 },
			{
				key: "product",
				header: t("print.col.product"),
				render: (l) => (
					<>
						{l.productName}
						{l.sku && (
							<Box sx={{ fontSize: 11, color: "text.secondary" }}>
								{t("print.col.sku", { sku: l.sku })}
							</Box>
						)}
					</>
				),
			},
			{
				key: "quantity",
				header: t("print.col.qty"),
				align: "right",
				render: (l) => (
					<>
						<QuantityCell value={l.quantity} measurement={l.measurement} />
						{l.packs !== undefined && (
							<Box sx={{ fontSize: 11, color: "text.secondary" }}>
								{l.packs} {t("transaction.new.line.packShort")}
							</Box>
						)}
					</>
				),
			},
			{
				key: "price",
				header: t("print.col.price"),
				align: "right",
				render: (l) => formatCurrency(l.unitPrice),
			},
			{
				key: "discount",
				header: t("print.col.discount"),
				align: "right",
				render: (l) => l.discount ?? "—",
			},
			{
				key: "total",
				header: t("print.col.total"),
				align: "right",
				render: (l) => formatCurrency(l.total),
			},
		],
		[t],
	);

	return (
		<PrintTable<InvoiceLine>
			columns={columns}
			rows={lines}
			rowKey={(l) => l.key}
			emptyText={t("print.invoice.noLines")}
		/>
	);
};

export default InvoiceLinesTable;
