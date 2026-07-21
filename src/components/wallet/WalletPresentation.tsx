import React from "react";
import { useTranslation } from "react-i18next";
import { WalletType } from "models/wallet";
import { designTokens } from "theme";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import { Box, SvgIconProps } from "@mui/material";

/**
 * Per-type presentation for wallets, mirroring the bundle's `.wtype` / `.wname-ic`
 * tints: Cash → success (green), Card → primary (teal), Bank → info (blue). The
 * label key resolves to «Наличные / Карта / Банк». Shared by the list, detail,
 * type segmented control and the transfer wallet picker.
 */
export const WALLET_TYPE_META: Record<
	WalletType,
	{ labelKey: string; color: string; bg: string; Icon: React.FC<SvgIconProps> }
> = {
	Cash: {
		labelKey: "wallet.type.cash",
		color: "#17835A",
		bg: designTokens.successBg,
		Icon: LocalAtmOutlinedIcon,
	},
	Card: {
		labelKey: "wallet.type.card",
		color: "#12676B",
		bg: designTokens.primarySoft,
		Icon: CreditCardOutlinedIcon,
	},
	Bank: {
		labelKey: "wallet.type.bank",
		color: "#2A6F97",
		bg: designTokens.infoBg,
		Icon: AccountBalanceOutlinedIcon,
	},
};

/** Tinted, rounded icon tile for a wallet (the `.wname-ic` square). */
export const WalletTypeAvatar: React.FC<{
	type: WalletType;
	size?: number;
	iconSize?: number;
	archived?: boolean;
}> = ({ type, size = 36, iconSize = 18, archived = false }) => {
	const meta = WALLET_TYPE_META[type];
	const Icon = meta.Icon;
	return (
		<Box
			sx={{
				width: size,
				height: size,
				flex: "0 0 auto",
				borderRadius: "9px",
				display: "inline-grid",
				placeItems: "center",
				bgcolor: archived ? designTokens.gray100 : meta.bg,
				color: archived ? designTokens.gray500 : meta.color,
			}}
		>
			<Icon sx={{ fontSize: iconSize }} />
		</Box>
	);
};

/** Pill badge with the wallet type icon + label (the `.wtype` chip). */
export const WalletTypeBadge: React.FC<{ type: WalletType }> = ({ type }) => {
	const { t } = useTranslation();
	const meta = WALLET_TYPE_META[type];
	const Icon = meta.Icon;
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				pl: "8px",
				pr: "10px",
				py: "3px",
				borderRadius: "999px",
				fontSize: 12.5,
				fontWeight: 600,
				lineHeight: 1,
				whiteSpace: "nowrap",
				bgcolor: meta.bg,
				color: meta.color,
			}}
		>
			<Icon sx={{ fontSize: 14 }} />
			{t(meta.labelKey)}
		</Box>
	);
};
