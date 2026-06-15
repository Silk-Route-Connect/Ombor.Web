import React from "react";
import { useTranslation } from "react-i18next";
import { Order, OrderStatus } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";

import CloseIcon from "@mui/icons-material/Close";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

const timeOf = (iso: string): string => {
	const d = new Date(iso);
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

type TerminalStatus = "Cancelled" | "Rejected" | "Returned";
const isTerminal = (s: OrderStatus): s is TerminalStatus =>
	s === "Cancelled" || s === "Rejected" || s === "Returned";

/** Banner shown for branch endings (cancelled / rejected / returned). */
export const TerminalBanner: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();
	if (!isTerminal(order.status)) {
		return null;
	}

	const last = order.history[order.history.length - 1];
	const danger = order.status === "Rejected" || order.status === "Returned";
	const tone = danger
		? {
				bg: designTokens.errorBg,
				border: designTokens.errorBorder,
				icBg: "#F5DAD4",
				color: "error.main",
				title: "#8E2A1E",
			}
		: {
				bg: designTokens.gray50,
				border: designTokens.gray200,
				icBg: designTokens.gray200,
				color: designTokens.gray600,
				title: designTokens.gray700,
			};

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "14px",
				p: "14px 18px",
				mb: "18px",
				borderRadius: "12px",
				border: "1px solid",
				borderColor: tone.border,
				bgcolor: tone.bg,
			}}
		>
			<Box
				sx={{
					width: 38,
					height: 38,
					borderRadius: "10px",
					display: "grid",
					placeItems: "center",
					flex: "0 0 auto",
					bgcolor: tone.icBg,
					color: tone.color,
				}}
			>
				{order.status === "Rejected" ? (
					<CloseIcon sx={{ fontSize: 20 }} />
				) : (
					<UndoOutlinedIcon sx={{ fontSize: 20 }} />
				)}
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 14.5, fontWeight: 700, color: tone.title }}>
					{t(`order.terminal.${order.status}.title`)}
				</Typography>
				<Typography sx={{ fontSize: 12.5, mt: "2px", lineHeight: 1.45, color: tone.color }}>
					{t(`order.terminal.${order.status}.body`)}
				</Typography>
			</Box>
			<Box
				sx={{
					ml: "auto",
					fontSize: 12,
					textAlign: "right",
					whiteSpace: "nowrap",
					color: tone.color,
				}}
			>
				<Box component="span" sx={numericSx}>
					{formatDate(last.at)}, {timeOf(last.at)}
				</Box>{" "}
				· {last.by}
			</Box>
		</Box>
	);
};

export default TerminalBanner;
