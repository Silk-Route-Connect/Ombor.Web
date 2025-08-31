import React from "react";
import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { translate } from "i18n/i18n";
import { TransactionLine } from "models/transaction";
import { formatPrice } from "utils/supplyUtils";

interface Props {
	items: TransactionLine[];
}

const LineItemsTable: React.FC<Props> = ({ items }) => (
	<Table size="small">
		<TableHead>
			<TableRow>
				<TableCell>{translate("fieldProductName")}</TableCell>
				<TableCell align="right">{translate("fieldQuantity")}</TableCell>
				<TableCell align="right">{translate("fieldUnitPrice")}</TableCell>
				<TableCell align="right">{translate("fieldDiscount")}</TableCell>
				<TableCell align="right">{translate("fieldTotalPrice")}</TableCell>
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

export default LineItemsTable;
