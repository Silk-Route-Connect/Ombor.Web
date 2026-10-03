import React from "react";
import { useTranslation } from "react-i18next";
import AttachmentChip from "components/shared/AttachmentChip/AttachmentChip";
import DetailCard from "components/shared/Detail/DetailCard";
import UzsUnit from "components/shared/Money/UzsUnit";
import WalletLink from "components/wallet/Links/WalletLink";
import { PaymentRecord } from "models/payment";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatPeriod } from "utils/payrollUtils";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Typography } from "@mui/material";

/** Withdrawal — a single «Возврат аванса партнёру» line (no canon allocation). */
export const PaymentWithdrawalCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<UndoOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("payment.detail.withdrawal")}
		>
			<Box
				sx={{
					p: "16px 18px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography sx={{ fontWeight: 600 }}>{t("payment.detail.advanceReturned")}</Typography>
				<Box
					component="span"
					sx={{ ...numericSx, fontWeight: 700, fontSize: 17, color: "error.main" }}
				>
					{formatCurrency(payment.amount)}
					<UzsUnit />
				</Box>
			</Box>
		</DetailCard>
	);
};

/** Payroll grid — employee / position / period / salary / paid. */
export const PaymentPayrollCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	const item = (label: string, value: React.ReactNode) => (
		<Box sx={{ p: "15px 18px" }}>
			<Typography sx={{ fontSize: 12, color: "text.secondary", mb: "5px" }}>{label}</Typography>
			<Typography sx={{ fontSize: 15, fontWeight: 600 }}>{value}</Typography>
		</Box>
	);
	return (
		<DetailCard
			icon={<PersonOutlineIcon sx={{ fontSize: 17 }} />}
			title={t("payment.type.payroll")}
		>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					"& > *": { borderBottom: "1px solid", borderColor: "divider" },
					"& > *:nth-of-type(odd)": { borderRight: "1px solid", borderRightColor: "divider" },
				}}
			>
				{item(t("payment.detail.employee"), payment.employeeName)}
				{item(t("payment.detail.position"), payment.employeePosition)}
				{item(t("payment.detail.period"), payment.period && formatPeriod(t, payment.period))}
				{item(
					t("payment.detail.salary"),
					<Box component="span" sx={numericSx}>
						{formatCurrency(payment.salary ?? 0)}
						<UzsUnit />
					</Box>,
				)}
				<Box sx={{ p: "15px 18px", gridColumn: "1 / -1", borderRight: "none !important" }}>
					<Typography sx={{ fontSize: 12, color: "text.secondary", mb: "5px" }}>
						{t("payment.detail.paid")}
					</Typography>
					<Typography sx={{ ...numericSx, fontSize: 15, fontWeight: 600, color: "success.main" }}>
						{formatCurrency(payment.amount)}
						<UzsUnit />
					</Typography>
				</Box>
			</Box>
		</DetailCard>
	);
};

/** General — the free-text description. */
export const PaymentGeneralCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<SellOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("payment.detail.description")}
		>
			<Box sx={{ p: "16px 18px" }}>
				<Typography sx={{ fontSize: 14.5, lineHeight: 1.55 }}>{payment.description}</Typography>
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
			icon={<AttachFileOutlinedIcon sx={{ fontSize: 17 }} />}
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
							sx={{
								fontSize: 11.5,
								fontWeight: 600,
								color: "text.secondary",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
								mb: "8px",
							}}
						>
							{t("payment.detail.fromTransaction")}
						</Typography>
						{transactionNotes && (
							<Typography
								sx={{
									fontSize: 13.5,
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

/** Right-column metadata (the «Информация» card). */
export const PaymentInfoCard: React.FC<{
	payment: PaymentRecord;
	onOpenPartner?: () => void;
}> = ({ payment, onOpenPartner }) => {
	const { t } = useTranslation();
	const income = payment.direction === "Income";

	const row = (icon: React.ReactNode, key: string, value: React.ReactNode) => (
		<Box
			sx={{
				display: "flex",
				gap: "12px",
				py: "12px",
				borderBottom: "1px solid",
				borderColor: "divider",
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<Box sx={{ color: "text.disabled", mt: "1px", display: "inline-flex" }}>{icon}</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
					{key}
				</Typography>
				<Box sx={{ fontSize: 14, fontWeight: 600, mt: "2px" }}>{value}</Box>
			</Box>
		</Box>
	);

	return (
		<DetailCard icon={<InfoOutlinedIcon sx={{ fontSize: 17 }} />} title={t("payment.detail.info")}>
			<Box sx={{ px: "18px", py: "4px" }}>
				{payment.partnerName &&
					row(
						<PersonOutlineIcon sx={{ fontSize: 16 }} />,
						t("payment.detail.partner"),
						<>
							<Box
								component="span"
								onClick={onOpenPartner}
								sx={{
									color: "primary.main",
									cursor: onOpenPartner ? "pointer" : "default",
									"&:hover": onOpenPartner ? { textDecoration: "underline" } : undefined,
								}}
							>
								{payment.partnerName}
							</Box>
						</>,
					)}
				{payment.employeeName &&
					row(
						<PersonOutlineIcon sx={{ fontSize: 16 }} />,
						t("payment.detail.employee"),
						`${payment.employeeName}${payment.employeePosition ? ` · ${payment.employeePosition}` : ""}`,
					)}
				{row(
					<LayersOutlinedIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.typeLabel"),
					t(`payment.type.${payment.type.toLowerCase()}`),
				)}
				{row(
					income ? (
						<SouthEastIcon sx={{ fontSize: 16 }} />
					) : (
						<NorthEastIcon sx={{ fontSize: 16 }} />
					),
					t("payment.detail.directionLabel"),
					t(income ? "payment.direction.income" : "payment.direction.expense"),
				)}
				{row(
					<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.walletLabel"),
					<WalletLink id={payment.walletId} name={payment.walletName} />,
				)}
				{row(
					<PersonOutlineIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.createdBy"),
					payment.createdBy || t("common.dash"),
				)}
				{row(
					<ScheduleOutlinedIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.date"),
					<Box component="span" sx={numericSx}>
						{formatDateTime(payment.date)}
					</Box>,
				)}
			</Box>
		</DetailCard>
	);
};
