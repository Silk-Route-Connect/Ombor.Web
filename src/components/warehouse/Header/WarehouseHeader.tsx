import React from "react";
import { translate } from "i18n/i18n";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Typography } from "@mui/material";

interface WarehouseHeaderProps {
	onCreate: () => void;
}

const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({ onCreate }) => (
	<Box
		sx={{
			display: "flex",
			flexWrap: "wrap",
			justifyContent: "space-between",
			alignItems: "flex-start",
			gap: 2,
			mb: 3,
		}}
	>
		<Box>
			<Typography variant="h1">{translate("warehouse.title")}</Typography>
			<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
				{translate("warehouse.subtitle")}
			</Typography>
		</Box>
		<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
			{translate("warehouse.newButton")}
		</Button>
	</Box>
);

export default WarehouseHeader;
