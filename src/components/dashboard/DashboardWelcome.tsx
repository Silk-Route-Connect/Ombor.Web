import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Paper, Typography } from "@mui/material";

export type WelcomeStep = "products" | "partners" | "sale";

interface Props {
	onStep: (step: WelcomeStep) => void;
}

/**
 * New-business welcome banner (data-driven empty state): a heading + three
 * first-step cards. Shown when the served snapshot has no activity — there is no
 * debug toggle (the prototype's «Пример» switch is a design device, not app UI).
 */
const DashboardWelcome: React.FC<Props> = ({ onStep }) => {
	const { t } = useTranslation();

	const steps: { key: WelcomeStep; title: string; body: string }[] = [
		{
			key: "products",
			title: t("dashboard.welcome.step1.title"),
			body: t("dashboard.welcome.step1.body"),
		},
		{
			key: "partners",
			title: t("dashboard.welcome.step2.title"),
			body: t("dashboard.welcome.step2.body"),
		},
		{
			key: "sale",
			title: t("dashboard.welcome.step3.title"),
			body: t("dashboard.welcome.step3.body"),
		},
	];

	return (
		<Paper
			elevation={1}
			sx={{
				position: "relative",
				overflow: "hidden",
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				p: "26px 26px 24px",
				mb: "16px",
			}}
		>
			<Box
				sx={{
					position: "absolute",
					right: -60,
					top: -60,
					width: 220,
					height: 220,
					borderRadius: "50%",
					bgcolor: designTokens.primarySoft,
					opacity: 0.5,
				}}
			/>
			<Typography
				sx={{ position: "relative", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}
			>
				{t("dashboard.welcome.heading")}
			</Typography>
			<Typography
				sx={{
					position: "relative",
					fontSize: 14,
					color: "text.secondary",
					mt: "6px",
					maxWidth: 560,
					lineHeight: 1.6,
				}}
			>
				{t("dashboard.welcome.body")}
			</Typography>

			<Box
				sx={{
					position: "relative",
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
					gap: "14px",
					mt: "20px",
				}}
			>
				{steps.map((s, i) => (
					<Box
						key={s.key}
						onClick={() => onStep(s.key)}
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "13px",
							p: "16px",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "8px",
							bgcolor: "background.paper",
							cursor: "pointer",
							transition: "border-color .14s, box-shadow .14s, transform .14s",
							"&:hover": {
								borderColor: designTokens.primaryLine,
								boxShadow: 1,
								transform: "translateY(-1px)",
							},
						}}
					>
						<Box
							sx={{
								width: 30,
								height: 30,
								flex: "0 0 auto",
								borderRadius: "8px",
								display: "grid",
								placeItems: "center",
								bgcolor: designTokens.primarySoft,
								color: "primary.main",
								fontWeight: 700,
								fontSize: 14,
							}}
						>
							{i + 1}
						</Box>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 600 }}>{s.title}</Typography>
							<Typography
								sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px", lineHeight: 1.5 }}
							>
								{s.body}
							</Typography>
						</Box>
						<ChevronRightIcon sx={{ fontSize: 18, color: "text.disabled", flex: "0 0 auto" }} />
					</Box>
				))}
			</Box>
		</Paper>
	);
};

export default DashboardWelcome;
