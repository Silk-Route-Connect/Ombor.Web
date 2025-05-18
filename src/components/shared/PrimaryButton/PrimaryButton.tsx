import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

import styles from "./PrimaryButton.module.scss";

export interface PrimaryButtonProps extends ButtonProps {
	icon?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ icon, children, ...buttonProps }) => (
	<Button
		className={`${styles.primaryButton} ${buttonProps.className}`}
		variant="contained"
		startIcon={icon}
		disabled={buttonProps.disabled}
		onClick={buttonProps.onClick}
	>
		{children}
	</Button>
);
