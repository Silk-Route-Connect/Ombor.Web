import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, MenuItem, Select, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { PartnerType } from "models/partner";

const PARTNER_TYPES: PartnerType[] = ["Both", "Customer", "Supplier"];

interface PartnerHeaderProps {
	searchValue: string;
	onSearch: (value: string) => void;
	filterType: PartnerType;
	onTypeChange: (type: PartnerType) => void;
	onCreate: () => void;
}

const PartnerHeader: React.FC<PartnerHeaderProps> = ({
	searchValue,
	onSearch,
	filterType,
	onTypeChange,
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
		<Typography variant="h5">{translate("partner.title")}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("partner.searchPlaceholder")}
			/>
			<FormControl size="small" margin="dense" sx={{ minWidth: 200 }}>
				<Select
					size="small"
					labelId="partner-type-label"
					value={filterType}
					onChange={(e) => onTypeChange(e.target.value as PartnerType)}
					sx={{ minWidth: 200 }}
				>
					{PARTNER_TYPES.map((t) => (
						<MenuItem key={t} value={t}>
							{translate(`partner.filter.${t}`)}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("partner.addButton")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default PartnerHeader;
