import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, ButtonBase, Typography } from "@mui/material";

/**
 * Inline notice in the POS overpayment block when the partner's open debts could
 * not be loaded — shown instead of the settle / change-or-advance controls, so a
 * failure never reads as «no debts».
 */
export const OutstandingDebtsError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
	const { t } = useTranslation();

	return (
		<Box
			role="alert"
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				mt: "3px",
				p: "8px 10px",
				border: "1px solid",
				borderColor: "error.main",
				borderRadius: "8px",
				bgcolor: designTokens.errorBg,
			}}
		>
			<ErrorOutlineIcon sx={{ fontSize: 16, color: "error.main", flex: "0 0 auto" }} />
			<Typography sx={{ flex: 1, fontSize: 12.5, color: "error.main", lineHeight: 1.4 }}>
				{t("transaction.new.totals.debtsLoadFailed")}
			</Typography>
			<ButtonBase
				onClick={onRetry}
				sx={{
					px: "8px",
					py: "4px",
					borderRadius: "6px",
					fontSize: 12.5,
					fontWeight: 600,
					color: "error.main",
					"&:hover": { textDecoration: "underline" },
				}}
			>
				{t("common.retry")}
			</ButtonBase>
		</Box>
	);
};

export default OutstandingDebtsError;
