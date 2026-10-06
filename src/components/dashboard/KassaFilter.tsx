import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { menuItemSx, menuSlotProps } from "components/shared/ActionMenuCell/menuPaper";
import { DashboardWallet } from "models/dashboard";
import { WalletType } from "models/wallet";
import { designTokens, radius } from "theme";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

/** "all" = combined; otherwise the wallet index in `wallets`. */
export type KassaSelection = "all" | number;

const walletIcon = (type: WalletType): React.ReactNode => {
	if (type === "Bank") {
		return <AccountBalanceOutlinedIcon fontSize="small" />;
	}
	if (type === "Card") {
		return <CreditCardOutlinedIcon fontSize="small" />;
	}
	return <PaymentsOutlinedIcon fontSize="small" />;
};

interface Props {
	wallets: DashboardWallet[];
	value: KassaSelection;
	onChange: (value: KassaSelection) => void;
}

/**
 * Wallet (касса) filter for the payments chart — combined «Все кассы» or one
 * money location. A ghost dropdown opening a checkable menu.
 */
const KassaFilter: React.FC<Props> = ({ wallets, value, onChange }) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	const current =
		value === "all" ? null : ((wallets[value] as DashboardWallet | undefined) ?? null);
	const label = current ? current.name : t("dashboard.chart.allWallets");
	const icon = current ? walletIcon(current.type) : <LayersOutlinedIcon fontSize="small" />;

	const select = (v: KassaSelection): void => {
		onChange(v);
		setAnchor(null);
	};

	return (
		<>
			<Button
				onClick={(e) => setAnchor(e.currentTarget)}
				startIcon={icon}
				endIcon={<KeyboardArrowDownIcon sx={{ opacity: 0.5 }} />}
				sx={{
					color: "text.primary",
					fontSize: 13,
					fontWeight: 500,
					px: "10px",
					py: "6px",
					borderRadius: `${radius.md}px`,
					whiteSpace: "nowrap",
					"&:hover": { bgcolor: designTokens.gray50 },
				}}
			>
				{label}
			</Button>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				slotProps={menuSlotProps}
			>
				<MenuItem selected={value === "all"} onClick={() => select("all")} sx={menuItemSx}>
					<ListItemIcon sx={{ color: "text.secondary" }}>
						<LayersOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>{t("dashboard.chart.allWallets")}</ListItemText>
					{value === "all" && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
				</MenuItem>
				{wallets.map((w, i) => (
					<MenuItem key={w.id} selected={value === i} onClick={() => select(i)} sx={menuItemSx}>
						<ListItemIcon sx={{ color: "text.secondary" }}>{walletIcon(w.type)}</ListItemIcon>
						<ListItemText>{w.name}</ListItemText>
						{value === i && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default KassaFilter;
