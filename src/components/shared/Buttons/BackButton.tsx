import React from "react";
import { useTranslation } from "react-i18next";
import { controlSize, designTokens, radius } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { ButtonBase } from "@mui/material";

interface BackButtonProps {
	onClick: () => void;
	/** Accessible name; defaults to the shared «Назад». */
	label?: string;
}

/** The bordered ‹ back control left of a page title (detail headers, POS pages). */
export const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
	const { t } = useTranslation();
	return (
		<ButtonBase
			onClick={onClick}
			aria-label={label ?? t("common.back")}
			sx={{
				width: controlSize.md.height,
				height: controlSize.md.height,
				flex: "0 0 auto",
				borderRadius: `${radius.md}px`,
				border: "1px solid",
				borderColor: designTokens.borderStrong,
				bgcolor: "background.paper",
				color: designTokens.gray700,
				"&:hover": { bgcolor: designTokens.bgCanvas, borderColor: designTokens.borderControl },
			}}
		>
			<ChevronLeftIcon sx={{ fontSize: 20 }} />
		</ButtonBase>
	);
};

export default BackButton;
