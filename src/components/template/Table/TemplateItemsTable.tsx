import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import DetailTable from "components/shared/Detail/DetailTable";
import UzsUnit from "components/shared/Money/UzsUnit";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { Template } from "models/template";
import { numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { lineNet } from "utils/transactionUtils";

import { Box, Paper } from "@mui/material";

import { templateTotal } from "./templateTableConfigs";

type TemplateItem = Template["items"][number];

/** The expand-row panel: the template's lines with a positions / total band. */
export const TemplateItemsTable: React.FC<{ template: Template }> = ({ template }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<TemplateItem>[]>(
		() => [
			{
				key: "product",
				headerName: t("template.itemsTable.product"),
				sortValue: (it) => it.productName,
				renderCell: (it) => <ProductLink id={it.productId} name={it.productName} />,
			},
			{
				key: "sku",
				headerName: t("template.itemsTable.sku"),
				sortValue: (it) => it.sku,
				renderCell: (it) => <SkuCell sku={it.sku} />,
			},
			{
				key: "quantity",
				headerName: t("template.itemsTable.quantity"),
				align: "right",
				sortValue: (it) => it.quantity,
				renderCell: (it) => (
					<>
						<QuantityCell value={it.quantity} measurement={it.measurement} />
						{it.packageSize && it.packageSize > 0 ? (
							<Box sx={{ fontSize: 12, color: "text.secondary" }}>
								{Math.round(it.quantity / it.packageSize)} {t("transaction.new.line.packShort")}
							</Box>
						) : null}
					</>
				),
			},
			{
				key: "unitPrice",
				headerName: t("template.itemsTable.unitPrice"),
				align: "right",
				sortValue: (it) => it.unitPrice,
				renderCell: (it) => <MoneyCell value={it.unitPrice} />,
			},
			{
				key: "lineTotal",
				headerName: t("template.itemsTable.lineTotal"),
				align: "right",
				sortValue: lineNet,
				renderCell: (it) => <MoneyCell value={lineNet(it)} main />,
			},
		],
		[t],
	);

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: `${radius.lg}px`, overflow: "hidden" }}
		>
			<DetailTable<TemplateItem>
				rows={template.items}
				columns={columns}
				footer={
					<tr className="total">
						<td colSpan={4}>{t("template.itemsTable.footer", { count: template.items.length })}</td>
						<Box component="td" className="r" sx={numericSx}>
							{formatCurrency(templateTotal(template))}
							<UzsUnit />
						</Box>
					</tr>
				}
			/>
		</Paper>
	);
};

export default TemplateItemsTable;
