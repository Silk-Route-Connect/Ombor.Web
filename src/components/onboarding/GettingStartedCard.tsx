import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { numericSx } from "theme";

import CloseIcon from "@mui/icons-material/Close";
import { Box, IconButton, LinearProgress, Paper, Tooltip, Typography } from "@mui/material";

import GettingStartedStep from "./GettingStartedStep";
import { ONBOARDING_STEPS, OnboardingStepKey } from "./onboardingSteps";

interface GettingStartedCardProps {
	progress: Record<OnboardingStepKey, boolean>;
	doneCount: number;
	onStep: (key: OnboardingStepKey) => void;
	onDismiss: () => void;
}

/**
 * Dashboard «Первые шаги» checklist (ux-2 / scope-22): the four getting-started
 * steps, each ticked from real data by `OnboardingStore`, shown until all are done
 * or the owner hides it.
 */
const GettingStartedCard: React.FC<GettingStartedCardProps> = observer(
	({ progress, doneCount, onStep, onDismiss }) => {
		const { t } = useTranslation();
		const total = ONBOARDING_STEPS.length;

		return (
			<Paper
				elevation={1}
				sx={{
					border: "1px solid",
					borderColor: "divider",
					borderRadius: "12px",
					p: "22px 24px 22px",
					mb: "16px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant="h2" component="div">
							{t(doneCount === 0 ? "onboarding.titleNew" : "onboarding.title")}
						</Typography>
						<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px", lineHeight: 1.6 }}>
							{t("onboarding.body")}
						</Typography>
					</Box>
					<Typography sx={{ ...numericSx, fontSize: 13, color: "text.secondary", mt: "6px" }}>
						{t("onboarding.progress", { done: doneCount, total })}
					</Typography>
					<Tooltip title={t("onboarding.dismiss")}>
						<IconButton size="small" aria-label={t("onboarding.dismiss")} onClick={onDismiss}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Box>

				<LinearProgress
					variant="determinate"
					value={(doneCount / total) * 100}
					sx={{ mt: "14px", height: 6, borderRadius: 3 }}
				/>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
						gap: "12px",
						mt: "16px",
					}}
				>
					{ONBOARDING_STEPS.map((step, i) => (
						<GettingStartedStep
							key={step.key}
							step={step}
							index={i}
							done={progress[step.key]}
							onOpen={() => onStep(step.key)}
						/>
					))}
				</Box>
			</Paper>
		);
	},
);

export default GettingStartedCard;
