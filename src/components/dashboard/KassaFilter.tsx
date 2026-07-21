import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardWallet } from "models/dashboard";
import { WalletType } from "models/wallet";
import { designTokens } from "theme";

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
		return <AccountBalanceOutlinedIcon sx={{ fontSize: 16 }} />;
	}
	if (type === "Card") {
		return <CreditCardOutlinedIcon sx={{ fontSize: 16 }} />;
	}
	return <PaymentsOutlinedIcon sx={{ fontSize: 16 }} />;
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
	const icon = current ? walletIcon(current.type) : <LayersOutlinedIcon sx={{ fontSize: 16 }} />;

	const select = (v: KassaSelection): void => {
		onChange(v);
		setAnchor(null);
	};

	return (
		<>
			<Button
				onClick={(e) => setAnchor(e.currentTarget)}
				startIcon={icon}
				endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 14, opacity: 0.5 }} />}
				sx={{
					color: "text.primary",
					fontSize: 13,
					fontWeight: 500,
					px: "10px",
					py: "6px",
					borderRadius: "8px",
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
			>
				<MenuItem selected={value === "all"} onClick={() => select("all")}>
					<ListItemIcon>
						<LayersOutlinedIcon sx={{ fontSize: 18 }} />
					</ListItemIcon>
					<ListItemText primaryTypographyProps={{ fontSize: 13.5 }}>
						{t("dashboard.chart.allWallets")}
					</ListItemText>
					{value === "all" && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
				</MenuItem>
				{wallets.map((w, i) => (
					<MenuItem key={w.id} selected={value === i} onClick={() => select(i)}>
						<ListItemIcon>{walletIcon(w.type)}</ListItemIcon>
						<ListItemText primaryTypographyProps={{ fontSize: 13.5 }}>{w.name}</ListItemText>
						{value === i && <CheckIcon sx={{ fontSize: 16, ml: 1.5, color: "primary.main" }} />}
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default KassaFilter;
