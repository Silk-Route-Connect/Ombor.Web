import React from "react";
import { useTranslation } from "react-i18next";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { DashboardPeriod } from "models/dashboard";

interface Props {
	period: DashboardPeriod;
	onChange: (period: DashboardPeriod) => void;
}

/**
 * Global period selector — Сегодня / Неделя / Месяц. Drives the revenue KPI and
 * both charts. The prototype's «Свой период» custom date-range popover is an
 * inert affordance (static dates) and is deferred per locked pattern 12.
 */
const PeriodControl: React.FC<Props> = ({ period, onChange }) => {
	const { t } = useTranslation();

	return (
		<SegmentedControl<DashboardPeriod>
			value={period}
			onChange={onChange}
			options={[
				{ value: "today", label: t("dashboard.period.today") },
				{ value: "week", label: t("dashboard.period.week") },
				{ value: "month", label: t("dashboard.period.month") },
			]}
		/>
	);
};

export default PeriodControl;
