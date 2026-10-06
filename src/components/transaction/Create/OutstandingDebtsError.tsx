import React from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";

import { ButtonBase } from "@mui/material";

import { summaryTextButtonSx } from "./Summary/styles";

/**
 * Inline notice in the POS overpayment block when the partner's open debts could
 * not be loaded — shown instead of the settle / change-or-advance controls, so a
 * failure never reads as «no debts».
 */
export const OutstandingDebtsError: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
	const { t } = useTranslation();

	return (
		<Callout
			tone="danger"
			role="alert"
			action={
				<ButtonBase onClick={onRetry} sx={{ ...summaryTextButtonSx, color: "inherit" }}>
					{t("common.retry")}
				</ButtonBase>
			}
		>
			{t("transaction.new.totals.debtsLoadFailed")}
		</Callout>
	);
};

export default OutstandingDebtsError;
