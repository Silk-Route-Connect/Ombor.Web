import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface SettlementSummaryProps {
	amount: number;
	distributed: number;
	advance: number;
	/** False while the open debts are loading or failed — the split is unknown then. */
	debtsReady: boolean;
}

const labelSx = { fontSize: 12, color: "text.secondary" } as const;
const figureSx = { ...numericSx, fontWeight: 700, fontSize: 18 } as const;

/**
 * The settlement modal's total band: payment amount · closed debts · advance.
 * Until the open debts are in, the split shows «—», never «0 закрыто / всё в аванс».
 */
export const SettlementSummary: React.FC<SettlementSummaryProps> = ({
	amount,
	distributed,
	advance,
	debtsReady,
}) => {
	const { t } = useTranslation();
	const splitFigure = (value: number): string =>
		debtsReady ? formatCurrency(value) : t("common.dash");

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "repeat(3, 1fr)",
				gap: "12px",
				mt: "18px",
				p: "14px 16px",
				borderRadius: "8px",
				bgcolor: designTokens.gray25,
				border: "1px solid",
				borderColor: "divider",
			}}
		>
			<Box>
				<Typography sx={labelSx}>{t("payment.settlement.toDistribute")}</Typography>
				<Typography sx={figureSx}>{formatCurrency(amount)}</Typography>
			</Box>
			<Box>
				<Typography sx={labelSx}>{t("payment.settlement.distributed")}</Typography>
				<Typography sx={{ ...figureSx, color: debtsReady ? "success.main" : "text.disabled" }}>
					{splitFigure(distributed)}
				</Typography>
			</Box>
			<Box>
				<Typography sx={labelSx}>{t("payment.settlement.toAdvance")}</Typography>
				<Typography
					sx={{
						...figureSx,
						color: debtsReady && advance > 0 ? designTokens.saffron700 : "text.disabled",
					}}
				>
					{splitFigure(advance)}
				</Typography>
				{debtsReady && advance > 0 && (
					<Typography sx={{ fontSize: 11, color: "text.disabled", mt: "2px" }}>
						{t("payment.settlement.advanceNote")}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

export default SettlementSummary;
