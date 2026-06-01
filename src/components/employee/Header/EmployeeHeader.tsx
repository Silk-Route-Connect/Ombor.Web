import React from "react";
import SegmentedControl, {
	SegmentedOption,
} from "components/shared/Inputs/SegmentedControl/SegmentedControl";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

interface EmployeeHeaderProps {
	searchValue: string;
	selectedStatus: EmployeeStatus | null;
	onSearch: (value: string) => void;
	onStatusChange: (value: EmployeeStatus | null) => void;
	onCreate: () => void;
}

type StatusFilterValue = "all" | EmployeeStatus;

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
	searchValue,
	selectedStatus,
	onSearch,
	onStatusChange,
	onCreate,
}) => {
	const statusOptions: SegmentedOption<StatusFilterValue>[] = [
		{ value: "all", label: translate("employee.filter.all") },
		...EMPLOYEE_STATUSES.map((status) => ({
			value: status,
			label: translate(`employee.status.${status}`),
		})),
	];

	return (
		<Box sx={{ mb: 3 }}>
			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					justifyContent: "space-between",
					alignItems: "flex-start",
					gap: 2,
					mb: 2,
				}}
			>
				<Box>
					<Typography variant="h1">{translate("employeesTitle")}</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
						{translate("employee.subtitle")}
					</Typography>
				</Box>
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
					{translate("employee.newButton")}
				</Button>
			</Box>

			<Box
				sx={{
					display: "flex",
					flexWrap: "wrap",
					alignItems: "center",
					gap: 2,
				}}
			>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={translate("searchEmployeesPlaceholder")}
				/>
				<SegmentedControl<StatusFilterValue>
					value={selectedStatus ?? "all"}
					options={statusOptions}
					onChange={(value) => onStatusChange(value === "all" ? null : value)}
				/>
			</Box>
		</Box>
	);
};

export default EmployeeHeader;
