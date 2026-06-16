import React from "react";
import { useTranslation } from "react-i18next";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

/** The Ombor wordmark lockup — a teal-on-white chip + name, reused by the mobile header. */
export const BrandLockup: React.FC<{ dark?: boolean }> = ({ dark }) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
		<Box
			sx={{
				width: 38,
				height: 38,
				borderRadius: "10px",
				flex: "0 0 auto",
				display: "grid",
				placeItems: "center",
				bgcolor: "background.paper",
				color: "primary.main",
				boxShadow: "0 2px 8px rgba(0,0,0,.18)",
			}}
		>
			<WarehouseOutlinedIcon sx={{ fontSize: 21 }} />
		</Box>
		<Typography
			sx={{
				fontSize: 21,
				fontWeight: 700,
				letterSpacing: "-0.02em",
				color: dark ? "text.primary" : "#fff",
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
				color: "#fff",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					backgroundImage:
						"linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px)",
					backgroundSize: "26px 26px",
					maskImage: "radial-gradient(ellipse 90% 70% at 28% 18%, #000 0%, transparent 78%)",
					WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 28% 18%, #000 0%, transparent 78%)",
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
							color: "rgba(255,255,255,.92)",
						}}
					>
						<Box
							sx={{
								width: 30,
								height: 30,
								flex: "0 0 auto",
								borderRadius: "8px",
								bgcolor: "rgba(255,255,255,.13)",
								display: "grid",
								placeItems: "center",
								color: "#fff",
							}}
						>
							<Icon sx={{ fontSize: 17 }} />
						</Box>
						{text}
					</Box>
				))}
			</Box>

			<Typography sx={{ mt: "28px", fontSize: 12, color: "rgba(255,255,255,.62)" }}>
				{t("auth.brand.foot")}
			</Typography>
		</Box>
	);
};

export default BrandPanel;
