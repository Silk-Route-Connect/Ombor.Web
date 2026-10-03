import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { Product } from "models/product";
import { numericSx } from "theme";
import { getImageFullUrl } from "utils/productUtils";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Stack, Typography } from "@mui/material";

import ProductStockTable from "./ProductStockTable";

interface ProductOverviewTabProps {
	product: Product;
}

/** Bundle `.zero-tag`: red pill flag on the warehouse card. */
const ZeroStockTag: React.FC = () => {
	const { t } = useTranslation();
	return (
		<StatusPill token="danger" icon={ErrorOutlineIcon} label={t("product.detail.outOfStock")} />
	);
};

/**
 * «Обзор» per the bundle: images, description and the per-warehouse stock
 * table with the served-aggregate «Итого» row.
 */
export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({ product }) => {
	const { t } = useTranslation();
	const zero = product.totalStock === 0;

	return (
		<Stack sx={{ gap: "16px" }}>
			<DetailCard
				title={t("product.detail.images")}
				icon={<Inventory2OutlinedIcon sx={detailCardIconSx} />}
			>
				{product.images.length > 0 ? (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "14px", p: "16px 18px" }}>
						{product.images.map((image) => (
							<Box key={image.id} sx={{ width: 132 }}>
								<Box
									component="img"
									src={getImageFullUrl(image.thumbnailUrl ?? image.originalUrl)}
									alt={image.name}
									sx={{
										width: 132,
										height: 132,
										objectFit: "cover",
										display: "block",
										borderRadius: "8px",
										border: "1px solid",
										borderColor: "divider",
										opacity: product.isArchived ? 0.7 : 1,
									}}
								/>
								<Typography
									sx={{
										...numericSx,
										fontSize: 11.5,
										fontWeight: 600,
										color: "text.secondary",
										mt: "6px",
										textAlign: "center",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{image.name}
								</Typography>
							</Box>
						))}
					</Box>
				) : (
					<Typography sx={{ p: "16px 18px", fontSize: 13.5, color: "text.disabled" }}>
						{t("product.detail.imagesEmpty")}
					</Typography>
				)}
			</DetailCard>

			<DetailCard
				title={t("product.description")}
				icon={<ReceiptLongOutlinedIcon sx={detailCardIconSx} />}
			>
				<Box sx={{ p: "16px 18px" }}>
					<Typography
						sx={{
							fontSize: 14,
							lineHeight: 1.6,
							color: product.description ? "text.primary" : "text.disabled",
						}}
					>
						{product.description || t("product.detail.descriptionEmpty")}
					</Typography>
				</Box>
			</DetailCard>

			<DetailCard
				title={t("product.detail.stockByWarehouse")}
				icon={<WarehouseOutlinedIcon sx={detailCardIconSx} />}
				headerExtra={zero ? <ZeroStockTag /> : undefined}
			>
				<ProductStockTable product={product} />
			</DetailCard>
		</Stack>
	);
};

export default ProductOverviewTab;
