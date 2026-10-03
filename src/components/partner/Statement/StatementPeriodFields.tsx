import React from "react";
import { useTranslation } from "react-i18next";
import { StatementPeriod } from "utils/partnerStatement";

import { Box, TextField } from "@mui/material";

interface StatementPeriodFieldsProps {
	period: StatementPeriod;
	onChange: (period: StatementPeriod) => void;
}

/**
 * «С … по …» day pickers of the Акт сверки (screen toolbar only). A cleared
 * field keeps the previous day; reversed ends are swapped by the page.
 */
export const StatementPeriodFields: React.FC<StatementPeriodFieldsProps> = ({
	period,
	onChange,
}) => {
	const { t } = useTranslation();

	const field = (side: keyof StatementPeriod, label: string) => (
		<TextField
			type="date"
			size="small"
			label={label}
			value={period[side]}
			onChange={(e) => e.target.value && onChange({ ...period, [side]: e.target.value })}
			slotProps={{ inputLabel: { shrink: true } }}
			sx={{ width: 160 }}
		/>
	);

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
			{field("from", t("print.statement.periodFrom"))}
			{field("to", t("print.statement.periodTo"))}
		</Box>
	);
};

export default StatementPeriodFields;
