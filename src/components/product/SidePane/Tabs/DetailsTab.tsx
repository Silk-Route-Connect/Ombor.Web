// src/components/product/Drawer/DetailsTab.tsx
import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { translate } from "i18n/i18n";
import { Product } from "models/product";

export interface DetailsTabProps {
	product: Product;
}

export function DetailsTab({ product }: DetailsTabProps) {
	return (
		<Box sx={{ p: 2 }}>
			<Grid container spacing={2}>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldId")}</Typography>
					<Typography>{product.id}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldCategory")}</Typography>
					<Typography>{product.categoryName}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldSku")}</Typography>
					<Typography>{product.sku}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldMeasurement")}</Typography>
					<Typography>{translate(`measurement.${product.measurement}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldSupplyPrice")}</Typography>
					<Typography>{product.supplyPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldSalePrice")}</Typography>
					<Typography>{product.salePrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldRetailPrice")}</Typography>
					<Typography>{product.retailPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldQuantityInStock")}</Typography>
					<Typography
						sx={{
							color: product.isLowStock ? "warning.main" : "text.primary",
							fontWeight: product.isLowStock ? 600 : 400,
						}}
					>
						{product.quantityInStock}
					</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldLowStockThreshold")}</Typography>
					<Typography>{product.lowStockThreshold}</Typography>
				</Grid>
				<Grid size={{ xs: 6 }}>
					<Typography variant="subtitle2">{translate("fieldBarcode")}</Typography>
					<Typography>{product.barcode ?? "—"}</Typography>
				</Grid>
				<Grid size={12}>
					<Typography variant="subtitle2">{translate("fieldDescription")}</Typography>
					<Typography sx={{ whiteSpace: "pre-wrap" }}>{product.description ?? "—"}</Typography>
				</Grid>
			</Grid>
		</Box>
	);
}
