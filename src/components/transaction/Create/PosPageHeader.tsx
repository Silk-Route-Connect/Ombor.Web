import React from "react";
import BackButton from "components/shared/Buttons/BackButton";

import { Box, Typography } from "@mui/material";

interface PosPageHeaderProps {
	title: string;
	/** Back — the page's own leave guard (unsaved changes), never a bare navigate. */
	onBack: () => void;
	actions?: React.ReactNode;
}

/** ‹ back · title on the left, page actions on the right — New Sale, Supply and Order. */
export const PosPageHeader: React.FC<PosPageHeaderProps> = ({ title, onBack, actions }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "16px",
			mb: "20px",
			flexWrap: "wrap",
		}}
	>
		<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
			<BackButton onClick={onBack} />
			<Typography variant="h1">{title}</Typography>
		</Box>
		{actions && <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>{actions}</Box>}
	</Box>
);

export default PosPageHeader;
