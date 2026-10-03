import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import DetailTable from "components/shared/Detail/DetailTable";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { Transfer, TransferLine, transferUnits } from "models/transfer";
import { numericSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";

import { Box } from "@mui/material";

type LineRow = TransferLine & { id: number };

/** The transfer's lines (товар · артикул · количество) with the positions / units band. */
export const TransferLinesTable: React.FC<{ transfer: Transfer }> = ({ transfer }) => {
	const { t } = useTranslation();
	const rows = useMemo<LineRow[]>(
		() => transfer.lines.map((line, index) => ({ ...line, id: index })),
		[transfer.lines],
	);

	const columns = useMemo<Column<LineRow>[]>(
		() => [
			{
				key: "product",
				headerName: t("transfer.table.product"),
				sortValue: (l) => l.productName,
				renderCell: (l) => <ProductLink id={l.productId} name={l.productName} />,
			},
			{
				key: "sku",
				headerName: t("transfer.table.sku"),
				sortValue: (l) => l.sku,
				renderCell: (l) => <SkuCell sku={l.sku} />,
			},
			{
				key: "quantity",
				headerName: t("transfer.table.quantity"),
				align: "right",
				sortValue: (l) => l.quantity,
				renderCell: (l) => <QuantityCell value={l.quantity} measurement={l.measurement} />,
			},
		],
		[t],
	);

	return (
		<Box
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.md}px`,
				overflow: "hidden",
			}}
		>
			<DetailTable<LineRow>
				rows={rows}
				columns={columns}
				footer={
					<tr className="total">
						<td colSpan={2}>
							{t("transfer.detail.totalPositions", { positions: transfer.lines.length })}
						</td>
						<Box component="td" className="r" sx={numericSx}>
							{formatQuantity(transferUnits(transfer))}
						</Box>
					</tr>
				}
			/>
		</Box>
	);
};

export default TransferLinesTable;
