import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { radius } from "theme";

import { Box, ButtonBase, ListItemButton, Paper, Popper, Typography } from "@mui/material";

import { NavItem } from "../config";
import { isRouteActive } from "./navState";
import { NAV_ICON, railButtonSx } from "./styles";

interface RailGroupProps {
	item: NavItem;
	branchActive: boolean;
	pathname: string;
	onNavigate: (to: string) => void;
	onExpandInto: (item: NavItem) => void;
}

/**
 * Collapsed parent: icon button that reveals a hover flyout of its sub-items
 * (design «nav-sub» popover). Clicking the icon expands the rail into that group.
 * The flyout floats over the content, so it keeps the light menu look.
 */
export default function RailGroup({
	item,
	branchActive,
	pathname,
	onNavigate,
	onExpandInto,
}: Readonly<RailGroupProps>) {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const Icon = item.icon;

	const open = () => {
		clearTimeout(closeTimer.current);
	};
	const scheduleClose = () => {
		closeTimer.current = setTimeout(() => setAnchor(null), 140);
	};
	useEffect(() => () => clearTimeout(closeTimer.current), []);

	return (
		<Box
			onMouseEnter={(e) => {
				open();
				setAnchor(e.currentTarget);
			}}
			onMouseLeave={scheduleClose}
		>
			<ListItemButton
				onClick={() => onExpandInto(item)}
				aria-label={t(item.labelKey)}
				sx={railButtonSx(branchActive)}
			>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemButton>
			<Popper
				open={Boolean(anchor)}
				anchorEl={anchor}
				placement="right-start"
				sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
				modifiers={[{ name: "offset", options: { offset: [-4, 10] } }]}
			>
				<Paper
					elevation={0}
					onMouseEnter={open}
					onMouseLeave={scheduleClose}
					sx={{
						minWidth: 200,
						p: 1,
						borderRadius: `${radius.lg}px`,
						border: 1,
						borderColor: "divider",
						boxShadow: 8,
					}}
				>
					<Typography
						variant="overline"
						component="div"
						sx={{ px: 1.25, pt: 0.5, pb: 1, color: "text.disabled" }}
					>
						{t(item.labelKey)}
					</Typography>
					{item.children?.map((child) => {
						const active = isRouteActive(pathname, child.to);
						return (
							<ButtonBase
								key={child.labelKey}
								onClick={() => {
									onNavigate(child.to);
									setAnchor(null);
								}}
								sx={{
									width: "100%",
									justifyContent: "flex-start",
									fontFamily: "inherit",
									display: "flex",
									alignItems: "center",
									px: 1.5,
									py: 1,
									borderRadius: `${radius.md}px`,
									fontSize: 14,
									fontWeight: active ? 600 : 500,
									cursor: "pointer",
									color: active ? "primary.main" : "text.secondary",
									bgcolor: active ? "primary.light" : "transparent",
									"&:hover": {
										bgcolor: active ? "primary.light" : "action.hover",
										color: active ? "primary.main" : "text.primary",
									},
								}}
							>
								{t(child.labelKey)}
							</ButtonBase>
						);
					})}
				</Paper>
			</Popper>
		</Box>
	);
}
