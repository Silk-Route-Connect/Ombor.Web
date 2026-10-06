import React from "react";
import IconTile from "components/shared/IconTile/IconTile";
import { AdjustmentDirection } from "models/stockAdjustment";
import { chipTokens, designTokens, radius } from "theme";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { Box, ButtonBase, Typography } from "@mui/material";

interface DirectionCardProps {
	direction: AdjustmentDirection;
	active: boolean;
	title: string;
	subtitle: string;
	onSelect: () => void;
}

/**
 * One of the two direction options in the adjustment form (a radio pair). Stock
 * is not money, so it uses the stock-direction hues of the chips — Increase blue
 * ↓ (in), Decrease amber ↑ (out) — never green/red.
 */
export const DirectionCard: React.FC<DirectionCardProps> = ({
	direction,
	active,
	title,
	subtitle,
	onSelect,
}) => {
	const out = direction === "Decrease";
	const token = out ? "stockOut" : "stockIn";
	const tk = chipTokens[token];
	const Icon = out ? ArrowUpwardIcon : ArrowDownwardIcon;

	return (
		<ButtonBase
			role="radio"
			aria-checked={active}
			onClick={onSelect}
			sx={{
				justifyContent: "flex-start",
				textAlign: "left",
				display: "flex",
				alignItems: "center",
				gap: "12px",
				p: "12px 16px",
				borderRadius: `${radius.md}px`,
				bgcolor: active ? tk.bg : "background.paper",
				border: "1.5px solid",
				borderColor: active ? tk.color : designTokens.borderControl,
				transition: "border-color .14s, background .14s",
				"&:hover": { borderColor: active ? tk.color : "text.primary" },
			}}
		>
			<IconTile icon={<Icon />} token={token} size={34} />
			<Box>
				<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{title}</Typography>
				<Typography sx={{ fontSize: 12, color: "text.secondary", mt: "1px" }}>
					{subtitle}
				</Typography>
			</Box>
		</ButtonBase>
	);
};

export default DirectionCard;
