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

/** The first row holds the money that came in and what we hold; debts follow. */
const FIRST_ROW = 4;

/**
 * The «Главное» KPI cards (mvp-plan §2: revenue, gross profit, cash, stock
 * value, debt totals) — from `lg` four cards on the first row and the three debt
 * cards, a little wider, on the second; each a navigation target with a served
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
				gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(12, 1fr)" },
				gap: "16px",
				mb: "16px",
				...staggerChildrenSx(cards.length, motion),
			}}
		>
			{cards.map((spec, index) => (
				<Box
					key={spec.key}
					sx={{
						display: "flex",
						minWidth: 0,
						gridColumn: { lg: index < FIRST_ROW ? "span 3" : "span 4" },
					}}
				>
					<KpiCard spec={spec} onOpen={() => onOpen(spec.key)} />
				</Box>
			))}
		</Box>
	);
};

export default DashboardKpiCards;
