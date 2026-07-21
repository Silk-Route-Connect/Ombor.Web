import React from "react";
import AuthLangFooter from "components/auth/AuthLangFooter";
import BrandPanel, { BrandLockup } from "components/auth/BrandPanel";
import { designTokens } from "theme";

import { Box } from "@mui/material";

/**
 * The redesigned auth surface: a floating two-panel card (teal brand panel +
 * form panel) centered on a masked blueprint grid, outside the app shell. Each
 * auth page renders its own head/fields/actions as `children`; this shell adds
 * the brand panel, the mobile wordmark and the shared language footer.
 */
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<Box
		sx={{
			position: "relative",
			minHeight: "100vh",
			display: "grid",
			placeItems: "center",
			p: { xs: "24px 16px", md: "40px 24px" },
			bgcolor: designTokens.gray50,
			overflow: "hidden",
			"&::before": {
				content: '""',
				position: "absolute",
				inset: 0,
				backgroundImage: `linear-gradient(${designTokens.gray200} 1px, transparent 1px), linear-gradient(90deg, ${designTokens.gray200} 1px, transparent 1px)`,
				backgroundSize: "24px 24px",
				maskImage: "radial-gradient(ellipse 72% 64% at 50% 46%, #000 0%, transparent 80%)",
				WebkitMaskImage: "radial-gradient(ellipse 72% 64% at 50% 46%, #000 0%, transparent 80%)",
				opacity: 0.8,
				pointerEvents: "none",
			},
		}}
	>
		<Box
			sx={{
				position: "relative",
				width: { xs: "min(440px, 100%)", md: "min(960px, 100%)" },
				maxHeight: { xs: "none", md: "94vh" },
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
				minHeight: { md: 588 },
				borderRadius: "16px",
				border: "1px solid",
				borderColor: "divider",
				bgcolor: "rgba(255,255,255,0.72)",
				backdropFilter: "blur(10px)",
				WebkitBackdropFilter: "blur(10px)",
				boxShadow: "0 24px 60px -16px rgba(20,40,40,.28)",
				overflow: "hidden",
			}}
		>
			<BrandPanel />

			<Box
				sx={{
					position: "relative",
					p: { xs: "30px 28px 26px", md: "38px 44px 30px" },
					display: "flex",
					flexDirection: "column",
					overflowY: "auto",
				}}
			>
				<Box sx={{ width: "100%", maxWidth: 372, mx: "auto", my: "auto" }}>
					<Box
						sx={{
							display: { xs: "flex", md: "none" },
							justifyContent: "center",
							mb: "22px",
						}}
					>
						<BrandLockup dark />
					</Box>
					{children}
					<AuthLangFooter />
				</Box>
			</Box>
		</Box>
	</Box>
);

export default AuthLayout;
