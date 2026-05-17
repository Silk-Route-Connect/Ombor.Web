import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import { translate } from "i18n/i18n";
import { StockTransferItemDetails } from "models/stockTransfer";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface StockTransferItemsTableProps {
	items: StockTransferItemDetails[];
}

const StockTransferItemsTable: React.FC<StockTransferItemsTableProps> = ({ items }) => (
	<Box>
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell>{translate("stockTransfer.items.product")}</TableCell>
					<TableCell>{translate("stockTransfer.items.sku")}</TableCell>
					<TableCell align="right">{translate("stockTransfer.items.quantity")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{items.map((item) => (
					<TableRow key={item.productId}>
						<TableCell>
							<ProductLink id={item.productId} name={item.productName} />
						</TableCell>
						<TableCell>{item.productSku}</TableCell>
						<TableCell align="right">{item.quantity}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	</Box>
);

export default StockTransferItemsTable;
