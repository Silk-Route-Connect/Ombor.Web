import React from "react";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { EmployeeStatus } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

import EmployeeStatusSelect from "../Select/EmployeeStatusSelect";

interface EmployeeHeaderProps {
	searchValue: string;
	selectedStatus: EmployeeStatus | null;
	titleCount: string;

	onSearch: (value: string) => void;
	onStatusChange: (value: EmployeeStatus | null) => void;
	onCreate: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
	searchValue,
	selectedStatus,
	titleCount,
	onSearch,
	onStatusChange,
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
		<Typography variant="h5">{`${translate("employeesTitle")} (${titleCount})`}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("searchEmployeesPlaceholder")}
			/>
			<FormControl size="small" margin="dense" sx={{ minWidth: 200 }}>
				<EmployeeStatusSelect value={selectedStatus} onChange={onStatusChange} />
			</FormControl>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("add")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default EmployeeHeader;
