import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { Order, OrderStatus } from "models/order";
import { designTokens, numericSx, radius } from "theme";
import { formatDateTime } from "utils/dateUtils";

import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

type TerminalStatus = "Cancelled" | "Rejected" | "Returned";
const isTerminal = (s: OrderStatus): s is TerminalStatus =>
	s === "Cancelled" || s === "Rejected" || s === "Returned";

/**
 * Banner shown for branch endings (cancelled / rejected / returned). «Returned»
 * is a bare status change on the backend (no stock or debt movement), so it
 * offers the real next step: the promoted sale, where a sale refund is created.
 */
export const TerminalBanner: React.FC<{ order: Order; onOpenSale: (saleId: number) => void }> = ({
	order,
	onOpenSale,
}) => {
	const { t } = useTranslation();
	if (!isTerminal(order.status)) {
		return null;
	}

	const last = order.history?.[order.history.length - 1];
	const danger = order.status === "Rejected" || order.status === "Returned";
	// Single --error red per tokens.css — the icon tile uses the error border
	// tint as its fill to stand off the error-bg banner.
	const tone = danger
		? {
				bg: designTokens.errorBg,
				border: designTokens.errorBorder,
				icBg: designTokens.errorBorder,
				color: "error.main",
				title: "error.main",
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
				borderRadius: `${radius.lg}px`,
				border: "1px solid",
				borderColor: tone.border,
				bgcolor: tone.bg,
			}}
		>
			<Box
				sx={{
					width: 38,
					height: 38,
					borderRadius: `${radius.md}px`,
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
				<Typography sx={{ fontSize: 14, fontWeight: 700, color: tone.title }}>
					{t(`order.terminal.${order.status}.title`)}
				</Typography>
				<Typography variant="body2" sx={{ mt: "2px", color: tone.color }}>
					{t(`order.terminal.${order.status}.body`)}
				</Typography>
				{order.status === "Returned" && order.saleId != null && (
					<GhostButton
						size="small"
						icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />}
						onClick={() => onOpenSale(order.saleId!)}
						sx={{ mt: "10px" }}
					>
						{t("order.terminal.Returned.openSale")}
					</GhostButton>
				)}
			</Box>
			{last && (
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
						{formatDateTime(last.at)}
					</Box>
					{last.by && <> · {last.by}</>}
				</Box>
			)}
		</Box>
	);
};

export default TerminalBanner;
