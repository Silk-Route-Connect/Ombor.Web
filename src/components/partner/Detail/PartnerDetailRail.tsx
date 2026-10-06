import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { FactList, FactRow } from "components/shared/Detail/FactRow";
import HeroAmountCard from "components/shared/Detail/HeroAmountCard";
import UzsUnit from "components/shared/Money/UzsUnit";
import { COPY_BUTTON_CLASS, CopyIconButton } from "components/shared/Table/cells/CopyIconButton";
import { Partner, PartnerLedgerEntry } from "models/partner";
import { chipTokens, figuresSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";
import { formatUzPhone } from "utils/phoneUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { Box, Stack } from "@mui/material";

interface PartnerDetailRailProps {
	partner: Partner;
	ledger: PartnerLedgerEntry[];
}

const ContactRow: React.FC<{
	icon: React.ReactNode;
	children: React.ReactNode;
	mono?: boolean;
	/** Raw text copied by the row's copy button (phone / email / telegram / address). */
	copyValue?: string;
}> = ({ icon, children, mono, copyValue }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "10px",
			fontSize: 13,
			color: "text.primary",
			[`&:hover .${COPY_BUTTON_CLASS}, &:focus-within .${COPY_BUTTON_CLASS}`]: { opacity: 1 },
		}}
	>
		<Box sx={{ color: "text.disabled", display: "inline-flex", flex: "0 0 auto" }}>{icon}</Box>
		<Box component="span" sx={{ minWidth: 0, ...(mono ? figuresSx : undefined) }}>
			{children}
		</Box>
		{copyValue && (
			<Box sx={{ ml: "auto" }}>
				<CopyIconButton value={copyValue} />
			</Box>
		)}
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

	const hasContacts =
		phones.length > 0 || Boolean(partner.email || partner.telegram || partner.address);

	return (
		<Stack sx={{ gap: "16px" }}>
			<HeroAmountCard
				caption={t("partner.table.balance")}
				value={formatPartnerBalance(partner.balance)}
				valueColor={partnerBalanceColor(partner.balance)}
				status={t(hintKey)}
			>
				<FactList divided={false} inset={false}>
					<FactRow
						icon={<FlagOutlinedIcon sx={{ color: "info.main" }} />}
						label={
							<>
								{t("partner.detail.stat.opening")}
								<Box component="span" sx={figuresSx}>
									· {formatDate(partner.openingDate)}
								</Box>
							</>
						}
						figures="tabular"
						valueColor={
							partner.openingBalance ? partnerBalanceColor(partner.openingBalance) : undefined
						}
					>
						{formatPartnerBalance(partner.openingBalance)}
						<UzsUnit />
					</FactRow>
				</FactList>
			</HeroAmountCard>

			{/* «Обороты» — icons in the document-type hues; green / red stay money direction. */}
			<DetailCard
				title={t("partner.detail.activity")}
				icon={<TrendingUpOutlinedIcon sx={detailCardIconSx} />}
			>
				<FactList>
					<FactRow
						icon={<ReceiptLongOutlinedIcon sx={{ color: chipTokens.sale.color }} />}
						label={t("partner.detail.stat.sales")}
						money={stats.sales}
					/>
					<FactRow
						icon={<LocalShippingOutlinedIcon sx={{ color: chipTokens.supply.color }} />}
						label={t("partner.detail.stat.supplies")}
						money={stats.supplies}
					/>
					<FactRow
						icon={<AccountBalanceWalletOutlinedIcon sx={{ color: "text.secondary" }} />}
						label={t("partner.detail.stat.payments")}
						money={stats.payments}
					/>
				</FactList>
			</DetailCard>

			{/* contacts */}
			{hasContacts && (
				<DetailCard
					title={t("partner.detail.contacts")}
					icon={<PersonOutlineIcon sx={detailCardIconSx} />}
				>
					<Box sx={{ p: "14px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
						{phones.map((phone, i) => (
							<ContactRow
								key={i}
								icon={<PhoneOutlinedIcon sx={{ fontSize: 15 }} />}
								mono
								copyValue={phone}
							>
								{formatUzPhone(phone)}
								{i === 0 && phones.length > 1 && (
									<Box component="span" sx={{ ml: 1 }}>
										<StatusPill token="teal" label={t("partner.detail.contactPrimary")} />
									</Box>
								)}
							</ContactRow>
						))}
						{partner.email && (
							<ContactRow
								icon={<MailOutlineIcon sx={{ fontSize: 15 }} />}
								copyValue={partner.email}
							>
								{partner.email}
							</ContactRow>
						)}
						{partner.telegram && (
							<ContactRow
								icon={<SendOutlinedIcon sx={{ fontSize: 15 }} />}
								mono
								copyValue={partner.telegram}
							>
								{partner.telegram}
							</ContactRow>
						)}
						{partner.address && (
							<ContactRow
								icon={<PlaceOutlinedIcon sx={{ fontSize: 15 }} />}
								copyValue={partner.address}
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
