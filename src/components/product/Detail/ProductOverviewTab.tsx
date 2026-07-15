import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Product } from "models/product";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { getImageFullUrl, measurementLabel, stockValue } from "utils/productUtils";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Stack, Typography } from "@mui/material";

import { cardIconSx, detailTableSx } from "./detailTableSx";

interface ProductOverviewTabProps {
	product: Product;
}

/** Bundle `.zero-tag`: red pill flag on the warehouse card. */
const ZeroStockTag: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				fontSize: 11.5,
				fontWeight: 700,
				color: "error.main",
				bgcolor: designTokens.errorBg,
				border: "1px solid",
				borderColor: designTokens.errorBorder,
				px: "9px",
				py: "2px",
				borderRadius: "999px",
			}}
		>
			<ErrorOutlineIcon sx={{ fontSize: 13 }} />
			{t("product.detail.outOfStock")}
		</Box>
	);
};

/**
 * «Обзор» per the bundle: images, description and the per-warehouse stock
 * table with the served-aggregate «Итого» row.
 */
export const ProductOverviewTab: React.FC<ProductOverviewTabProps> = ({ product }) => {
	const { t } = useTranslation();
	const zero = product.totalStock === 0;
	const unit = measurementLabel(t, product.measurement);
	const totalValue = stockValue(product);

	return (
		<Stack sx={{ gap: "16px" }}>
			<DetailCard
				title={t("product.detail.images")}
				icon={<Inventory2OutlinedIcon sx={cardIconSx} />}
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
				icon={<ReceiptLongOutlinedIcon sx={cardIconSx} />}
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
				icon={<WarehouseOutlinedIcon sx={cardIconSx} />}
				headerExtra={zero ? <ZeroStockTag /> : undefined}
			>
				<Box component="table" sx={detailTableSx}>
					<thead>
						<tr>
							<th>{t("product.detail.table.warehouse")}</th>
							<th>{t("product.detail.table.unit")}</th>
							<th className="r">{t("product.detail.table.quantity")}</th>
							<th className="r">{t("product.detail.table.wac")}</th>
							<th className="r">{t("product.detail.table.value")}</th>
						</tr>
					</thead>
					<tbody>
						{product.warehouseItems.map((item) => (
							<tr key={item.warehouseId}>
								<td>
									<WarehouseLink id={item.warehouseId} name={item.warehouseName} />
								</td>
								<td>
									<Box component="span" sx={{ color: "text.secondary" }}>
										{unit}
									</Box>
								</td>
								<td className="r">
									<Box
										component="span"
										sx={{
											...numericSx,
											color: item.quantity === 0 ? "error.main" : "text.primary",
										}}
									>
										{formatQuantity(item.quantity)}
									</Box>
								</td>
								<td className="r">
									<Box component="span" sx={numericSx}>
										{item.quantity === 0 ? "—" : formatCurrency(item.averageCost)}
									</Box>
								</td>
								<td className="r">
									<Box component="span" sx={numericSx}>
										{formatCurrency(item.quantity * item.averageCost)}
									</Box>
								</td>
							</tr>
						))}
						<tr className="total">
							<td>{t("product.detail.table.total")}</td>
							<td></td>
							<td className="r">
								<Box
									component="span"
									sx={{
										...numericSx,
										fontWeight: 800,
										color: zero ? "error.main" : "text.primary",
									}}
								>
									{formatQuantity(product.totalStock)}
								</Box>
							</td>
							<td className="r">
								<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
									{product.averageCost != null ? formatCurrency(product.averageCost) : "—"}
								</Box>
							</td>
							<td className="r">
								<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
									{formatCurrency(totalValue)}
								</Box>
							</td>
						</tr>
					</tbody>
				</Box>
			</DetailCard>
		</Stack>
	);
};

export default ProductOverviewTab;
