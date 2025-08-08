import React from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import ProductLink from "components/shared/Links/ProductLink";
import { translate } from "i18n/i18n";
import { TemplateItem } from "models/template";

interface TemplateItemsTableProps {
	items: TemplateItem[];
}

const TemplateItemsTable: React.FC<TemplateItemsTableProps> = ({ items }) => (
	<Box>
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell>{translate("template.item.product")}</TableCell>
					<TableCell align="right">{translate("template.item.unitPrice")}</TableCell>
					<TableCell align="right">{translate("template.item.quantity")}</TableCell>
					<TableCell align="right">{translate("template.item.discount")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{items.map((item) => (
					<TableRow key={item.id}>
						<TableCell>
							<ProductLink id={item.productId} name={item.productName} />
						</TableCell>
						<TableCell align="right">{item.unitPrice.toLocaleString()}</TableCell>
						<TableCell align="right">{item.quantity}</TableCell>
						<TableCell align="right">
							{item.discount != null ? item.discount.toLocaleString() : "-"}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	</Box>
);

export default TemplateItemsTable;
