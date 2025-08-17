// src/components/product/Drawer/DetailsTab.tsx
import React, { useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { translate } from "i18n/i18n";
import { toJS } from "mobx";
import { Product, ProductImage } from "models/product";

const IMAGE_BASE_URL = process.env.REACT_APP_OMBOR_API_BASE_URL ?? "";

function getFullUrl(path?: string): string | undefined {
	if (!path) {
		return undefined;
	}

	const base = IMAGE_BASE_URL.replace(/\/+$|\\+$/, "");
	const p = path.replace(/^\/+/, "");

	return `${base}/${p}`;
}

export interface DetailsTabProps {
	product: Product;
}

export function DetailsTab({ product }: Readonly<DetailsTabProps>) {
	const [lightboxImage, setLightboxImage] = useState<ProductImage | null>(null);

	console.log("DetailsTab product:", toJS(product));

	return (
		<Box sx={{ p: 2 }}>
			{product.images && product.images.length > 0 && (
				<Box sx={{ display: "flex", overflowX: "auto", gap: 1, mb: 2 }}>
					{product.images.map((img) => (
						<Box
							key={img.id}
							component="img"
							src={getFullUrl(img.thumbnailUrl ?? img.originalUrl)}
							alt={img.name}
							sx={{
								width: 100,
								height: 100,
								objectFit: "cover",
								borderRadius: 1,
								cursor: "pointer",
							}}
							onClick={() => setLightboxImage(img)}
						/>
					))}
				</Box>
			)}

			{/* Lightbox Dialog */}
			<Dialog open={Boolean(lightboxImage)} onClose={() => setLightboxImage(null)} maxWidth="lg">
				<DialogContent sx={{ p: 0 }}>
					<Box
						component="img"
						src={getFullUrl(lightboxImage?.originalUrl)}
						alt={lightboxImage?.name}
						sx={{ maxWidth: "120vw", maxHeight: "120vh" }}
					/>
				</DialogContent>
			</Dialog>

			<Grid container spacing={4}>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldId")}</Typography>
					<Typography>{product.id}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldCategory")}</Typography>
					<Typography>{product.categoryName}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldType")}</Typography>
					<Typography>{translate(`type.${product.type}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldSku")}</Typography>
					<Typography>{product.sku}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldMeasurement")}</Typography>
					<Typography>{translate(`measurement.${product.measurement}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldBarcode")}</Typography>
					<Typography>{product.barcode ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldSupplyPrice")}</Typography>
					<Typography>{product.supplyPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldSalePrice")}</Typography>
					<Typography>{product.salePrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldRetailPrice")}</Typography>
					<Typography>{product.retailPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				{/* <Grid size={{ xs: 4 }}>
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
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("fieldLowStockThreshold")}</Typography>
					<Typography>{product.lowStockThreshold}</Typography>
				</Grid>
				<Grid size={12}>
					<Typography variant="subtitle2">{translate("fieldDescription")}</Typography>
					<Typography sx={{ whiteSpace: "pre-wrap" }}>{product.description ?? "—"}</Typography>
				</Grid> */}
			</Grid>
		</Box>
	);
}
