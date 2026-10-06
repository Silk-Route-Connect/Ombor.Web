import React from "react";
import { useTranslation } from "react-i18next";
import { Product } from "models/product";
import { numericSx } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";

import { Box, Typography } from "@mui/material";

/**
 * A transfer product-picker dropdown row: name + SKU, with the available stock
 * at the source warehouse on the right — color-coded out (red) / low (amber) /
 * ok (green), mirroring the POS product search. `stock` is the source-warehouse
 * quantity the modal already computes for the selected «Откуда» warehouse.
 */
const TransferProductOption: React.FC<{ product: Product; stock: number }> = ({
	product,
	stock,
}) => {
	const { t } = useTranslation();
	const unit = measurementShort(t, product.measurement);
	const color = stock === 0 ? "error.main" : stock < 15 ? "warning.dark" : "success.main";

	return (
		<>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
					{product.name}
				</Typography>
				<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }} noWrap>
					{product.sku}
				</Typography>
			</Box>
			<Typography sx={{ ...numericSx, fontSize: 12, fontWeight: 600, flex: "0 0 auto", color }}>
				{formatQuantity(stock)} {unit}
			</Typography>
		</>
	);
};

export default TransferProductOption;
