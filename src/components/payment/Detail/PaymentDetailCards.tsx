import React from "react";
import { useTranslation } from "react-i18next";
import EmployeeLink from "components/employee/Link/EmployeeLink";
import PartnerLink from "components/partner/Links/PartnerLink";
import { PaymentDirectionBadge, PaymentTypeBadge } from "components/payment/PaymentPresentation";
import AttachmentChip from "components/shared/AttachmentChip/AttachmentChip";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { FactList, FactRow } from "components/shared/Detail/FactRow";
import HeroAmountCard from "components/shared/Detail/HeroAmountCard";
import WalletLink from "components/wallet/Links/WalletLink";
import { PaymentRecord } from "models/payment";
import { designTokens } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { paymentDirectionColor } from "utils/paymentUtils";
import { formatPeriod } from "utils/payrollUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

/** Withdrawal — a single «Возврат аванса партнёру» line (no canon allocation). */
export const PaymentWithdrawalCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<UndoOutlinedIcon sx={detailCardIconSx} />}
			title={t("payment.detail.withdrawal")}
		>
			<FactList>
				<FactRow label={t("payment.detail.advanceReturned")} money={payment.amount} />
			</FactList>
		</DetailCard>
	);
};

/** Payroll — employee / position / period / salary / paid, side by side. */
export const PaymentPayrollCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<PersonOutlineIcon sx={detailCardIconSx} />}
			title={t("payment.type.payroll")}
		>
			<FactList grid>
				<FactRow stacked label={t("payment.detail.employee")}>
					{payment.employeeId != null && payment.employeeName ? (
						<EmployeeLink id={payment.employeeId} name={payment.employeeName} />
					) : (
						payment.employeeName
					)}
				</FactRow>
				<FactRow stacked label={t("payment.detail.position")}>
					{payment.employeePosition}
				</FactRow>
				<FactRow stacked label={t("payment.detail.period")}>
					{payment.period && formatPeriod(t, payment.period)}
				</FactRow>
				<FactRow stacked label={t("payment.detail.salary")} money={payment.salary ?? null} />
				<FactRow stacked label={t("payment.detail.paid")} money={payment.amount} />
			</FactList>
		</DetailCard>
	);
};

/** General — the free-text description. */
export const PaymentGeneralCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<SellOutlinedIcon sx={detailCardIconSx} />}
			title={t("payment.detail.description")}
		>
			<Box sx={{ p: "16px 18px" }}>
				<Typography sx={{ lineHeight: 1.55 }}>{payment.description}</Typography>
			</Box>
		</DetailCard>
	);
};

/**
 * Attachments (F18) — the payment's own uploaded files, plus a read-only echo of
 * the settled transaction's note + attachments («Из операции»). Only mounted by the
 * page when it has something to show.
 */
export const PaymentAttachmentsCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	const { attachments, transactionNotes, transactionAttachments } = payment;
	const hasEcho = Boolean(transactionNotes) || transactionAttachments.length > 0;

	return (
		<DetailCard
			icon={<AttachFileOutlinedIcon sx={detailCardIconSx} />}
			title={t("payment.detail.attachments")}
			count={attachments.length}
		>
			<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
				{attachments.length > 0 && (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
						{attachments.map((a) => (
							<AttachmentChip key={a.id} {...a} />
						))}
					</Box>
				)}

				{hasEcho && (
					<Box
						sx={
							attachments.length > 0
								? { borderTop: "1px solid", borderColor: "divider", pt: "14px" }
								: undefined
						}
					>
						<Typography
							variant="overline"
							component="div"
							sx={{ color: "text.secondary", mb: "8px" }}
						>
							{t("payment.detail.fromTransaction")}
						</Typography>
						{transactionNotes && (
							<Typography
								variant="body2"
								sx={{
									lineHeight: 1.6,
									color: designTokens.gray700,
									mb: transactionAttachments.length > 0 ? "10px" : 0,
								}}
							>
								{transactionNotes}
							</Typography>
						)}
						{transactionAttachments.length > 0 && (
							<Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
								{transactionAttachments.map((a) => (
									<AttachmentChip key={a.id} {...a} />
								))}
							</Box>
						)}
					</Box>
				)}
			</Box>
		</DetailCard>
	);
};

/**
 * The rail's money hero: the served amount, coloured by the money direction,
 * with the Приход / Расход badge under it.
 */
export const PaymentAmountCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<HeroAmountCard
			caption={t("payment.detail.amount")}
			value={formatCurrency(payment.amount)}
			valueColor={paymentDirectionColor(payment.direction)}
			status={<PaymentDirectionBadge direction={payment.direction} />}
		/>
	);
};

/** Right-column metadata (the «Информация» card); the direction lives in the hero. */
export const PaymentInfoCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard icon={<InfoOutlinedIcon sx={detailCardIconSx} />} title={t("payment.detail.info")}>
			<FactList>
				{payment.partnerName && (
					<FactRow icon={<PersonOutlineIcon />} label={t("payment.detail.partner")}>
						{payment.partnerId != null ? (
							<PartnerLink id={payment.partnerId} name={payment.partnerName} />
						) : (
							payment.partnerName
						)}
					</FactRow>
				)}
				{payment.employeeName && (
					<FactRow icon={<PersonOutlineIcon />} label={t("payment.detail.employee")}>
						{payment.employeeId != null ? (
							<EmployeeLink id={payment.employeeId} name={payment.employeeName} />
						) : (
							payment.employeeName
						)}
						{payment.employeePosition && (
							<Box component="span" sx={{ color: "text.secondary" }}>
								{" "}
								· {payment.employeePosition}
							</Box>
						)}
					</FactRow>
				)}
				<FactRow icon={<LayersOutlinedIcon />} label={t("payment.detail.typeLabel")}>
					<PaymentTypeBadge type={payment.type} />
				</FactRow>
				<FactRow
					icon={<AccountBalanceWalletOutlinedIcon />}
					label={t("payment.detail.walletLabel")}
				>
					<WalletLink id={payment.walletId} name={payment.walletName} />
				</FactRow>
				<FactRow icon={<BadgeOutlinedIcon />} label={t("payment.detail.createdBy")}>
					{payment.createdBy}
				</FactRow>
				<FactRow
					icon={<ScheduleOutlinedIcon />}
					label={t("payment.detail.date")}
					figures="proportional"
				>
					{formatDateTime(payment.date)}
				</FactRow>
			</FactList>
		</DetailCard>
	);
};
