import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import { Partner, PartnerLedgerEntry } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";

interface PartnerDetailRailProps {
	partner: Partner;
	ledger: PartnerLedgerEntry[];
}

/** Copy-to-clipboard affordance on a contact row — reveals on hover, ticks on copy. */
const CopyButton: React.FC<{ value: string; label: string }> = ({ value, label }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const copy = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			/* clipboard unavailable — no-op */
		}
	};

	return (
		<Tooltip title={copied ? t("common.copied") : label} placement="top">
			<IconButton
				className="copy-btn"
				onClick={copy}
				aria-label={label}
				size="small"
				sx={{
					p: "3px",
					ml: "auto",
					color: copied ? "success.main" : "text.disabled",
					opacity: copied ? 1 : 0,
					transition: "opacity .12s, color .12s",
					"&:hover": { color: copied ? "success.main" : "primary.main" },
				}}
			>
				{copied ? (
					<CheckIcon sx={{ fontSize: 14 }} />
				) : (
					<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
				)}
			</IconButton>
		</Tooltip>
	);
};

const ContactRow: React.FC<{
	icon: React.ReactNode;
	children: React.ReactNode;
	mono?: boolean;
	/** Raw text copied by the row's copy button (phone / email / telegram / address). */
	copyValue?: string;
	copyLabel?: string;
}> = ({ icon, children, mono, copyValue, copyLabel }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			fontSize: 13.5,
			color: "text.primary",
			"&:hover .copy-btn": { opacity: 1 },
		}}
	>
		<Box sx={{ color: "text.disabled", display: "inline-flex", flex: "0 0 auto" }}>{icon}</Box>
		<Box component="span" sx={{ minWidth: 0, ...(mono ? numericSx : undefined) }}>
			{children}
		</Box>
		{copyValue && <CopyButton value={copyValue} label={copyLabel ?? ""} />}
	</Box>
);

/** One «Обороты» stat row: muted label + coloured icon left, tabular amount right. */
const StatRow: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: string;
	color?: string;
}> = ({ icon, label, value, color }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: "12px",
			py: "10px",
			borderBottom: "1px solid",
			borderColor: designTokens.gray25,
			"&:last-child": { borderBottom: "none" },
		}}
	>
		<Box
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
				fontSize: 13,
				color: "text.secondary",
			}}
		>
			{icon}
			{label}
		</Box>
		<Typography
			sx={{ ...numericSx, fontWeight: 700, fontSize: 14.5, color: color ?? "text.primary" }}
		>
			{value}
		</Typography>
	</Box>
);

/**
 * Persistent right rail (DEC-8): the partner's identity + balance hero, the
 * «Обороты» totals and the contacts — the wide balance card reflowed into the
 * 372px Product-style rail. Balance is server-computed (hard rule 8); the
 * «Обороты» subtotals aggregate the served ledger deltas for display.
 */
export const PartnerDetailRail: React.FC<PartnerDetailRailProps> = ({ partner, ledger }) => {
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

	const hasContacts =
		phones.length > 0 || Boolean(partner.email || partner.telegram || partner.address);

	return (
		<Stack sx={{ gap: "16px" }}>
			{/* balance hero */}
			<DetailCard>
				<Box sx={{ p: "20px 22px" }}>
					<Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: "4px" }}>
						{t("partner.table.balance")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 32,
							fontWeight: 700,
							letterSpacing: "-0.025em",
							lineHeight: 1,
							color: partnerBalanceColor(partner.balance),
						}}
					>
						{formatPartnerBalance(partner.balance)}
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
							display: "flex",
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
							sx={{
								...numericSx,
								fontWeight: 600,
								color: partnerBalanceColor(partner.openingBalance),
							}}
						>
							{formatPartnerBalance(partner.openingBalance)} UZS
						</Box>
					</Box>
				</Box>
			</DetailCard>

			{/* «Обороты» totals */}
			<DetailCard
				title={t("partner.detail.activity")}
				icon={<TrendingUpOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			>
				<Box sx={{ p: "4px 18px 12px" }}>
					<StatRow
						icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 15, color: "success.main" }} />}
						label={t("partner.detail.stat.sales")}
						value={statOrDash(stats.sales)}
					/>
					<StatRow
						icon={<LocalShippingOutlinedIcon sx={{ fontSize: 15, color: "error.main" }} />}
						label={t("partner.detail.stat.supplies")}
						value={statOrDash(stats.supplies)}
					/>
					<StatRow
						icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />}
						label={t("partner.detail.stat.payments")}
						value={statOrDash(stats.payments)}
					/>
				</Box>
			</DetailCard>

			{/* contacts */}
			{hasContacts && (
				<DetailCard
					title={t("partner.detail.contacts")}
					icon={<PersonOutlineIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
				>
					<Box sx={{ p: "14px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
						{phones.map((phone, i) => (
							<ContactRow
								key={i}
								icon={<PhoneOutlinedIcon sx={{ fontSize: 15 }} />}
								mono
								copyValue={phone}
								copyLabel={t("common.copy")}
							>
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
							<ContactRow
								icon={<MailOutlineIcon sx={{ fontSize: 15 }} />}
								copyValue={partner.email}
								copyLabel={t("common.copy")}
							>
								{partner.email}
							</ContactRow>
						)}
						{partner.telegram && (
							<ContactRow
								icon={<SendOutlinedIcon sx={{ fontSize: 15 }} />}
								mono
								copyValue={partner.telegram}
								copyLabel={t("common.copy")}
							>
								{partner.telegram}
							</ContactRow>
						)}
						{partner.address && (
							<ContactRow
								icon={<PlaceOutlinedIcon sx={{ fontSize: 15 }} />}
								copyValue={partner.address}
								copyLabel={t("common.copy")}
							>
								{partner.address}
							</ContactRow>
						)}
					</Box>
				</DetailCard>
			)}
		</Stack>
	);
};

export default PartnerDetailRail;
