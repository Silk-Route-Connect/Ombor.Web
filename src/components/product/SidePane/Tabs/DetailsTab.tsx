import React, { useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { translate } from "i18n/i18n";
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
					<Typography variant="subtitle2">{translate("product.id")}</Typography>
					<Typography>{product.id}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.category")}</Typography>
					<Typography>{product.categoryName}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.type")}</Typography>
					<Typography>{translate(`product.type.${product.type}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.sku")}</Typography>
					<Typography>{product.sku}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.measurement")}</Typography>
					<Typography>{translate(`product.measurement.${product.measurement}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.barcode")}</Typography>
					<Typography>{product.barcode ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.supplyPrice")}</Typography>
					<Typography>{product.supplyPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.salePrice")}</Typography>
					<Typography>{product.salePrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{translate("product.retailPrice")}</Typography>
					<Typography>{product.retailPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				{product.packaging && (
					<>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">{translate("product.packaging.packSize")}</Typography>
							<Typography>{product.packaging.packSize}</Typography>
						</Grid>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">
								{translate("product.packaging.packLabel")}
							</Typography>
							<Typography>{product.packaging.packLabel ?? "—"}</Typography>
						</Grid>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">
								{translate("product.packaging.packBarcode")}
							</Typography>
							<Typography>{product.packaging.packBarcode ?? "—"}</Typography>
						</Grid>
					</>
				)}
			</Grid>
		</Box>
	);
}
