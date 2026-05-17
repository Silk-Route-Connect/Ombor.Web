import React from "react";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";

interface StockTransferHeaderProps {
	searchValue: string;
	titleCount: string;
	onSearch: (value: string) => void;
	onCreate: () => void;
}

const StockTransferHeader: React.FC<StockTransferHeaderProps> = ({
	searchValue,
	titleCount,
	onSearch,
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
		<Typography variant="h5">{`${translate("stockTransfer.title")} (${titleCount})`}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("stockTransfer.searchPlaceholder")}
			/>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("common.create")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default StockTransferHeader;
