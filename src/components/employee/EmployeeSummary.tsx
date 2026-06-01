import React from "react";
import SummaryCards from "components/shared/Cards/SummaryCards";
import { translate } from "i18n/i18n";
import { EmployeesSummary } from "utils/employeeStats";
import { formatMoney } from "utils/formatCurrency";

import BeachAccessOutlinedIcon from "@mui/icons-material/BeachAccessOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

const EmployeeSummary: React.FC<{ summary: EmployeesSummary }> = ({ summary }) => (
	<SummaryCards
		columns={4}
		cards={[
			{
				icon: <PeopleAltOutlinedIcon />,
				tone: "teal",
				caption: translate("employee.summary.total"),
				value: summary.total.toString(),
			},
			{
				icon: <CheckCircleOutlineIcon />,
				tone: "teal",
				caption: translate("employee.summary.active"),
				value: summary.active.toString(),
			},
			{
				icon: <BeachAccessOutlinedIcon />,
				tone: "teal",
				caption: translate("employee.summary.onVacation"),
				value: summary.onVacation.toString(),
			},
			{
				icon: <PaymentsOutlinedIcon />,
				tone: "saffron",
				caption: translate("employee.summary.salaryFund"),
				value: formatMoney(summary.salaryFund),
				unit: "UZS",
			},
		]}
	/>
);

export default EmployeeSummary;
