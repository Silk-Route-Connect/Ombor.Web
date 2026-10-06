import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { FactList, FactRow } from "components/shared/Detail/FactRow";
import UzsUnit from "components/shared/Money/UzsUnit";
import { CopyableCell } from "components/shared/Table/CopyableCell";
import { Product } from "models/product";
import { formatCurrency, formatPercent, formatQuantity } from "utils/formatCurrency";
import { measurementLabel, unitInline } from "utils/productUtils";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, Stack } from "@mui/material";

interface ProductDetailRailProps {
	product: Product;
}

/** A catalogue price of 0 means «not set» — it reads «—», never a «0 UZS» price. */
const priceOrNull = (value: number | null | undefined) =>
	value != null && value > 0 ? value : null;

/**
 * Persistent right rail: «Цены» (sale / supply / avg-cost / markup) and
 * «Информация», both fact cards. Stock-on-hand lives solely in the Overview
 * tab's per-warehouse table.
 */
export const ProductDetailRail: React.FC<ProductDetailRailProps> = ({ product }) => {
	const { t } = useTranslation();
	const unit = unitInline(t, product.measurement);
	const withUnit = (qty: string) => `${qty}${unit ? ` ${unit}` : ""}`;

	const costBasis = product.averageCost ?? (product.supplyPrice > 0 ? product.supplyPrice : null);
	const margin =
		product.salePrice > 0 && costBasis != null && costBasis > 0
			? product.salePrice - costBasis
			: null;
	const marginPct =
		margin != null && costBasis != null ? formatPercent((margin / costBasis) * 100) : null;

	return (
		<Stack sx={{ gap: "16px" }}>
			<DetailCard
				title={t("product.detail.prices.title")}
				icon={<PaymentsOutlinedIcon sx={detailCardIconSx} />}
			>
				<FactList>
					<FactRow label={t("product.salePrice")} money={priceOrNull(product.salePrice)} />
					<FactRow label={t("product.supplyPrice")} money={priceOrNull(product.supplyPrice)} />
					<FactRow
						label={t("product.detail.prices.wac")}
						hint={t("common.hint.wac")}
						money={priceOrNull(product.averageCost)}
					/>
					{margin != null && (
						<FactRow
							label={t("product.detail.prices.margin")}
							hint={t("product.detail.prices.marginHint")}
							figures="tabular"
							valueColor={margin < 0 ? "error.main" : "success.main"}
						>
							{formatCurrency(margin)}
							<UzsUnit />
							<Box component="span" sx={{ color: "text.secondary", ml: "6px" }}>
								· {marginPct}%
							</Box>
						</FactRow>
					)}
				</FactList>
			</DetailCard>

			<DetailCard
				title={t("product.detail.info.title")}
				icon={<InfoOutlinedIcon sx={detailCardIconSx} />}
			>
				<FactList>
					<FactRow label={t("product.sku")} figures="proportional">
						<CopyableCell value={product.sku}>{product.sku}</CopyableCell>
					</FactRow>
					<FactRow label={t("product.barcode")} figures="proportional">
						{product.barcode && (
							<CopyableCell value={product.barcode}>{product.barcode}</CopyableCell>
						)}
					</FactRow>
					<FactRow label={t("product.category")}>{product.categoryName}</FactRow>
					<FactRow label={t("product.type")}>{t(`product.typeLong.${product.type}`)}</FactRow>
					<FactRow label={t("product.measurement")}>
						{measurementLabel(t, product.measurement)}
					</FactRow>
					<FactRow label={t("product.packaging")}>
						{product.packaging &&
							(product.packaging.label ?? withUnit(String(product.packaging.size)))}
					</FactRow>
					<FactRow label={t("product.form.lowStockLabel")} figures="tabular">
						{product.lowStockThreshold ? withUnit(formatQuantity(product.lowStockThreshold)) : null}
					</FactRow>
				</FactList>
			</DetailCard>
		</Stack>
	);
};

export default ProductDetailRail;
