import React from "react";
import { useTranslation } from "react-i18next";
import DateField from "components/shared/Date/DateField";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { defaultStatementPeriod, StatementPeriod } from "utils/partnerStatement";

import { Box } from "@mui/material";

interface StatementPeriodFieldsProps {
	period: StatementPeriod;
	onChange: (period: StatementPeriod) => void;
}

/**
 * «С … по …» day fields of the Акт сверки (screen toolbar only), each labelled
 * on its left so the toolbar keeps one row. A cleared or half-typed field keeps
 * the previous day; reversed ends are swapped and a future day is capped at today
 * by the page — the calendars offer no day after today.
 */
export const StatementPeriodFields: React.FC<StatementPeriodFieldsProps> = ({
	period,
	onChange,
}) => {
	const { t } = useTranslation();
	const today = defaultStatementPeriod().to;

	const field = (side: keyof StatementPeriod, label: string) => (
		<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<FormFieldLabel label={label} />
			<DateField
				value={period[side]}
				maxDate={today}
				fullWidth={false}
				onChange={(day) => day && onChange({ ...period, [side]: day })}
				sx={{ width: 156 }}
			/>
		</Box>
	);

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
			{field("from", t("print.statement.periodFrom"))}
			{field("to", t("print.statement.periodTo"))}
		</Box>
	);
};

export default StatementPeriodFields;
