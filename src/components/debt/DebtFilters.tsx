import React from "react";
import { useTranslation } from "react-i18next";
import EntityFilterSelect, {
	FilterOption,
} from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { DebtAgeBucket, DebtDirectionFilter, DebtTab } from "stores/DebtStore";
import { controlSize, designTokens, radius } from "theme";

import CloseIcon from "@mui/icons-material/Close";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { ButtonBase } from "@mui/material";

interface DebtFiltersProps {
	tab: DebtTab;
	ageBucket: DebtAgeBucket;
	directionFilter: DebtDirectionFilter;
	onlyOverdue: boolean;
	onAgeChange: (v: DebtAgeBucket) => void;
	onDirectionChange: (v: DebtDirectionFilter) => void;
	onClearOverdue: () => void;
}

/**
 * Debt filter controls for the table toolbar: the direction segmented (documents
 * tab only), the age dropdown (the shared filter select) and the removable
 * «Только просроченные» chip a summary card sets. The prototype's date-range
 * picker is omitted (locked pattern 12).
 */
export const DebtFilters: React.FC<DebtFiltersProps> = ({
	tab,
	ageBucket,
	directionFilter,
	onlyOverdue,
	onAgeChange,
	onDirectionChange,
	onClearOverdue,
}) => {
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
		<>
			{tab === "transactions" && (
				<SegmentedControl
					value={directionFilter}
					onChange={onDirectionChange}
					options={[
						{ value: "all", label: t("debt.direction.all") },
						{ value: "Receivable", label: t("debt.direction.receivable") },
						{ value: "Payable", label: t("debt.direction.payable") },
					]}
				/>
			)}

			<EntityFilterSelect<DebtAgeBucket>
				icon={<ScheduleOutlinedIcon />}
				label={t("debt.age.prefix")}
				value={ageBucket}
				options={ageOptions}
				onChange={onAgeChange}
			/>

			{onlyOverdue && (
				<ButtonBase
					onClick={onClearOverdue}
					aria-pressed
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						height: controlSize.md.height,
						px: "13px",
						borderRadius: `${radius.md}px`,
						border: "1px solid",
						borderColor: designTokens.primaryLine,
						bgcolor: designTokens.primarySoft,
						fontSize: 13,
						fontWeight: 600,
						color: "primary.main",
					}}
				>
					<ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />
					{t("debt.onlyOverdue")}
					<CloseIcon sx={{ fontSize: 14 }} />
				</ButtonBase>
			)}
		</>
	);
};

export default DebtFilters;
