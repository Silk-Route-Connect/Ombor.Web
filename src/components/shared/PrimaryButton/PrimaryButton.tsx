import React from "react";

import Button, { ButtonProps } from "@mui/material/Button";

export interface PrimaryButtonProps extends ButtonProps {
	icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ icon, children, ...buttonProps }) => {
	return (
		<Button
			variant="contained"
			startIcon={icon}
			sx={{ whiteSpace: "nowrap", py: 1, px: 2 }}
			{...buttonProps}
		>
			{children}
		</Button>
	);
};
