import React from "react";
import { PartnerLedgerEventType } from "models/partner";
import { designTokens } from "theme";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { alpha, Box, Theme, Typography, useTheme } from "@mui/material";

const ICONS: Record<PartnerLedgerEventType, React.ReactNode> = {
	opening: <FlagOutlinedIcon sx={{ fontSize: 16 }} />,
	sale: <ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />,
	supply: <LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />,
	"refund-sale": <UndoOutlinedIcon sx={{ fontSize: 16 }} />,
	"refund-supply": <UndoOutlinedIcon sx={{ fontSize: 16 }} />,
	payment: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />,
	deposit: <SaveAltOutlinedIcon sx={{ fontSize: 16 }} />,
	withdraw: <UploadOutlinedIcon sx={{ fontSize: 16 }} />,
};

/** Tile bg/color per the bundle's `.ev-ic` variants. */
function tileStyle(type: PartnerLedgerEventType, theme: Theme): { bgcolor: string; color: string } {
	switch (type) {
		case "sale":
			return {
				bgcolor: alpha(theme.palette.success.main, 0.12),
				color: theme.palette.success.main,
			};
		case "supply":
			return { bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main };
		case "payment":
		case "deposit":
			return { bgcolor: theme.palette.primary.light, color: theme.palette.primary.main };
		case "withdraw":
			return { bgcolor: designTokens.accentSoft, color: designTokens.saffron700 };
		case "refund-sale":
		case "refund-supply":
			return { bgcolor: designTokens.gray100, color: designTokens.gray600 };
		case "opening":
		default:
			return { bgcolor: alpha(theme.palette.info.main, 0.12), color: theme.palette.info.main };
	}
}

export const eventLabelKey = (type: PartnerLedgerEventType): string => `partner.event.${type}`;

/** Icon tile + event name, as in the ledger/transactions/payments tables. */
export const EventCell: React.FC<{ type: PartnerLedgerEventType; label: string }> = ({
	type,
	label,
}) => {
	const theme = useTheme();
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
			<Box
				sx={{
					width: 30,
					height: 30,
					borderRadius: "8px",
					display: "grid",
					placeItems: "center",
					flex: "0 0 auto",
					...tileStyle(type, theme),
				}}
			>
				{ICONS[type]}
			</Box>
			<Typography component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
				{label}
			</Typography>
		</Box>
	);
};
