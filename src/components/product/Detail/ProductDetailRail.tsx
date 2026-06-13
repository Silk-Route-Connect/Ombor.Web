import React from "react";
import { useTranslation } from "react-i18next";
import { Product } from "models/product";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT, stockValue } from "utils/productUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Stack, Typography } from "@mui/material";

import DetailCard from "./DetailCard";

interface ProductDetailRailProps {
	product: Product;
}

const PriceRow: React.FC<{
	label: string;
	value: number | null;
	valueColor: string;
	emphasized?: boolean;
	/** Bundle: the margin row carries the % note instead of the UZS suffix. */
	showCurrency?: boolean;
	extra?: React.ReactNode;
}> = ({ label, value, valueColor, emphasized, showCurrency = true, extra }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "baseline",
			justifyContent: "space-between",
			py: "9px",
		}}
	>
		<Typography
			component="span"
			sx={{
				fontSize: 13.5,
				color: emphasized ? designTokens.gray700 : "text.secondary",
				fontWeight: emphasized ? 600 : 400,
			}}
		>
			{label}
		</Typography>
		<Typography
			component="span"
			sx={{
				...numericSx,
				fontWeight: emphasized ? 800 : 700,
				fontSize: emphasized ? 19 : 16,
				letterSpacing: "-0.01em",
				color: valueColor,
			}}
		>
			{value != null && value > 0 ? formatCurrency(value) : "—"}
			{extra}
			{showCurrency && (
				<Box
					component="span"
					sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "4px" }}
				>
					UZS
				</Box>
			)}
		</Typography>
	</Box>
);

/**
 * Persistent right rail per the bundle: «Цены» (sale / supply / WAC / margin),
 * the stock hero with per-warehouse breakdown, and «Информация».
 */
export const ProductDetailRail: React.FC<ProductDetailRailProps> = ({ product }) => {
	const { t } = useTranslation();
	const unit = MEASUREMENT_SHORT[product.measurement];
	const zero = product.totalStock === 0;

	const costBasis = product.averageCost ?? (product.supplyPrice > 0 ? product.supplyPrice : null);
	const margin =
		product.salePrice > 0 && costBasis != null && costBasis > 0
			? product.salePrice - costBasis
			: null;
	const marginPct =
		margin != null && costBasis != null ? ((margin / costBasis) * 100).toFixed(1) : null;

	const totalValue = stockValue(product);

	const packagingLabel = product.packaging
		? (product.packaging.label ?? `${product.packaging.size} ${unit}`)
		: "—";

	return (
		<Stack sx={{ gap: "16px" }}>
			{/* Цены */}
			<DetailCard>
				<Box sx={{ p: "18px" }}>
					<Typography
						component="span"
						sx={{
							fontSize: 15,
							fontWeight: 600,
							display: "inline-flex",
							alignItems: "center",
							gap: "9px",
							mb: "6px",
						}}
					>
						<PaymentsOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
						{t("product.detail.prices.title")}
					</Typography>
					<PriceRow
						label={t("product.salePrice")}
						value={product.salePrice}
						valueColor="primary.main"
					/>
					<PriceRow
						label={t("product.supplyPrice")}
						value={product.supplyPrice}
						valueColor="info.main"
					/>
					<Box sx={{ height: "1px", bgcolor: "divider", my: "8px" }} />
					<PriceRow
						label={t("product.detail.prices.wac")}
						value={product.averageCost}
						valueColor={designTokens.saffron700}
						emphasized
					/>
					{margin != null && (
						<PriceRow
							label={t("product.detail.prices.margin")}
							value={margin}
							valueColor="success.main"
							showCurrency={false}
							extra={
								<Box component="small" sx={{ fontSize: 13, fontWeight: 700, ml: "6px" }}>
									{marginPct}%
								</Box>
							}
						/>
					)}
				</Box>
			</DetailCard>

			{/* Всего на складах */}
			<DetailCard>
				<Box sx={{ p: "18px" }}>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
						{t("product.detail.stock.caption")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 32,
							fontWeight: 800,
							letterSpacing: "-0.025em",
							lineHeight: 1,
							mt: "6px",
							color: zero ? "error.main" : "text.primary",
							opacity: product.isArchived ? 0.7 : 1,
						}}
					>
						{formatQuantity(product.totalStock)}
						<Box
							component="span"
							sx={{ fontSize: 15, fontWeight: 600, color: "text.disabled", ml: "6px" }}
						>
							{unit}
						</Box>
					</Typography>
					{product.inventoryItems.length > 0 && (
						<Typography sx={{ ...numericSx, fontSize: 12.5, color: "text.secondary", mt: "10px" }}>
							{product.inventoryItems
								.map(
									(item) =>
										`${item.inventoryName.replace("Склад ", "")}: ${formatQuantity(item.quantity)}`,
								)
								.join(" · ")}
						</Typography>
					)}
					<Box
						sx={{
							display: "flex",
							alignItems: "baseline",
							justifyContent: "space-between",
							mt: "16px",
							pt: "14px",
							borderTop: 1,
							borderColor: "divider",
						}}
					>
						<Typography component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
							{t("product.detail.stock.value")}
						</Typography>
						<Typography component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 16 }}>
							{formatCurrency(totalValue)} UZS
						</Typography>
					</Box>
				</Box>
			</DetailCard>

			{/* Информация */}
			<DetailCard
				title={t("product.detail.info.title")}
				icon={<InfoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			>
				<Box sx={{ p: "6px 18px 14px" }}>
					{[
						{ id: "sku", label: t("product.sku"), value: product.sku, mono: true },
						{
							id: "barcode",
							label: t("product.barcode"),
							value: product.barcode || "—",
							mono: true,
						},
						{ id: "category", label: t("product.category"), value: product.categoryName ?? "—" },
						{ id: "type", label: t("product.type"), value: t(`product.typeLong.${product.type}`) },
						{
							id: "measurement",
							label: t("product.measurement"),
							value: `${t(`product.measurement.${product.measurement}`)} (${unit})`,
						},
						{ id: "packaging", label: t("product.packaging"), value: packagingLabel },
					].map((row) => (
						<Box
							key={row.id}
							sx={{
								display: "flex",
								alignItems: "baseline",
								justifyContent: "space-between",
								gap: "16px",
								py: "9px",
								borderBottom: "1px solid",
								borderColor: designTokens.gray25,
								"&:last-child": { borderBottom: "none" },
							}}
						>
							<Typography
								component="span"
								sx={{ fontSize: 13, color: "text.secondary", flex: "0 0 auto" }}
							>
								{row.label}
							</Typography>
							<Typography
								component="span"
								sx={{
									fontSize: 13.5,
									fontWeight: 500,
									textAlign: "right",
									...(row.mono ? numericSx : null),
								}}
							>
								{row.value}
							</Typography>
						</Box>
					))}
				</Box>
			</DetailCard>
		</Stack>
	);
};

export default ProductDetailRail;
