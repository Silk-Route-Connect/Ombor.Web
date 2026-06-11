import React from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import { TemplateItem } from "models/template";

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

interface TemplateItemsTableProps {
	items: TemplateItem[];
}

const TemplateItemsTable: React.FC<TemplateItemsTableProps> = ({ items }) => {
	const { t } = useTranslation();

	return (
		<Box>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>{t("template.item.product")}</TableCell>
						<TableCell align="right">{t("template.item.unitPrice")}</TableCell>
						<TableCell align="right">{t("template.item.quantity")}</TableCell>
						<TableCell align="right">{t("template.item.discount")}</TableCell>
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
};

export default TemplateItemsTable;
