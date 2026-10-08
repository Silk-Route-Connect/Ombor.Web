import React from "react";
import { useTranslation } from "react-i18next";
import EntityFilterSelect, {
	FilterOption,
} from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { DebtAgeBucket } from "stores/DebtStore";

import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

interface DebtFiltersProps {
	ageBucket: DebtAgeBucket;
	onAgeChange: (v: DebtAgeBucket) => void;
}

/**
 * The debts toolbar's one filter control, shared by both tabs: the age dropdown
 * (the shared filter select). Direction and «просрочено» are the summary cards
 * above the tabs — one control per filter. The prototype's date-range picker is
 * omitted (locked pattern 12).
 */
export const DebtFilters: React.FC<DebtFiltersProps> = ({ ageBucket, onAgeChange }) => {
	const { t } = useTranslation();

	const ageOptions: FilterOption<DebtAgeBucket>[] = [
		{ value: "all", label: t("debt.age.all") },
		{ value: "0-7", label: t("debt.age.0-7") },
		{ value: "8-30", label: t("debt.age.8-30") },
		{ value: "31+", label: t("debt.age.31+") },
		{ value: "31-60", label: t("debt.age.31-60") },
		{ value: "60+", label: t("debt.age.60+") },
	];

	return (
		<EntityFilterSelect<DebtAgeBucket>
			icon={<ScheduleOutlinedIcon />}
			label={t("debt.age.prefix")}
			value={ageBucket}
			options={ageOptions}
			onChange={onAgeChange}
		/>
	);
};

export default DebtFilters;
