import React from "react";
import UzsUnit from "components/shared/Money/UzsUnit";
import { WalletTypeAvatar } from "components/wallet/WalletPresentation";
import { Wallet } from "models/wallet";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, MenuItem, Select } from "@mui/material";

/** Wallet dropdown showing the icon + name + balance (bundle `.wpick`). */
export const WalletPicker: React.FC<{
	value: number;
	wallets: Wallet[];
	excludeId: number;
	disabled: boolean;
	error?: boolean;
	onChange: (id: number) => void;
}> = ({ value, wallets, excludeId, disabled, error, onChange }) => (
	<Select
		size="small"
		fullWidth
		displayEmpty
		value={value ? String(value) : ""}
		disabled={disabled}
		error={error}
		onChange={(e) => onChange(Number(e.target.value))}
		renderValue={(raw) => {
			const wallet = wallets.find((w) => String(w.id) === raw);
			if (!wallet) {
				return (
					<Box component="span" sx={{ color: "text.disabled" }}>
						—
					</Box>
				);
			}
			// The selected value shows name + type only; the balance lives in the
			// menu items + the «Доступно» hint (WAL-16 — no third copy here).
			return (
				<Box sx={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
					{/* 20px so the select keeps the 38px control height of its neighbours. */}
					<WalletTypeAvatar type={wallet.type} size={20} iconSize={12} />
					<Box component="span" sx={{ flex: 1, fontSize: 14 }}>
						{wallet.name}
					</Box>
				</Box>
			);
		}}
	>
		{wallets.map((wallet) => (
			<MenuItem key={wallet.id} value={String(wallet.id)} disabled={wallet.id === excludeId}>
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
					<WalletTypeAvatar type={wallet.type} size={28} iconSize={15} />
					<Box component="span" sx={{ flex: 1 }}>
						{wallet.name}
					</Box>
					<Box component="span" sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }}>
						{formatCurrency(wallet.balance)}
						<UzsUnit />
					</Box>
				</Box>
			</MenuItem>
		))}
	</Select>
);

export default WalletPicker;
