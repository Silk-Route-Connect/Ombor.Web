import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionLine } from "models/transaction";
import { formatPrice } from "utils/formatCurrency";

import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface Props {
	items: TransactionLine[];
}

const LineItemsTable: React.FC<Props> = ({ items }) => {
	const { t } = useTranslation();

	return (
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell>{t("fieldProductName")}</TableCell>
					<TableCell align="right">{t("fieldQuantity")}</TableCell>
					<TableCell align="right">{t("fieldUnitPrice")}</TableCell>
					<TableCell align="right">{t("fieldDiscount")}</TableCell>
					<TableCell align="right">{t("fieldTotalPrice")}</TableCell>
				</TableRow>
			</TableHead>

			<TableBody>
				{items.map((it) => (
					<TableRow key={it.id}>
						<TableCell>
							<Link href={`/products/${it.productId}`} underline="hover">
								{it.productName}
							</Link>
						</TableCell>
						<TableCell align="right">{it.quantity}</TableCell>
						<TableCell align="right">{formatPrice(it.unitPrice)}</TableCell>
						<TableCell align="right">{it.discount ? `${it.discount}%` : "-"}</TableCell>
						<TableCell align="right">{formatPrice(it.total)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export default LineItemsTable;
