import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Partner, PartnerLedgerEntry } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { balanceColor, balanceLabelKey } from "utils/partnerUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface PartnerBalanceCardProps {
	partner: Partner;
	ledger: PartnerLedgerEntry[];
}

const ContactRow: React.FC<{
	icon: React.ReactNode;
	children: React.ReactNode;
	mono?: boolean;
}> = ({ icon, children, mono }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			fontSize: 13.5,
			color: "text.primary",
		}}
	>
		<Box sx={{ color: "text.disabled", display: "inline-flex", flex: "0 0 auto" }}>{icon}</Box>
		<Box component="span" sx={mono ? numericSx : undefined}>
			{children}
		</Box>
	</Box>
);

const Stat: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: React.ReactNode;
	color?: string;
}> = ({ icon, label, value, color }) => (
	<Box
		sx={{
			px: "18px",
			py: "16px",
			borderRight: "1px solid",
			borderColor: "divider",
			"&:last-of-type": { borderRight: "none" },
		}}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "7px",
				fontSize: 12.5,
				color: "text.secondary",
			}}
		>
			{icon}
			{label}
		</Box>
		<Typography
			sx={{
				...numericSx,
				fontWeight: 700,
				fontSize: 19,
				mt: "7px",
				letterSpacing: "-0.01em",
				color: color ?? "text.primary",
			}}
		>
			{value}
		</Typography>
	</Box>
);

export const PartnerBalanceCard: React.FC<PartnerBalanceCardProps> = ({ partner, ledger }) => {
	const { t } = useTranslation();

	const stats = useMemo(() => {
		const sum = (predicate: (e: PartnerLedgerEntry) => boolean) =>
			ledger.filter(predicate).reduce((s, e) => s + Math.abs(e.delta), 0);
		return {
			sales: sum((e) => e.type === "sale"),
			supplies: sum((e) => e.type === "supply"),
			payments: sum((e) => e.type === "payment" || e.type === "deposit" || e.type === "withdraw"),
		};
	}, [ledger]);

	const phones = partner.phoneNumbers;
	const hintKey =
		partner.balance > 0
			? "partner.balance.receivableHint"
			: partner.balance < 0
				? "partner.balance.payableHint"
				: "partner.balance.zeroHint";

	const statOrDash = (value: number) => (value === 0 ? "—" : formatCurrency(value));

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			<Box sx={{ p: "22px 24px" }}>
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", md: "row" },
						alignItems: { xs: "flex-start", md: "flex-start" },
						justifyContent: "space-between",
						gap: "32px",
					}}
				>
					{/* contacts */}
					<Box sx={{ minWidth: 0, flex: 1 }}>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "7px",
								fontSize: 11,
								fontWeight: 700,
								letterSpacing: "0.08em",
								textTransform: "uppercase",
								color: "text.disabled",
								mb: "12px",
							}}
						>
							<PersonOutlineIcon sx={{ fontSize: 15 }} />
							{t("partner.detail.contacts")}
						</Box>
						<Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
							{phones.map((phone, i) => (
								<ContactRow key={i} icon={<PhoneOutlinedIcon sx={{ fontSize: 15 }} />} mono>
									{phone}
									{i === 0 && phones.length > 1 && (
										<Box
											component="span"
											sx={{
												ml: "8px",
												fontSize: 10.5,
												fontWeight: 600,
												color: "primary.main",
												bgcolor: "primary.light",
												border: "1px solid",
												borderColor: designTokens.primaryLine,
												px: "7px",
												py: "1px",
												borderRadius: "999px",
											}}
										>
											{t("partner.detail.contactPrimary")}
										</Box>
									)}
								</ContactRow>
							))}
							{partner.email && (
								<ContactRow icon={<MailOutlineIcon sx={{ fontSize: 15 }} />}>
									{partner.email}
								</ContactRow>
							)}
							{partner.telegram && (
								<ContactRow icon={<SendOutlinedIcon sx={{ fontSize: 15 }} />} mono>
									{partner.telegram}
								</ContactRow>
							)}
							{partner.address && (
								<ContactRow icon={<PlaceOutlinedIcon sx={{ fontSize: 15 }} />}>
									{partner.address}
								</ContactRow>
							)}
						</Box>
					</Box>

					{/* balance hero */}
					<Box sx={{ textAlign: { xs: "left", md: "right" }, flex: "0 0 auto" }}>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: "4px" }}>
							{t(balanceLabelKey(partner.balance))}
						</Typography>
						<Typography
							sx={{
								...numericSx,
								fontSize: 34,
								fontWeight: 700,
								letterSpacing: "-0.025em",
								lineHeight: 1,
								color: balanceColor(partner.balance),
							}}
						>
							{partner.balance === 0 ? "0" : formatCurrency(Math.abs(partner.balance))}
							<Box
								component="span"
								sx={{ fontSize: 15, fontWeight: 600, color: "text.disabled", ml: "8px" }}
							>
								UZS
							</Box>
						</Typography>
						<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "6px" }}>
							{t(hintKey)}
						</Typography>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: "7px",
								flexWrap: "wrap",
								mt: "16px",
								p: "9px 13px",
								bgcolor: designTokens.gray25,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: "8px",
								fontSize: 12.5,
								color: "text.secondary",
							}}
						>
							<FlagOutlinedIcon sx={{ fontSize: 13, color: "info.main" }} />
							{t("partner.detail.opening")}{" "}
							<Box component="b" sx={{ ...numericSx, fontWeight: 600 }}>
								{formatDate(partner.openingDate)}
							</Box>{" "}
							—{" "}
							<Box
								component="b"
								sx={{ ...numericSx, fontWeight: 600, color: balanceColor(partner.openingBalance) }}
							>
								{partner.openingBalance >= 0 ? "+" : "−"}
								{formatCurrency(Math.abs(partner.openingBalance))} UZS
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			{/* stats */}
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
					borderTop: "1px solid",
					borderColor: "divider",
				}}
			>
				<Stat
					icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 14, color: "success.main" }} />}
					label={t("partner.detail.stat.sales")}
					value={statOrDash(stats.sales)}
				/>
				<Stat
					icon={<LocalShippingOutlinedIcon sx={{ fontSize: 14, color: "error.main" }} />}
					label={t("partner.detail.stat.supplies")}
					value={statOrDash(stats.supplies)}
				/>
				<Stat
					icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />}
					label={t("partner.detail.stat.payments")}
					value={statOrDash(stats.payments)}
				/>
				<Stat
					icon={<FlagOutlinedIcon sx={{ fontSize: 14, color: "info.main" }} />}
					label={t("partner.detail.stat.opening")}
					value={`${partner.openingBalance >= 0 ? "+" : "−"}${formatCurrency(Math.abs(partner.openingBalance))}`}
					color={balanceColor(partner.openingBalance)}
				/>
			</Box>
		</Paper>
	);
};

export default PartnerBalanceCard;
