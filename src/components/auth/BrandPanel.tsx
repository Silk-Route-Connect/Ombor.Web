import React from "react";
import { useTranslation } from "react-i18next";
import OmborMark from "components/shared/brand/OmborMark";
import { designTokens, iconSize, radius } from "theme";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Box, Typography } from "@mui/material";

/** The Ombor wordmark lockup — the brand monogram + name; reused by the mobile header. */
export const BrandLockup: React.FC<{ dark?: boolean }> = ({ dark }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
		<OmborMark size={38} variant={dark ? "tile" : "reversed"} />
		<Typography
			sx={{
				fontSize: 21,
				fontWeight: 700,
				letterSpacing: "-0.02em",
				color: dark ? "text.primary" : "common.white",
			}}
		>
			Ombor
		</Typography>
	</Box>
);

/** The left brand panel of the auth card (hidden on narrow screens). */
const BrandPanel: React.FC = () => {
	const { t } = useTranslation();
	const bullets: Array<[React.ElementType, string]> = [
		[Inventory2OutlinedIcon, t("auth.brand.bullet.inventory")],
		[SwapHorizOutlinedIcon, t("auth.brand.bullet.transactions")],
		[AccountBalanceWalletOutlinedIcon, t("auth.brand.bullet.finance")],
		[BalanceOutlinedIcon, t("auth.brand.bullet.audit")],
	];

	return (
		<Box
			sx={{
				position: "relative",
				display: { xs: "none", md: "flex" },
				flexDirection: "column",
				p: "40px 38px",
				bgcolor: "primary.main",
				color: "common.white",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					backgroundImage: `linear-gradient(${designTokens.onDarkGrid} 1px, transparent 1px), linear-gradient(90deg, ${designTokens.onDarkGrid} 1px, transparent 1px)`,
					backgroundSize: "26px 26px",
					maskImage: "radial-gradient(ellipse 90% 70% at 28% 18%, black 0%, transparent 78%)",
					WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 28% 18%, black 0%, transparent 78%)",
					pointerEvents: "none",
				},
				"& > *": { position: "relative" },
			}}
		>
			<BrandLockup />

			<Typography
				sx={{
					mt: "auto",
					fontSize: 27,
					lineHeight: 1.18,
					fontWeight: 700,
					letterSpacing: "-0.02em",
					maxWidth: "14ch",
				}}
			>
				{t("auth.brand.tagline")}
			</Typography>

			<Box
				component="ul"
				sx={{
					listStyle: "none",
					m: "22px 0 0",
					p: 0,
					display: "flex",
					flexDirection: "column",
					gap: "14px",
				}}
			>
				{bullets.map(([Icon, text]) => (
					<Box
						component="li"
						key={text}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							fontSize: 14,
							color: "common.white",
						}}
					>
						<Box
							sx={{
								width: 30,
								height: 30,
								flex: "0 0 auto",
								borderRadius: `${radius.md}px`,
								bgcolor: designTokens.onDarkFill,
								display: "grid",
								placeItems: "center",
								color: "common.white",
							}}
						>
							<Icon sx={{ fontSize: iconSize.md }} />
						</Box>
						{text}
					</Box>
				))}
			</Box>

			<Typography sx={{ mt: "28px", fontSize: 12, color: designTokens.onDarkMuted }}>
				{t("auth.brand.foot")}
			</Typography>
		</Box>
	);
};

export default BrandPanel;
