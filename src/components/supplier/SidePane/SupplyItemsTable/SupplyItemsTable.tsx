import React from "react";
import { Link, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { translate } from "i18n/i18n";
import { SupplyItem } from "models/supply";
import { formatPrice } from "utils/supplyUtils";

interface SupplyItemsTableProps {
	items: SupplyItem[];
}

const SupplyItemsTable: React.FC<SupplyItemsTableProps> = ({ items }) => (
	<Table size="small">
		<TableHead>
			<TableRow>
				<TableCell>{translate("fieldProductName")}</TableCell>
				<TableCell align="right">{translate("fieldQuantity")}</TableCell>
				<TableCell align="right">{translate("fieldUnitPrice")}</TableCell>
				<TableCell align="right">{translate("fieldTotalPrice")}</TableCell>
			</TableRow>
		</TableHead>
		<TableBody>
			{items.map((item) => (
				<TableRow key={item.id}>
					<TableCell>
						<Link href={`/products/${item.productId}`} underline="hover">
							{item.productName}
						</Link>
					</TableCell>
					<TableCell align="right">{item.quantity}</TableCell>
					<TableCell align="right">{formatPrice(item.unitPrice)}</TableCell>
					<TableCell align="right">{formatPrice(item.quantity * item.unitPrice)}</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export default SupplyItemsTable;
