import React from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { numericSx, radius } from "theme";

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
 * or the owner hides it. A first-run card explains itself; once a step is done it
 * tightens (smaller title, no intro, finished steps on one line) so it stops
 * pushing the day's figures below the fold.
 */
const GettingStartedCard: React.FC<GettingStartedCardProps> = observer(
	({ progress, doneCount, onStep, onDismiss }) => {
		const { t } = useTranslation();
		const total = ONBOARDING_STEPS.length;
		const firstRun = doneCount === 0;

		return (
			<Paper
				elevation={1}
				sx={{
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.lg}px`,
					p: firstRun ? "22px 24px" : "16px 20px 18px",
					mb: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: firstRun ? "flex-start" : "center", gap: 1.5 }}>
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography variant={firstRun ? "h2" : "h3"} component="div">
							{t(firstRun ? "onboarding.titleNew" : "onboarding.title")}
						</Typography>
						{firstRun && (
							<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
								{t("onboarding.body")}
							</Typography>
						)}
					</Box>
					<Typography variant="body2" sx={{ ...numericSx, color: "text.secondary" }}>
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
					sx={{
						mt: firstRun ? 1.75 : 1.25,
						height: firstRun ? 6 : 4,
						borderRadius: `${radius.pill}px`,
					}}
				/>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" },
						// Finished steps are one line; they keep their height instead of
						// stretching to the open step's two-line hint.
						alignItems: "start",
						gap: 1.5,
						mt: firstRun ? 2 : 1.75,
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
