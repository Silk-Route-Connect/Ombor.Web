import React from "react";
import { translate } from "i18n/i18n";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

import { DashboardWallet, WalletIcon } from "../../models/dashboard";

export const ALL_WALLETS = "all";

const ICONS: Record<WalletIcon, React.ElementType> = {
	all: LayersOutlinedIcon,
	cash: PaymentsOutlinedIcon,
	bank: AccountBalanceOutlinedIcon,
};

interface WalletSelectorProps {
	wallets: DashboardWallet[];
	value: string; // wallet id or ALL_WALLETS
	onChange: (value: string) => void;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ wallets, value, onChange }) => {
	const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);

	const options: { id: string; label: string; icon: WalletIcon }[] = [
		{ id: ALL_WALLETS, label: translate("dashboard.payments.allWallets"), icon: "all" },
		...wallets,
	];
	const current = options.find((o) => o.id === value) ?? options[0];
	const CurrentIcon = ICONS[current.icon];

	const handleSelect = (id: string) => {
		onChange(id);
		setAnchor(null);
	};

	return (
		<>
			<Button
				variant="outlined"
				size="small"
				startIcon={<CurrentIcon sx={{ fontSize: 16 }} />}
				endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={{ color: "text.primary", fontWeight: 500 }}
			>
				{current.label}
			</Button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{options.map((opt) => {
					const Icon = ICONS[opt.icon];
					const selected = opt.id === value;
					return (
						<MenuItem key={opt.id} selected={selected} onClick={() => handleSelect(opt.id)}>
							<ListItemIcon sx={{ color: "text.secondary" }}>
								<Icon sx={{ fontSize: 18 }} />
							</ListItemIcon>
							<ListItemText
								primaryTypographyProps={{ sx: { fontSize: "0.875rem" } }}
								sx={{ pr: 2 }}
							>
								{opt.label}
							</ListItemText>
							{selected && <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />}
						</MenuItem>
					);
				})}
			</Menu>
		</>
	);
};

export default WalletSelector;
