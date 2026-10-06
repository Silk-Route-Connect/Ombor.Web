import React from "react";
import { kindPresentation } from "components/shared/Chip/movementKind";
import { PartnerLedgerEventType } from "models/partner";
import { ChipTokenKey, chipTokens, radius } from "theme";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import SaveAltOutlinedIcon from "@mui/icons-material/SaveAltOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { Box, SvgIconProps, Typography } from "@mui/material";

/**
 * Ledger event → tile colour + icon. Documents reuse the shared kind
 * presentation (Sale teal, Supply saffron, refunds outlined); payment events
 * follow the payment-type hues (Оплата teal, Аванс blue, Возврат аванса
 * saffron); the opening balance is neutral. Never green/red — those mark money.
 */
const EVENT: Record<
	PartnerLedgerEventType,
	{ token: ChipTokenKey; icon: React.ComponentType<SvgIconProps> }
> = {
	sale: kindPresentation("Sale"),
	supply: kindPresentation("Supply"),
	"refund-sale": kindPresentation("SaleRefund"),
	"refund-supply": kindPresentation("SupplyRefund"),
	payment: { token: "teal", icon: AccountBalanceWalletOutlinedIcon },
	deposit: { token: "info", icon: SaveAltOutlinedIcon },
	withdraw: { token: "saffron", icon: UploadOutlinedIcon },
	opening: { token: "neutral", icon: FlagOutlinedIcon },
};

export const eventLabelKey = (type: PartnerLedgerEventType): string => `partner.event.${type}`;

/** Icon tile + event name, as in the ledger/transactions/payments tables. */
export const EventCell: React.FC<{ type: PartnerLedgerEventType; label: string }> = ({
	type,
	label,
}) => {
	const { token, icon: Icon } = EVENT[type] ?? EVENT.opening;
	const tk = chipTokens[token];
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
			<Box
				sx={{
					width: 30,
					height: 30,
					borderRadius: `${radius.md}px`,
					display: "grid",
					placeItems: "center",
					flex: "0 0 auto",
					bgcolor: tk.bg,
					color: tk.color,
					border: "1px solid",
					borderColor: tk.variant === "outline" ? tk.border : "transparent",
				}}
			>
				<Icon sx={{ fontSize: 16 }} />
			</Box>
			<Typography component="span" sx={{ fontWeight: 600, fontSize: 14 }}>
				{label}
			</Typography>
		</Box>
	);
};
