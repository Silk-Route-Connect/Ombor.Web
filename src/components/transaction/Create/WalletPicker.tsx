import React from "react";
import { useTranslation } from "react-i18next";
import { Wallet, WalletType } from "models/wallet";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Box, ListItemText, MenuItem, Select, Typography } from "@mui/material";

interface WalletPickerProps {
	value: number | null;
	wallets: Wallet[];
	onChange: (id: number) => void;
}

const WALLET_ICON: Record<WalletType, React.ComponentType<{ sx?: object }>> = {
	Cash: PaymentsOutlinedIcon,
	Card: CreditCardOutlinedIcon,
	Bank: AccountBalanceOutlinedIcon,
};

const WALLET_TYPE_KEY: Record<WalletType, string> = {
	Cash: "wallet.type.cash",
	Card: "wallet.type.card",
	Bank: "wallet.type.bank",
};

/** Wallet selector for the New Sale payment block — the source of tendered cash. */
export const WalletPicker: React.FC<WalletPickerProps> = ({ value, wallets, onChange }) => {
	const { t } = useTranslation();

	return (
		<Select
			value={value != null && wallets.some((w) => w.id === value) ? String(value) : ""}
			onChange={(e) => onChange(Number(e.target.value))}
			displayEmpty
			fullWidth
			renderValue={(v) => {
				const wallet = wallets.find((w) => String(w.id) === v);
				const Icon = wallet ? WALLET_ICON[wallet.type] : PaymentsOutlinedIcon;
				return (
					<Box sx={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
						<Icon sx={{ fontSize: 16, color: "text.disabled" }} />
						<Box
							component="span"
							sx={{ fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis" }}
						>
							{wallet?.name ?? ""}
							{wallet && (
								<Box component="span" sx={{ color: "text.secondary" }}>
									{" "}
									· {t(WALLET_TYPE_KEY[wallet.type])}
								</Box>
							)}
						</Box>
					</Box>
				);
			}}
		>
			{wallets.map((w) => {
				const Icon = WALLET_ICON[w.type];
				return (
					<MenuItem key={w.id} value={String(w.id)} sx={{ gap: "10px" }}>
						<Icon sx={{ fontSize: 17, color: "primary.main" }} />
						<ListItemText
							primary={w.name}
							secondary={
								<Typography component="span" sx={{ fontSize: 12, color: "text.secondary" }}>
									{t("transaction.new.pay.walletBalance", {
										type: t(WALLET_TYPE_KEY[w.type]),
										balance: formatCurrency(w.balance),
									})}
								</Typography>
							}
							slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
						/>
						{w.id === value && (
							<CheckIcon sx={{ fontSize: 16, color: "primary.main", ...numericSx }} />
						)}
					</MenuItem>
				);
			})}
		</Select>
	);
};

export default WalletPicker;
