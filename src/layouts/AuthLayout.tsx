import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { translate } from "i18n/i18n";

import { Box, Button, Container, Paper, Stack, Typography, useTheme } from "@mui/material";

export interface AuthLayoutProps {
	titleKey: string;
	subtitleKey: string;
	switchTextKey: string;
	switchTo: string;
	bottomHintKey?: string;
	children: React.ReactNode;
	rightMaxWidth?: number;
	hideHeaderSwitch?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
	titleKey,
	subtitleKey,
	switchTextKey,
	switchTo,
	bottomHintKey,
	children,
	rightMaxWidth = 480,
	hideHeaderSwitch = false,
}) => {
	const theme = useTheme();

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
				position: "relative",
				"&::before": {
					content: '""',
					position: "absolute",
					inset: 0,
					backgroundImage: `
            linear-gradient(${theme.palette.divider}22 1px, transparent 1px),
            linear-gradient(90deg, ${theme.palette.divider}22 1px, transparent 1px)
          `,
					backgroundSize: "24px 24px, 24px 24px",
					pointerEvents: "none",
					maskImage: "radial-gradient(ellipse at 50% 30%, black 60%, transparent 90%)",
				},
			}}
		>
			<Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Typography variant="h6" fontWeight={800}>
						Ombor
					</Typography>
					{!hideHeaderSwitch && (
						<Button
							component={RouterLink}
							to={switchTo}
							variant="outlined"
							size="small"
							sx={{ borderRadius: 999, textTransform: "none" }}
						>
							{translate(switchTextKey)}
						</Button>
					)}
				</Stack>
			</Container>

			<Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 }, position: "relative", zIndex: 1 }}>
				<Stack
					direction={{ xs: "column-reverse", md: "row" }}
					spacing={{ xs: 4, md: 8 }}
					alignItems="stretch"
					justifyContent="center"
				>
					<Box
						sx={{
							flex: 1,
							display: { xs: "none", md: "flex" },
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Stack spacing={2} sx={{ maxWidth: 520 }}>
							<Typography variant="h3" fontWeight={800} lineHeight={1.1}>
								{translate(titleKey)}
							</Typography>
							<Typography variant="h6" color="text.secondary" sx={{ opacity: 0.9 }}>
								{translate(subtitleKey)}
							</Typography>
							<Stack spacing={1.2} sx={{ pt: 1 }}>
								<Typography variant="body1">• {translate("auth.benefit.fast")}</Typography>
								<Typography variant="body1">• {translate("auth.benefit.secure")}</Typography>
								<Typography variant="body1">• {translate("auth.benefit.multiUser")}</Typography>
							</Stack>
						</Stack>
					</Box>

					<Box sx={{ flex: 1, display: "grid", placeItems: "center", minWidth: 0 }}>
						<Paper
							elevation={0}
							sx={{
								width: "100%",
								maxWidth: rightMaxWidth,
								p: 0,
								borderRadius: 3,
								background:
									theme.palette.mode === "dark"
										? "rgba(20, 20, 20, 0.6)"
										: "rgba(255, 255, 255, 0.6)",
								backdropFilter: "saturate(180%) blur(8px)",
								border: `1px solid ${theme.palette.divider}`,
								boxShadow: theme.shadows[6],
							}}
						>
							<Stack spacing={0.5} sx={{ display: { xs: "block", md: "none" }, p: 2.5, pb: 0 }}>
								<Typography variant="h4" fontWeight={800}>
									{translate(titleKey)}
								</Typography>
								<Typography variant="body1" color="text.secondary">
									{translate(subtitleKey)}
								</Typography>
							</Stack>

							<Box sx={{ p: { xs: 2.5, md: 4 } }}>
								{children}
								{bottomHintKey ? (
									<Typography
										variant="caption"
										color="text.secondary"
										textAlign="center"
										sx={{ mt: 1 }}
									>
										{translate(bottomHintKey)}
									</Typography>
								) : null}
							</Box>
						</Paper>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
};

export default AuthLayout;
