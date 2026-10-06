import React from "react";
import { useTranslation } from "react-i18next";
import { ONBOARDING_STEPS } from "components/onboarding/onboardingSteps";
import { designTokens } from "theme";

import { Box, Button, Typography } from "@mui/material";

import { AuthSuccessBadge } from "./AuthChrome";

interface RegisterWelcomeProps {
	company: string;
	onStart: () => void;
}

/** After the code is confirmed: the account exists; «Начать работу» enters the app. */
const RegisterWelcome: React.FC<RegisterWelcomeProps> = ({ company, onStart }) => {
	const { t } = useTranslation();

	return (
		<>
			<Box sx={{ textAlign: "center" }}>
				<AuthSuccessBadge />
				<Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
					{t("auth.welcome.title")}
				</Typography>
				<Typography sx={{ fontSize: 14, color: "text.secondary", mt: "6px" }}>
					{t("auth.welcome.subtitle", { company })}
				</Typography>
			</Box>
			{/* The same steps the dashboard checklist ticks off from real data. */}
			<Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mt: "22px" }}>
				{ONBOARDING_STEPS.map(({ key, icon: Icon }, i) => (
					<Box
						key={key}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "13px",
							p: "12px 13px",
							borderRadius: "8px",
							border: "1px solid",
							borderColor: "divider",
							bgcolor: designTokens.gray25,
						}}
					>
						<Box
							sx={{
								width: 38,
								height: 38,
								flex: "0 0 auto",
								borderRadius: "8px",
								bgcolor: designTokens.primarySoft,
								color: "primary.main",
								display: "grid",
								placeItems: "center",
							}}
						>
							<Icon sx={{ fontSize: 19 }} />
						</Box>
						<Box>
							<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
								{i + 1}. {t(`onboarding.step.${key}.title`)}
							</Typography>
							<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "1px" }}>
								{t(`onboarding.step.${key}.body`)}
							</Typography>
						</Box>
					</Box>
				))}
			</Box>
			<Box sx={{ mt: "22px" }}>
				<Button
					variant="contained"
					fullWidth
					onClick={onStart}
					sx={{ height: 46, fontSize: 15, borderRadius: "10px" }}
				>
					{t("auth.welcome.start")}
				</Button>
			</Box>
		</>
	);
};

export default RegisterWelcome;
