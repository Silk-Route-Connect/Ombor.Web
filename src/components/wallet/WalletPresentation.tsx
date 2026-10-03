import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { WalletType } from "models/wallet";
import { ChipTokenKey, chipTokens, designTokens, radius } from "theme";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import { Box, SvgIconProps } from "@mui/material";

/**
 * Per-type presentation for wallets: Cash green, Card teal, Bank blue. The label
 * key resolves to «Наличные / Карта / Банк». Shared by the list, detail, type
 * segmented control and the transfer wallet picker.
 */
export const WALLET_TYPE_META: Record<
	WalletType,
	{ labelKey: string; token: ChipTokenKey; Icon: React.FC<SvgIconProps> }
> = {
	Cash: { labelKey: "wallet.type.cash", token: "success", Icon: LocalAtmOutlinedIcon },
	Card: { labelKey: "wallet.type.card", token: "teal", Icon: CreditCardOutlinedIcon },
	Bank: { labelKey: "wallet.type.bank", token: "info", Icon: AccountBalanceOutlinedIcon },
};

/** Tinted, rounded icon tile for a wallet (archived wallets render neutral). */
export const WalletTypeAvatar: React.FC<{
	type: WalletType;
	size?: number;
	iconSize?: number;
	archived?: boolean;
}> = ({ type, size = 36, iconSize = 18, archived = false }) => {
	const meta = WALLET_TYPE_META[type];
	const tk = chipTokens[archived ? "neutral" : meta.token];
	const Icon = meta.Icon;
	return (
		<Box
			sx={{
				width: size,
				height: size,
				flex: "0 0 auto",
				borderRadius: `${radius.md}px`,
				display: "inline-grid",
				placeItems: "center",
				bgcolor: tk.bg,
				color: archived ? designTokens.fg3 : tk.color,
			}}
		>
			<Icon sx={{ fontSize: iconSize }} />
		</Box>
	);
};

/** Wallet type pill with its icon. */
export const WalletTypeBadge: React.FC<{ type: WalletType }> = ({ type }) => {
	const { t } = useTranslation();
	const meta = WALLET_TYPE_META[type];
	return <StatusPill token={meta.token} icon={meta.Icon} label={t(meta.labelKey)} />;
};
