import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { PaymentAllocationKind, PaymentRecord } from "models/payment";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box, Paper, Typography } from "@mui/material";

/** Bordered detail card with an icon + title head (the bundle's `.sd-card`). */
export const DetailCard: React.FC<{
	icon: React.ReactNode;
	title: string;
	count?: number;
	children: React.ReactNode;
}> = ({ icon, title, count, children }) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				p: "13px 18px",
				borderBottom: "1px solid",
				borderColor: "divider",
				bgcolor: designTokens.gray25,
				fontSize: 14,
				fontWeight: 600,
			}}
		>
			<Box sx={{ display: "inline-flex", color: "text.secondary" }}>{icon}</Box>
			{title}
			{count != null && (
				<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
					· {count}
				</Box>
			)}
		</Box>
		{children}
	</Paper>
);

/** Касса (source) card — single clean line per source (rule 9). */
export const PaymentSourceCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
			title={t("payment.detail.source")}
		>
			<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
				{payment.sources.map((s) => {
					const meta = s.walletType ? WALLET_TYPE_META[s.walletType] : null;
					const Icon = meta?.Icon ?? AccountBalanceWalletOutlinedIcon;
					return (
						<Box
							key={s.id}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "14px",
							}}
						>
							<Box
								sx={{ display: "inline-flex", alignItems: "center", gap: "11px", fontWeight: 600 }}
							>
								<Box
									sx={{
										width: 38,
										height: 38,
										borderRadius: "10px",
										display: "grid",
										placeItems: "center",
										bgcolor: meta?.bg ?? designTokens.accentSoft,
										color: meta?.color ?? designTokens.saffron700,
									}}
								>
									<Icon sx={{ fontSize: 18 }} />
								</Box>
								{s.sourceType === "Wallet" ? (
									<span>
										{s.walletName}{" "}
										<Box component="span" sx={{ color: "text.disabled", fontWeight: 500 }}>
											· {meta ? t(meta.labelKey) : ""}
										</Box>
									</span>
								) : (
									<span>{t("payment.detail.advanceSource")}</span>
								)}
							</Box>
							<Box
								component="span"
								sx={{ ...numericSx, fontWeight: 800, fontSize: 17, letterSpacing: "-0.02em" }}
							>
								{formatCurrency(s.amount)}{" "}
								<Box
									component="span"
									sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled" }}
								>
									UZS
								</Box>
							</Box>
						</Box>
					);
				})}
			</Box>
		</DetailCard>
	);
};

const ALLOC_META: Record<PaymentAllocationKind, { labelKey: string; color: string }> = {
	TransactionSettlement: { labelKey: "payment.alloc.settlement", color: "text.secondary" },
	AdvanceCredit: { labelKey: "payment.alloc.advance", color: "secondary.main" },
	ChangeReturn: { labelKey: "payment.alloc.change", color: "text.secondary" },
};

const allocCellSx = {
	p: "13px 18px",
	borderBottom: "1px solid",
	borderColor: designTokens.gray25,
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

/** Распределение (allocations) table with a «Распределено» footer. */
export const PaymentAllocationCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const settling = payment.allocations.filter((a) => a.allocationType !== "ChangeReturn");
	const total = settling.reduce((s, a) => s + a.amount, 0);

	return (
		<DetailCard
			icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("payment.detail.allocation")}
			count={payment.allocations.length}
		>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box
							component="th"
							sx={{
								...allocCellSx,
								textAlign: "left",
								fontSize: 12,
								fontWeight: 600,
								color: "text.secondary",
								bgcolor: "background.paper",
							}}
						>
							{t("payment.detail.allocTarget")}
						</Box>
						<Box
							component="th"
							sx={{
								...allocCellSx,
								textAlign: "left",
								fontSize: 12,
								fontWeight: 600,
								color: "text.secondary",
								bgcolor: "background.paper",
							}}
						>
							{t("payment.detail.allocType")}
						</Box>
						<Box
							component="th"
							sx={{
								...allocCellSx,
								textAlign: "right",
								fontSize: 12,
								fontWeight: 600,
								color: "text.secondary",
								bgcolor: "background.paper",
							}}
						>
							{t("payment.detail.allocAmount")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{payment.allocations.map((a) => {
						const meta = ALLOC_META[a.allocationType];
						const isChange = a.allocationType === "ChangeReturn";
						const isSettlement = a.allocationType === "TransactionSettlement";
						const isSupplyTx =
							a.transactionType === "Supply" || a.transactionType === "SupplyRefund";
						// The server no longer bakes a display reference — compose it here.
						const txWord = a.transactionType
							? isSupplyTx
								? t("payment.alloc.supply")
								: t("payment.alloc.sale")
							: t("payment.alloc.txRef");
						const targetLabel =
							a.allocationType === "AdvanceCredit"
								? t("payment.alloc.advanceTarget")
								: a.allocationType === "ChangeReturn"
									? t("payment.alloc.change")
									: a.transactionId
										? `${txWord} #${a.transactionId}`
										: t("payment.alloc.settlement");
						// Settlement rows link to the settled transaction (split sale/supply route).
						const canOpenTx = isSettlement && a.transactionId != null && a.transactionType != null;
						const openTx = () => {
							if (a.transactionId == null) {
								return;
							}
							navigate(
								isSupplyTx ? supplyDetailPath(a.transactionId) : saleDetailPath(a.transactionId),
							);
						};
						return (
							<Box
								component="tr"
								key={a.id}
								sx={isChange ? { bgcolor: designTokens.gray25 } : undefined}
							>
								<Box component="td" sx={allocCellSx}>
									<Box
										component="span"
										onClick={canOpenTx ? openTx : undefined}
										sx={{
											fontWeight: 600,
											color: isSettlement ? "primary.main" : "text.primary",
											fontStyle: isChange ? "italic" : "normal",
											cursor: canOpenTx ? "pointer" : "default",
											"&:hover": canOpenTx ? { textDecoration: "underline" } : undefined,
										}}
									>
										{targetLabel}
									</Box>
								</Box>
								<Box component="td" sx={{ ...allocCellSx, fontSize: 12.5, color: meta.color }}>
									{t(meta.labelKey)}
								</Box>
								<Box component="td" sx={{ ...allocCellSx, textAlign: "right" }}>
									<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
										{formatCurrency(a.amount)}
									</Box>
									{isChange && (
										<Box
											component="span"
											sx={{
												ml: "8px",
												fontSize: 10,
												fontWeight: 700,
												textTransform: "uppercase",
												letterSpacing: "0.04em",
												color: "text.disabled",
												bgcolor: designTokens.gray100,
												borderRadius: "4px",
												px: "6px",
												py: "1px",
											}}
										>
											{t("payment.detail.memoTag")}
										</Box>
									)}
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "flex-end",
					gap: "8px",
					p: "13px 18px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
					{t("payment.detail.distributed")}
				</Typography>
				<Box component="span" sx={{ ...numericSx, fontWeight: 800, fontSize: 15 }}>
					{formatCurrency(total)} UZS
				</Box>
			</Box>
		</DetailCard>
	);
};

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
					sx={{ ...numericSx, fontWeight: 800, fontSize: 17, color: "error.main" }}
				>
					{formatCurrency(payment.amount)} UZS
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
					"& > *": { borderBottom: "1px solid", borderColor: designTokens.gray25 },
					"& > *:nth-of-type(odd)": {
						borderRight: "1px solid",
						borderRightColor: designTokens.gray25,
					},
				}}
			>
				{item(t("payment.detail.employee"), payment.employeeName)}
				{item(t("payment.detail.position"), payment.employeePosition)}
				{item(t("payment.detail.period"), payment.period)}
				{item(
					t("payment.detail.salary"),
					<Box component="span" sx={numericSx}>
						{formatCurrency(payment.salary ?? 0)}{" "}
						<small style={{ fontSize: 11, color: designTokens.gray400 }}>UZS</small>
					</Box>,
				)}
				<Box sx={{ p: "15px 18px", gridColumn: "1 / -1", borderRight: "none !important" }}>
					<Typography sx={{ fontSize: 12, color: "text.secondary", mb: "5px" }}>
						{t("payment.detail.paid")}
					</Typography>
					<Typography sx={{ ...numericSx, fontSize: 15, fontWeight: 600, color: "success.main" }}>
						{formatCurrency(payment.amount)}{" "}
						<Box component="span" sx={{ fontSize: 11, color: "text.disabled" }}>
							UZS
						</Box>
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
				borderColor: designTokens.gray25,
				"&:last-of-type": { borderBottom: "none" },
			}}
		>
			<Box sx={{ color: "text.disabled", mt: "1px", display: "inline-flex" }}>{icon}</Box>
			<Box>
				<Typography sx={{ fontSize: 12, color: "text.secondary" }}>{key}</Typography>
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
							{payment.partnerType && ` · ${t(`payment.partnerType.${payment.partnerType}`)}`}
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
					payment.walletName,
				)}
				{row(
					<PersonOutlineIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.createdBy"),
					payment.createdBy,
				)}
				{row(
					<ScheduleOutlinedIcon sx={{ fontSize: 16 }} />,
					t("payment.detail.date"),
					<Box component="span" sx={numericSx}>
						{formatDate(payment.date)}
					</Box>,
				)}
			</Box>
		</DetailCard>
	);
};
