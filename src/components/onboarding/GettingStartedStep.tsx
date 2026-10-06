import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens, radius } from "theme";

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
				borderColor: "divider",
				borderRadius: `${radius.md}px`,
				// A finished step steps back (quiet fill, green tick) so the open one leads.
				bgcolor: done ? designTokens.bgSubtle : "background.paper",
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
					borderRadius: `${radius.md}px`,
					display: "grid",
					placeItems: "center",
					bgcolor: done ? designTokens.successBg : designTokens.primarySoft,
					color: done ? "success.dark" : "primary.main",
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
				<Typography variant="caption" component="div" sx={{ color: "text.secondary", mt: "3px" }}>
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
