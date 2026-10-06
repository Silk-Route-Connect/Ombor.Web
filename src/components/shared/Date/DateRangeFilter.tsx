import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { DATE_PRESETS, DatePreset, DateRangeValue, formatCustomRange } from "utils/dateRange";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { Box } from "@mui/material";

import DateRangePopover from "./DateRangePopover";

interface DateRangeFilterProps {
	value: DateRangeValue;
	onChange: (value: DateRangeValue) => void;
	/**
	 * Offer «Весь период» (default). Reports pass `false`: the API answers a
	 * bounded period (at most three years), so «all time» has no honest meaning there.
	 */
	withAllTime?: boolean;
}

type Choice = DatePreset | "custom";

/**
 * The one list date filter — Sales, Supplies, Orders, Payments, Adjustments,
 * Transfers, Wallet operations: «Дата: Весь период / Сегодня / Вчера / Эта
 * неделя / Этот месяц / Прошлый месяц / Период…». «Период…» opens two calendar
 * fields; the picked range then reads in the control («Дата: 01.10 – 04.10.2026»).
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
	value,
	onChange,
	withAllTime = true,
}) => {
	const { t } = useTranslation();
	const anchorRef = useRef<HTMLDivElement>(null);
	const [editing, setEditing] = useState(false);

	const options = [
		...DATE_PRESETS.filter((preset) => withAllTime || preset !== "all").map((preset) => ({
			value: preset as Choice,
			label: t(`common.dateRange.${preset}`),
		})),
		{ value: "custom" as Choice, label: t("common.dateRange.custom") },
	];

	const handleChange = (choice: Choice) => {
		if (choice === "custom") {
			setEditing(true);
		} else {
			onChange({ preset: choice });
		}
	};

	return (
		<>
			<Box ref={anchorRef} sx={{ display: "inline-flex" }}>
				<EntityFilterSelect<Choice>
					label={t("common.dateRange.label")}
					icon={<CalendarTodayOutlinedIcon />}
					value={value.preset}
					options={options}
					valueLabel={
						value.preset === "custom" ? formatCustomRange(value.from, value.to) : undefined
					}
					onChange={handleChange}
					onReselect={(choice) => choice === "custom" && setEditing(true)}
				/>
			</Box>
			<DateRangePopover
				anchorEl={anchorRef.current}
				open={editing}
				current={value}
				onApply={(range) => {
					onChange(range);
					setEditing(false);
				}}
				onClose={() => setEditing(false)}
			/>
		</>
	);
};

export default DateRangeFilter;
