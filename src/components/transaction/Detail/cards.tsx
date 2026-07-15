import React from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import MetaDot from "components/shared/Detail/MetaDot";
import { TransactionStatusChip } from "components/transaction/TransactionBadges";
import { TransactionLine, TransactionRecord, TransactionStatus } from "models/transaction";
import { WalletType } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import {
	directionOf,
	discountLabel,
	TransactionDirection,
	txDiscountTotal,
	txSubtotal,
	txTotal,
} from "utils/transactionUtils";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

const headCellSx = {
	textAlign: "right",
	fontSize: 11.5,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 14px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
} as const;

const bodyCellSx = {
	textAlign: "right",
	fontSize: 13.5,
	p: "13px 14px",
	borderBottom: "1px solid",
	borderColor: "divider",
	verticalAlign: "middle",
	...numericSx,
} as const;

/** Card shell (bundle `.sd-card`) with an optional titled header. */
export const SdCard: React.FC<{
	title?: string;
	icon?: React.ReactNode;
	count?: number;
	children: React.ReactNode;
}> = ({ title, icon, count, children }) => (
	<Box
		sx={{
			bgcolor: "background.paper",
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			boxShadow: 1,
			overflow: "hidden",
		}}
	>
		{title && (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "9px",
					p: "15px 18px",
					borderBottom: "1px solid",
					borderColor: "divider",
					fontSize: 15,
					fontWeight: 600,
				}}
			>
				{icon}
				{title}
				{count != null && (
					<Box component="span" sx={{ ...numericSx, color: "text.disabled", fontWeight: 600 }}>
						· {count}
					</Box>
				)}
			</Box>
		)}
		{children}
	</Box>
);

/* ─────────────────────────── positions ─────────────────────────── */

export const PositionsCard: React.FC<{
	lines: TransactionLine[];
	footer?: React.ReactNode;
	count: number;
}> = ({ lines, footer, count }) => {
	const { t } = useTranslation();
	return (
		<SdCard
			title={t("transaction.detail.positions")}
			icon={<Inventory2OutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
			count={count}
		>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left", pl: "18px" }}>
							{t("transaction.detail.col.product")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("transaction.detail.col.qty")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("transaction.detail.col.unitPrice")}
						</Box>
						<Box component="th" sx={headCellSx}>
							{t("transaction.detail.col.discount")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, pr: "18px" }}>
							{t("transaction.detail.col.lineTotal")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{lines.map((l) => {
						const disc = discountLabel(l);
						return (
							<Box component="tr" key={l.id}>
								<Box
									component="td"
									sx={{ ...bodyCellSx, textAlign: "left", pl: "18px", fontFamily: "inherit" }}
								>
									<Typography component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
										{l.productName}
									</Typography>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{l.quantity}{" "}
									<Box component="span" sx={{ color: "text.disabled", fontSize: 12 }}>
										{l.unit}
									</Box>
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{formatCurrency(l.unitPrice)}
								</Box>
								<Box component="td" sx={bodyCellSx}>
									{disc ? (
										<Box component="span" sx={{ color: designTokens.saffron700, fontWeight: 600 }}>
											{disc}
										</Box>
									) : (
										<Box component="span" sx={{ color: "text.disabled" }}>
											—
										</Box>
									)}
								</Box>
								<Box component="td" sx={{ ...bodyCellSx, pr: "18px", fontWeight: 700 }}>
									{formatCurrency(l.total)}
								</Box>
							</Box>
						);
					})}
				</tbody>
			</Box>
			{footer}
		</SdCard>
	);
};

const FootRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box
		sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13.5 }}
	>
		<Box component="span" sx={{ color: "text.secondary" }}>
			{label}
		</Box>
		<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
			{children}
		</Box>
	</Box>
);

export const SaleFooter: React.FC<{ lines: TransactionLine[] }> = ({ lines }) => {
	const { t } = useTranslation();
	const subtotal = txSubtotal(lines);
	const discount = txDiscountTotal(lines);
	const total = txTotal(lines);
	return (
		<Box
			sx={{
				p: "14px 18px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				bgcolor: designTokens.gray25,
			}}
		>
			<FootRow label={t("transaction.detail.subtotal")}>{formatCurrency(subtotal)} UZS</FootRow>
			<FootRow label={t("transaction.detail.discountByLines")}>
				{discount ? (
					<Box component="span" sx={{ color: designTokens.saffron700 }}>
						−{formatCurrency(discount)} UZS
					</Box>
				) : (
					<Box component="span" sx={{ color: "text.disabled" }}>
						—
					</Box>
				)}
			</FootRow>
			<Box sx={{ height: "1px", bgcolor: "divider", my: "2px" }} />
			<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
				<Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
					{t("transaction.detail.total")}
				</Box>
				<Box
					component="span"
					sx={{ ...numericSx, fontSize: 22, fontWeight: 700, color: "primary.main" }}
				>
					{formatCurrency(total)}{" "}
					<Box component="span" sx={{ fontSize: 13, color: "text.disabled", fontWeight: 600 }}>
						UZS
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export const RefundFooter: React.FC<{ lines: TransactionLine[] }> = ({ lines }) => {
	const { t } = useTranslation();
	const total = lines.reduce((s, l) => s + l.total, 0);
	return (
		<Box
			sx={{
				p: "14px 18px",
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				bgcolor: designTokens.gray25,
			}}
		>
			<FootRow label={t("transaction.detail.positionsToRefund")}>{lines.length}</FootRow>
			<Box sx={{ height: "1px", bgcolor: "divider", my: "2px" }} />
			<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
				<Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
					{t("transaction.detail.refundAmount")}
				</Box>
				<Box component="span" sx={{ ...numericSx, fontSize: 22, fontWeight: 700 }}>
					−{formatCurrency(total)}{" "}
					<Box component="span" sx={{ fontSize: 13, color: "text.disabled", fontWeight: 600 }}>
						UZS
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

/* ─────────────────────────── financial ─────────────────────────── */

export const SaleFinancialCard: React.FC<{
	direction: TransactionDirection;
	total: number;
	subtotal: number;
	discount: number;
	paid: number;
	remaining: number;
	status: TransactionStatus;
}> = ({ direction, total, subtotal, discount, paid, remaining, status }) => {
	const { t } = useTranslation();
	return (
		<SdCard>
			<Box sx={{ p: "18px" }}>
				<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
					{t(`transaction.detail.fin.amount.${direction}`)}
				</Typography>
				<Typography
					sx={{
						...numericSx,
						fontSize: 34,
						fontWeight: 700,
						letterSpacing: "-0.025em",
						lineHeight: 1,
						color: "primary.main",
						mt: "6px",
					}}
				>
					{formatCurrency(total)}
					<Box
						component="span"
						sx={{ fontSize: 14, fontWeight: 600, color: "text.disabled", ml: "7px" }}
					>
						UZS
					</Box>
				</Typography>
				<Box
					sx={{
						mt: "18px",
						pt: "16px",
						borderTop: "1px solid",
						borderColor: "divider",
						display: "flex",
						flexDirection: "column",
						gap: "13px",
					}}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.subtotal")}
						</Box>
						<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
							{formatCurrency(subtotal)} UZS
						</Box>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.discountByLines")}
						</Box>
						{discount ? (
							<Box
								component="span"
								sx={{ ...numericSx, fontWeight: 600, color: designTokens.saffron700 }}
							>
								−{formatCurrency(discount)} UZS
							</Box>
						) : (
							<Box component="span" sx={{ color: "text.disabled" }}>
								—
							</Box>
						)}
					</Box>
					<Box sx={{ height: "1px", bgcolor: "divider" }} />
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.fin.paid")}
						</Box>
						<Box component="span" sx={{ ...numericSx, fontWeight: 600, color: "success.main" }}>
							{paid ? `${formatCurrency(paid)} UZS` : "—"}
						</Box>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.fin.remaining")}
						</Box>
						{remaining > 0 ? (
							<Box component="span" sx={{ ...numericSx, fontWeight: 700, color: "error.main" }}>
								{formatCurrency(remaining)} UZS
							</Box>
						) : (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									color: "success.main",
									fontWeight: 700,
									fontSize: 14,
								}}
							>
								<CheckCircleIcon sx={{ fontSize: 16 }} />
								{t("transaction.detail.fin.paidFull")}
							</Box>
						)}
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.fin.status")}
						</Box>
						<TransactionStatusChip status={status} />
					</Box>
				</Box>
			</Box>
		</SdCard>
	);
};

export const RefundFinancialCard: React.FC<{
	direction: TransactionDirection;
	total: number;
	positions: number;
	originalNumber?: string;
	onOpenOriginal: () => void;
}> = ({ direction, total, positions, originalNumber, onOpenOriginal }) => {
	const { t } = useTranslation();
	return (
		<SdCard>
			<Box sx={{ p: "18px" }}>
				<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
					{t("transaction.detail.refundAmount")}
				</Typography>
				<Typography
					sx={{
						...numericSx,
						fontSize: 34,
						fontWeight: 700,
						letterSpacing: "-0.025em",
						lineHeight: 1,
						mt: "6px",
					}}
				>
					−{formatCurrency(total)}
					<Box
						component="span"
						sx={{ fontSize: 14, fontWeight: 600, color: "text.disabled", ml: "7px" }}
					>
						UZS
					</Box>
				</Typography>
				<Box
					sx={{
						mt: "18px",
						pt: "16px",
						borderTop: "1px solid",
						borderColor: "divider",
						display: "flex",
						flexDirection: "column",
						gap: "13px",
					}}
				>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t(`transaction.detail.original.${direction}`)}
						</Box>
						<Box
							component="span"
							onClick={onOpenOriginal}
							sx={{
								...numericSx,
								fontWeight: 600,
								color: "primary.main",
								cursor: "pointer",
								"&:hover": { textDecoration: "underline" },
							}}
						>
							{originalNumber ? formatEntityId(originalNumber) : ""}
						</Box>
					</Box>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
							{t("transaction.detail.positionsReturned")}
						</Box>
						<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
							{positions}
						</Box>
					</Box>
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						mt: "18px",
						p: "10px 12px",
						bgcolor: designTokens.gray25,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
						fontSize: 12,
						color: "text.secondary",
					}}
				>
					<InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
					{t("transaction.detail.refundImmutable")}
				</Box>
			</Box>
		</SdCard>
	);
};

/* ─────────────────────────── payments ─────────────────────────── */

const WALLET_ICON = (type: WalletType): React.ReactNode => {
	if (type === "Card") return <CreditCardOutlinedIcon sx={{ fontSize: 17 }} />;
	if (type === "Bank") return <AccountBalanceOutlinedIcon sx={{ fontSize: 17 }} />;
	return <PaymentsOutlinedIcon sx={{ fontSize: 17 }} />;
};

export const PaymentsCard: React.FC<{
	tx: TransactionRecord;
	onOpenPayment: (paymentId: number) => void;
}> = ({ tx, onOpenPayment }) => {
	const { t } = useTranslation();
	const direction = directionOf(tx.type);
	const payments = tx.payments ?? [];
	return (
		<SdCard
			title={t("transaction.detail.paymentsTitle")}
			icon={<PaymentsOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			count={payments.length}
		>
			{payments.length === 0 ? (
				<Box sx={{ p: "22px 18px", textAlign: "center", fontSize: 13, color: "text.secondary" }}>
					{t(`transaction.detail.paymentsEmpty.${direction}`)}
				</Box>
			) : (
				payments.map((p) => (
					<Box
						key={p.id}
						onClick={() => onOpenPayment(p.paymentId)}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							p: "13px 18px",
							borderBottom: "1px solid",
							borderColor: "divider",
							cursor: "pointer",
							"&:last-of-type": { borderBottom: "none" },
						}}
					>
						<Box
							sx={{
								width: 36,
								height: 36,
								borderRadius: "9px",
								display: "grid",
								placeItems: "center",
								flex: "0 0 auto",
								bgcolor: "primary.light",
								color: "primary.main",
							}}
						>
							{WALLET_ICON(p.walletType)}
						</Box>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "primary.main" }}>
								{t("transaction.detail.paymentLabel", {
									id: formatEntityId(p.paymentNumber ?? p.id),
								})}
							</Typography>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "7px",
									mt: "2px",
									fontSize: 12,
									color: "text.secondary",
								}}
							>
								<Box component="span" sx={numericSx}>
									{formatDateTime(p.date)}
								</Box>
								<MetaDot />
								{p.walletName}
							</Box>
						</Box>
						<Box
							component="span"
							sx={{ ...numericSx, fontWeight: 700, fontSize: 14.5, color: "success.main" }}
						>
							{formatCurrency(p.amount)}
						</Box>
					</Box>
				))
			)}
		</SdCard>
	);
};

/* ─────────────────────────── refund history ─────────────────────────── */

export const RefundHistoryCard: React.FC<{
	direction: TransactionDirection;
	refunds: TransactionRecord[];
	onOpen: (id: number) => void;
}> = ({ direction, refunds, onOpen }) => {
	const { t } = useTranslation();
	return (
		<SdCard
			title={t(`transaction.detail.refundsTitle.${direction}`)}
			icon={<UndoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
			count={refunds.length}
		>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left", pl: "18px" }}>
							{t("transaction.detail.refundCol.date")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left" }}>
							{t("transaction.detail.refundCol.number")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left" }}>
							{t("transaction.detail.refundCol.positions")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, textAlign: "left" }}>
							{t("transaction.detail.refundCol.reason")}
						</Box>
						<Box component="th" sx={{ ...headCellSx, pr: "18px" }}>
							{t("transaction.detail.refundCol.amount")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{refunds.map((r) => (
						<Box
							component="tr"
							key={r.id}
							onClick={() => onOpen(r.id)}
							sx={{ cursor: "pointer", "&:hover td": { bgcolor: designTokens.gray25 } }}
						>
							<Box component="td" sx={{ ...bodyCellSx, textAlign: "left", pl: "18px" }}>
								{formatDateTime(r.date)}
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									textAlign: "left",
									fontWeight: 700,
									color: designTokens.gray700,
								}}
							>
								{formatEntityId(r.transactionNumber ?? r.id)}
							</Box>
							<Box component="td" sx={{ ...bodyCellSx, textAlign: "left" }}>
								{r.lines.length}
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									textAlign: "left",
									fontFamily: "inherit",
									color: "text.secondary",
									fontSize: 13,
								}}
							>
								{r.refundReason}
							</Box>
							<Box
								component="td"
								sx={{ ...bodyCellSx, pr: "18px", fontWeight: 700, color: designTokens.gray700 }}
							>
								−{formatCurrency(r.totalDue)}
							</Box>
						</Box>
					))}
				</tbody>
			</Box>
		</SdCard>
	);
};

/* ─────────────────────────── note + attachments ─────────────────────────── */

export const NoteAttachmentsCard: React.FC<{
	tx: TransactionRecord;
	onOpenAttachment: (name: string) => void;
}> = ({ tx, onOpenAttachment }) => {
	const { t } = useTranslation();
	return (
		<SdCard
			title={t("transaction.detail.noteTitle")}
			icon={<DescriptionOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
		>
			<Box sx={{ p: "16px 18px" }}>
				{tx.notes && (
					<Typography sx={{ fontSize: 13.5, lineHeight: 1.6, color: designTokens.gray700 }}>
						{tx.notes}
					</Typography>
				)}
				{(tx.attachments?.length ?? 0) > 0 && (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: tx.notes ? "14px" : 0 }}>
						{tx.attachments?.map((a) => (
							<Box
								key={a.name}
								onClick={() => onOpenAttachment(a.name)}
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "11px",
									p: "9px 13px 9px 10px",
									border: "1px solid",
									borderColor: designTokens.gray300,
									borderRadius: "8px",
									cursor: "pointer",
									"&:hover": { borderColor: designTokens.primaryLine, bgcolor: "primary.light" },
								}}
							>
								<Box
									sx={{
										width: 32,
										height: 32,
										borderRadius: "7px",
										display: "grid",
										placeItems: "center",
										flex: "0 0 auto",
										...(a.kind === "pdf"
											? { bgcolor: designTokens.errorBg, color: "error.main" }
											: { bgcolor: "rgba(42,111,151,0.12)", color: "info.main" }),
									}}
								>
									{a.kind === "pdf" ? (
										<DescriptionOutlinedIcon sx={{ fontSize: 17 }} />
									) : (
										<ImageOutlinedIcon sx={{ fontSize: 17 }} />
									)}
								</Box>
								<Box>
									<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.name}</Typography>
									<Typography
										sx={{ ...numericSx, fontSize: 11.5, color: "text.disabled", mt: "1px" }}
									>
										{a.size}
									</Typography>
								</Box>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</SdCard>
	);
};

/* ─────────────────────────── audit ─────────────────────────── */

export const AuditCard: React.FC<{ tx: TransactionRecord; isRefund: boolean }> = ({
	tx,
	isRefund,
}) => {
	const { t } = useTranslation();
	const direction = directionOf(tx.type);
	const rows: Array<{ icon: React.ReactNode; k: string; v: React.ReactNode }> = [
		{
			icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
			k: t(`transaction.detail.partnerType.${direction}`),
			v: (
				<Box component="span" sx={{ fontWeight: 600 }}>
					{tx.partnerId ? <PartnerLink id={tx.partnerId} name={tx.partnerName} /> : tx.partnerName}
				</Box>
			),
		},
		{
			icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
			k: isRefund ? t("transaction.detail.createdRefund") : t("transaction.detail.createdSale"),
			v: (
				<>
					<Box component="span" sx={numericSx}>
						{formatDateTime(tx.date)}
					</Box>
					{tx.createdBy ? (
						<>
							{" "}
							·{" "}
							<Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
								{tx.createdBy}
							</Box>
						</>
					) : null}
				</>
			),
		},
	];
	// The lean backend DTO may omit the warehouse — drop the row rather than
	// render an empty value.
	if (tx.warehouseName) {
		rows.push({
			icon: <WarehouseOutlinedIcon sx={{ fontSize: 16 }} />,
			k: isRefund
				? t("transaction.detail.warehouse.refund")
				: t(`transaction.detail.warehouse.${direction}`),
			v: tx.warehouseName,
		});
	}
	return (
		<SdCard
			title={t("transaction.detail.infoTitle")}
			icon={<InfoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
		>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{rows.map((r, i) => (
					<Box
						key={i}
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "12px",
							p: "13px 18px",
							borderBottom: "1px solid",
							borderColor: "divider",
							"&:last-of-type": { borderBottom: "none" },
						}}
					>
						<Box
							sx={{
								width: 30,
								height: 30,
								borderRadius: "8px",
								display: "grid",
								placeItems: "center",
								flex: "0 0 auto",
								bgcolor: "grey.50",
								border: "1px solid",
								borderColor: "divider",
								color: "text.secondary",
							}}
						>
							{r.icon}
						</Box>
						<Box>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>{r.k}</Typography>
							<Typography sx={{ fontSize: 13.5, fontWeight: 500, mt: "2px" }}>{r.v}</Typography>
						</Box>
					</Box>
				))}
			</Box>
		</SdCard>
	);
};

/* ─────────────────────────── refund extras ─────────────────────────── */

export const ReasonCard: React.FC<{ reason: string }> = ({ reason }) => {
	const { t } = useTranslation();
	return (
		<SdCard
			title={t("transaction.detail.reasonTitle")}
			icon={<UndoOutlinedIcon sx={{ fontSize: 16, color: designTokens.saffron600 }} />}
		>
			<Box sx={{ p: "16px 18px" }}>
				<Typography
					sx={{
						fontSize: 14,
						lineHeight: 1.55,
						color: designTokens.gray700,
						p: "12px 14px",
						bgcolor: designTokens.warningBg,
						border: "1px solid",
						borderColor: designTokens.accentSoft,
						borderRadius: "8px",
					}}
				>
					{reason}
				</Typography>
			</Box>
		</SdCard>
	);
};

export const RefundReferenceBanner: React.FC<{
	direction: TransactionDirection;
	number?: string;
	onOpen: () => void;
}> = ({ direction, number, onOpen }) => {
	const { t } = useTranslation();
	return (
		<Box
			onClick={onOpen}
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "11px",
				p: "13px 18px",
				mb: "20px",
				bgcolor: designTokens.gray25,
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				cursor: "pointer",
				fontSize: 14,
				"&:hover": { borderColor: designTokens.primaryLine, bgcolor: "primary.light" },
			}}
		>
			<UndoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
			<Box component="span">
				{t(`transaction.detail.refundOfBanner.${direction}`)}{" "}
				<Box component="b" sx={{ ...numericSx, color: "primary.main" }}>
					{number ? formatEntityId(number) : ""}
				</Box>
			</Box>
			<Box sx={{ flexGrow: 1 }} />
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					fontSize: 13,
					fontWeight: 600,
					color: "primary.main",
				}}
			>
				{t(`transaction.detail.openOriginal.${direction}`)}
			</Box>
		</Box>
	);
};
