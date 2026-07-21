import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import UzsUnit from "components/shared/Money/UzsUnit";
import { CopyableCell } from "components/shared/Table/CopyableCell";
import { Product } from "models/product";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { measurementLabel, unitInline } from "utils/productUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Stack, Typography } from "@mui/material";

interface ProductDetailRailProps {
	product: Product;
}

/** Shared label/value row for the «Цены» and «Информация» cards — one idiom:
 *  13px secondary label left, value right, hairline `gray25` separators. */
const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box
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
		<Typography component="span" sx={{ fontSize: 13, color: "text.secondary", flex: "0 0 auto" }}>
			{label}
		</Typography>
		{children}
	</Box>
);

/** Right-aligned coloured money value; a missing/zero amount is a neutral «—»
 *  (never tinted, no UZS suffix — a dash is "not set", not an amount). */
const PriceValue: React.FC<{
	value: number | null;
	color: string;
	emphasized?: boolean;
	showCurrency?: boolean;
	extra?: React.ReactNode;
}> = ({ value, color, emphasized, showCurrency = true, extra }) => {
	const hasValue = value != null && value > 0;
	return (
		<Typography
			component="span"
			sx={{
				...numericSx,
				fontWeight: emphasized ? 700 : 600,
				fontSize: 14.5,
				letterSpacing: "-0.01em",
				textAlign: "right",
				color: hasValue ? color : "text.disabled",
			}}
		>
			{hasValue ? formatCurrency(value) : "—"}
			{hasValue && extra}
			{hasValue && showCurrency && <UzsUnit />}
		</Typography>
	);
};

/**
 * Persistent right rail: «Цены» (sale / supply / avg-cost / margin) and
 * «Информация» — both use the shared {@link Row} idiom with a `DetailCard`
 * title/icon header. Stock-on-hand lives solely in the Overview tab's
 * per-warehouse table.
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

	const infoRows = [
		{ id: "sku", label: t("product.sku"), value: product.sku, mono: true, copyable: true },
		{
			id: "barcode",
			label: t("product.barcode"),
			value: product.barcode || "—",
			mono: true,
			copyable: !!product.barcode,
		},
		{ id: "category", label: t("product.category"), value: product.categoryName ?? "—" },
		{ id: "type", label: t("product.type"), value: t(`product.typeLong.${product.type}`) },
		{
			id: "measurement",
			label: t("product.measurement"),
			value: measurementLabel(t, product.measurement),
		},
		{ id: "packaging", label: t("product.packaging"), value: packagingLabel },
	];

	return (
		<Stack sx={{ gap: "16px" }}>
			<DetailCard
				title={t("product.detail.prices.title")}
				icon={<PaymentsOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			>
				<Box sx={{ p: "6px 18px 14px" }}>
					<Row label={t("product.salePrice")}>
						<PriceValue value={product.salePrice} color="primary.main" />
					</Row>
					<Row label={t("product.supplyPrice")}>
						<PriceValue value={product.supplyPrice} color="info.main" />
					</Row>
					<Row label={t("product.detail.prices.wac")}>
						<PriceValue value={product.averageCost} color={designTokens.saffron700} emphasized />
					</Row>
					{margin != null && (
						<Row label={t("product.detail.prices.margin")}>
							<PriceValue
								value={margin}
								color="success.main"
								showCurrency={false}
								extra={
									<Box component="small" sx={{ fontSize: 13, fontWeight: 700, ml: "6px" }}>
										{marginPct}%
									</Box>
								}
							/>
						</Row>
					)}
				</Box>
			</DetailCard>

			<DetailCard
				title={t("product.detail.info.title")}
				icon={<InfoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			>
				<Box sx={{ p: "6px 18px 14px" }}>
					{infoRows.map((row) => {
						const valueSx = {
							fontSize: 13.5,
							fontWeight: 500,
							textAlign: "right" as const,
							...(row.mono ? numericSx : null),
						};
						return (
							<Row key={row.id} label={row.label}>
								{"copyable" in row && row.copyable ? (
									<CopyableCell value={row.value} sx={valueSx}>
										{row.value}
									</CopyableCell>
								) : (
									<Typography component="span" sx={valueSx}>
										{row.value}
									</Typography>
								)}
							</Row>
						);
					})}
				</Box>
			</DetailCard>
		</Stack>
	);
};

export default ProductDetailRail;
