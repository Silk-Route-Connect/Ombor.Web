import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Product, ProductImage } from "models/product";

import { Dialog, DialogContent } from "@mui/material";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

const IMAGE_BASE_URL = import.meta.env.VITE_OMBOR_API_BASE_URL ?? "";

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
	const { t } = useTranslation();
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
					<Typography variant="subtitle2">{t("product.id")}</Typography>
					<Typography>{product.id}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.category")}</Typography>
					<Typography>{product.categoryName}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.type")}</Typography>
					<Typography>{t(`product.type.${product.type}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.sku")}</Typography>
					<Typography>{product.sku}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.measurement")}</Typography>
					<Typography>{t(`product.measurement.${product.measurement}`)}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.barcode")}</Typography>
					<Typography>{product.barcode ?? "—"}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.supplyPrice")}</Typography>
					<Typography>{product.supplyPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.salePrice")}</Typography>
					<Typography>{product.salePrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				<Grid size={{ xs: 4 }}>
					<Typography variant="subtitle2">{t("product.retailPrice")}</Typography>
					<Typography>{product.retailPrice.toLocaleString("ru-RU")}</Typography>
				</Grid>
				{product.packaging && (
					<>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">{t("product.packaging.packSize")}</Typography>
							<Typography>{product.packaging.size}</Typography>
						</Grid>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">{t("product.packaging.packLabel")}</Typography>
							<Typography>{product.packaging.label ?? "—"}</Typography>
						</Grid>
						<Grid size={{ xs: 4 }}>
							<Typography variant="subtitle2">{t("product.packaging.packBarcode")}</Typography>
							<Typography>{product.packaging.barcode ?? "—"}</Typography>
						</Grid>
					</>
				)}
			</Grid>
		</Box>
	);
}
