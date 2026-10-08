import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill, { StatusPillSize } from "components/shared/Chip/StatusPill";
import { StockLevel } from "utils/stockLevel";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface StockLevelPillProps {
	level: StockLevel;
	size?: StatusPillSize;
}

/**
 * A warehouse row's stock pill (DR-41): amber «Мало» when the served flag says
 * it is at or below its threshold, red «Нет в наличии» when none is left
 * (tracked or not); nothing otherwise. Warehouse «Остатки», the stock report,
 * the dashboard «Заканчивается» panel.
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
			label={t("warehouse.stockLevel.out")}
		/>
	) : (
		<StatusPill
			token="warning"
			icon={TrendingDownIcon}
			size={size}
			label={t("warehouse.stockLevel.low")}
		/>
	);
};

export default StockLevelPill;
