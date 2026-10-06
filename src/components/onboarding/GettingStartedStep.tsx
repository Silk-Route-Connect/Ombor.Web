import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Typography } from "@mui/material";

import { OnboardingStepDef } from "./onboardingSteps";

interface GettingStartedStepProps {
	step: OnboardingStepDef;
	index: number;
	done: boolean;
	onOpen: () => void;
}

/** One checklist row: number (or a tick once the data shows it's done), title, hint. */
const GettingStartedStep: React.FC<GettingStartedStepProps> = ({ step, index, done, onOpen }) => {
	const { t } = useTranslation();

	return (
		<Box
			component="button"
			type="button"
			onClick={onOpen}
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: "12px",
				p: "14px",
				width: "100%",
				font: "inherit",
				color: "inherit",
				textAlign: "left",
				border: "1px solid",
				borderColor: done ? designTokens.successBorder : "divider",
				borderRadius: "8px",
				bgcolor: done ? designTokens.successBg : "background.paper",
				cursor: "pointer",
				transition: "border-color .14s, box-shadow .14s",
				"&:hover": { borderColor: designTokens.primaryLine, boxShadow: 1 },
				"&:focus-visible": {
					outline: "2px solid",
					outlineColor: "primary.main",
					outlineOffset: "2px",
				},
			}}
		>
			<Box
				sx={{
					width: 28,
					height: 28,
					flex: "0 0 auto",
					borderRadius: "8px",
					display: "grid",
					placeItems: "center",
					bgcolor: done ? "success.main" : designTokens.primarySoft,
					color: done ? "common.white" : "primary.main",
					fontWeight: 700,
					fontSize: 13,
				}}
			>
				{done ? <CheckIcon sx={{ fontSize: 17 }} /> : index + 1}
			</Box>
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Typography
					sx={{ fontSize: 14, fontWeight: 600, color: done ? "text.secondary" : "text.primary" }}
				>
					{t(`onboarding.step.${step.key}.title`)}
				</Typography>
				<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "3px", lineHeight: 1.5 }}>
					{done ? t("onboarding.done") : t(`onboarding.step.${step.key}.body`)}
				</Typography>
			</Box>
			{!done && (
				<ChevronRightIcon sx={{ fontSize: 18, color: "text.disabled", flex: "0 0 auto" }} />
			)}
		</Box>
	);
};

export default GettingStartedStep;
