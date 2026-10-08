import React from "react";
import { useTranslation } from "react-i18next";
import { fieldCaptionSx } from "components/shared/Forms/FormFieldLabel";
import UzsUnit from "components/shared/Money/UzsUnit";
import { designTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface OpeningStockSummaryProps {
	positions: number;
	/** Σ quantity × unit cost of the complete lines — the draft batch, before it is recorded. */
	batchValue: number;
}

/**
 * The draft batch in figures: positions · value at the entered costs. No unit
 * total — lines mix kg, pieces and tonnes (owner decision 2026-10-07).
 */
const OpeningStockSummary: React.FC<OpeningStockSummaryProps> = ({ positions, batchValue }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "22px",
				mt: "18px",
				p: "14px 18px",
				bgcolor: designTokens.bgSubtle,
				border: "1px solid",
				borderColor: "divider",
				borderRadius: `${radius.md}px`,
			}}
		>
			<Box>
				<Typography sx={fieldCaptionSx}>{t("warehouse.opening.summaryPositions")}</Typography>
				<Typography sx={{ ...numericSx, fontWeight: 700, fontSize: 16, mt: "2px" }}>
					{positions}
				</Typography>
			</Box>
			<Box sx={{ flexGrow: 1 }} />
			<Box sx={{ textAlign: "right" }}>
				<Typography sx={fieldCaptionSx}>{t("warehouse.opening.summaryValue")}</Typography>
				<Typography
					sx={{
						...numericSx,
						fontWeight: 700,
						fontSize: 16,
						mt: "2px",
					}}
				>
					{formatCurrency(batchValue)}
					<UzsUnit />
				</Typography>
			</Box>
		</Box>
	);
};

export default OpeningStockSummary;
