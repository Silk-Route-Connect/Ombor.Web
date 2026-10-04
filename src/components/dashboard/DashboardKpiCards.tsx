import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardData } from "models/dashboard";

import { Box } from "@mui/material";

import KpiCard from "./KpiCards/KpiCard";
import { buildKpiCardSpecs } from "./KpiCards/kpiCardSpecs";
import { DashboardKpiKey } from "./KpiCards/types";
import { staggerChildrenSx, usePrefersReducedMotion } from "./motion";

interface Props {
	data: DashboardData;
	/** A card click opens the module behind the figure. */
	onOpen: (card: DashboardKpiKey) => void;
}

/**
 * The «Главное» KPI cards (mvp-plan §2: revenue, cash, stock value, debt
 * totals) — three per row from `lg`, each a navigation target with a served
 * change badge and trend sparkline.
 */
const DashboardKpiCards: React.FC<Props> = ({ data, onOpen }) => {
	const { t } = useTranslation();
	const motion = !usePrefersReducedMotion();
	const cards = buildKpiCardSpecs(data, t);

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
				gap: "16px",
				mb: "16px",
				...staggerChildrenSx(cards.length, motion),
			}}
		>
			{cards.map((spec) => (
				<KpiCard key={spec.key} spec={spec} onOpen={() => onOpen(spec.key)} />
			))}
		</Box>
	);
};

export default DashboardKpiCards;
