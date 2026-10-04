import React from "react";
import { useTranslation } from "react-i18next";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { ReportGroupBy } from "models/report";

import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";

interface ReportGroupBySelectProps {
	value: ReportGroupBy;
	/** The groupings this report's API takes, in menu order. */
	options: readonly ReportGroupBy[];
	onChange: (value: ReportGroupBy) => void;
}

/** «Группировка: По дням / По неделям / По месяцам / По товарам / …». */
const ReportGroupBySelect: React.FC<ReportGroupBySelectProps> = ({ value, options, onChange }) => {
	const { t } = useTranslation();
	return (
		<EntityFilterSelect<ReportGroupBy>
			label={t("report.groupBy.label")}
			icon={<ViewListOutlinedIcon />}
			value={value}
			options={options.map((option) => ({
				value: option,
				label: t(`report.groupBy.${option}`),
			}))}
			onChange={onChange}
		/>
	);
};

export default ReportGroupBySelect;
