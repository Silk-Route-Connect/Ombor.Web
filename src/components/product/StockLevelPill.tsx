import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill, { StatusPillSize } from "components/shared/Chip/StatusPill";
import { StockLevel } from "utils/productFilters";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StockLevelPillProps {
	level: StockLevel;
	size?: StatusPillSize;
}

/**
 * The low-stock alert: amber «Мало» at or below the product's «Минимальный
 * остаток», red «Нет в наличии» when none is left; nothing when stock is enough.
 * Products list, product detail and warehouse stock show the same pill.
 */
const StockLevelPill: React.FC<StockLevelPillProps> = ({ level, size }) => {
	const { t } = useTranslation();

	if (level === "ok") {
		return null;
	}

	return level === "out" ? (
		<StatusPill
			token="danger"
			icon={ErrorOutlineIcon}
			size={size}
			label={t("product.stockLevel.out")}
		/>
	) : (
		<StatusPill
			token="warning"
			icon={TrendingDownIcon}
			size={size}
			label={t("product.stockLevel.low")}
		/>
	);
};

export default StockLevelPill;
