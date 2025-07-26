import { Box, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

interface EmployeeHeaderProps {
	searchValue: string;
	onSearch: (value: string) => void;
	onCreate: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ searchValue, onSearch, onCreate }) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{translate("employee.title")}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("employee.searchPlaceholder")}
			/>
			<PrimaryButton onClick={onCreate}>{translate("employee.addButton")}</PrimaryButton>
		</Box>
	</Box>
);

export default EmployeeHeader;
