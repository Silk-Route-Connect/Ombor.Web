import React from "react";
import { useTranslation } from "react-i18next";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { ButtonBase } from "@mui/material";

import { iconSquareSx } from "./iconSquareSx";

interface BackButtonProps {
	onClick: () => void;
	/** Accessible name; defaults to the shared «Назад». */
	label?: string;
}

/** The bordered ‹ back control left of a page title (detail headers, POS pages). */
export const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
	const { t } = useTranslation();
	return (
		<ButtonBase onClick={onClick} aria-label={label ?? t("common.back")} sx={iconSquareSx}>
			<ChevronLeftIcon />
		</ButtonBase>
	);
};

export default BackButton;
