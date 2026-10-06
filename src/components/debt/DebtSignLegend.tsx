import React from "react";
import { useTranslation } from "react-i18next";
import { LegendKey } from "components/shared/Chart/LegendSwatch";

import { Box } from "@mui/material";

/** The debts sign convention — green: owed to us, red: we owe (the bundle's `.debt-tabs` legend). */
export const DebtSignLegend: React.FC = () => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: "20px" }}>
			<LegendKey color="success.main" label={t("debt.legend.receivable")} />
			<LegendKey color="error.main" label={t("debt.legend.payable")} />
		</Box>
	);
};

export default DebtSignLegend;
