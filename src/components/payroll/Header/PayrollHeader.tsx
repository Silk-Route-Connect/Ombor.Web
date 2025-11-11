import React from "react";
import EmployeeAutocomplete from "components/employee/Autocomplete/EmployeeAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

interface PayrollHeaderProps {
	searchValue: string;
	selectedEmployee: Employee | null;
	titleCount: string;

	onSearch: (value: string) => void;
	onEmployeeChange: (employeeId: number | null) => void;
	onCreate: () => void;
}

const PayrollHeader: React.FC<PayrollHeaderProps> = ({
	searchValue,
	selectedEmployee,
	titleCount,
	onSearch,
	onEmployeeChange,
	onCreate,
}) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{`${translate("payroll.pageTitle")} (${titleCount})`}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("payroll.searchPlaceholder")}
			/>
			<FormControl size="small" margin="dense" sx={{ minWidth: 200 }}>
				<EmployeeAutocomplete
					value={selectedEmployee}
					size="small"
					onChange={(employee) => onEmployeeChange(employee?.id || null)}
				/>
			</FormControl>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("add")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default PayrollHeader;
