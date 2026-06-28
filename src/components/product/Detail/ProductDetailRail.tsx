import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Product } from "models/product";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { measurementLabel, unitInline } from "utils/productUtils";

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
}> = ({ label, value, valueColor, emphasized, showCurrency = true, extra }) => {
	// An empty/absent money value is a neutral «—» — never tinted with the value
	// colour, and with no UZS suffix (a dash is "not set", not an amount).
	const hasValue = value != null && value > 0;
	return (
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
					color: hasValue ? valueColor : "text.disabled",
				}}
			>
				{hasValue ? formatCurrency(value) : "—"}
				{hasValue && extra}
				{hasValue && showCurrency && <UzsUnit />}
			</Typography>
		</Box>
	);
};

/**
 * Persistent right rail: «Цены» (sale / supply / avg-cost / margin) and
 * «Информация». Stock-on-hand lives solely in the Overview tab's per-warehouse
 * table — the redundant «Всего на складах» hero (with its cryptic id breakdown)
 * was removed.
 */
export const ProductDetailRail: React.FC<ProductDetailRailProps> = ({ product }) => {
	const { t } = useTranslation();
	const unit = unitInline(t, product.measurement);

	const costBasis = product.averageCost ?? (product.supplyPrice > 0 ? product.supplyPrice : null);
	const margin =
		product.salePrice > 0 && costBasis != null && costBasis > 0
			? product.salePrice - costBasis
			: null;
	const marginPct =
		margin != null && costBasis != null ? ((margin / costBasis) * 100).toFixed(1) : null;

	const packagingLabel = product.packaging
		? (product.packaging.label ?? `${product.packaging.size}${unit ? ` ${unit}` : ""}`)
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
							value: measurementLabel(t, product.measurement),
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
