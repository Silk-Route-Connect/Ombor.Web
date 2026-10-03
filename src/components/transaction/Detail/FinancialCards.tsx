import React from "react";
import { useTranslation } from "react-i18next";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import DetailCard from "components/shared/Detail/DetailCard";
import DetailLink from "components/shared/Link/DetailLink";
import UzsUnit from "components/shared/Money/UzsUnit";
import NoValue from "components/shared/Table/cells/NoValue";
import { TransactionStatus } from "models/transaction";
import { designTokens, numericSx, radius, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { TransactionDirection } from "utils/transactionUtils";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Typography } from "@mui/material";

const FinRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
	<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
		<Box component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
			{label}
		</Box>
		<Box component="span" sx={{ ...numericSx, fontWeight: 600 }}>
			{children}
		</Box>
	</Box>
);

const Money: React.FC<{ value: number }> = ({ value }) => (
	<>
		{formatCurrency(value)}
		<UzsUnit />
	</>
);

const Hero: React.FC<{ label: string; amount: number; color?: string }> = ({
	label,
	amount,
	color = "text.primary",
}) => (
	<>
		<Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
		<Typography sx={{ ...typeScale.numHero, lineHeight: 1, mt: "6px", color }}>
			{formatCurrency(amount)}
			<UzsUnit sx={{ fontSize: 14 }} />
		</Typography>
	</>
);

const rowsSx = {
	mt: "18px",
	pt: "16px",
	borderTop: 1,
	borderColor: "divider",
	display: "flex",
	flexDirection: "column",
	gap: "13px",
} as const;

/** The sale / supply money summary: total, subtotal, discount, paid, remaining, status. */
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
		<DetailCard>
			<Box sx={{ p: "18px" }}>
				<Hero
					label={t(`transaction.detail.fin.amount.${direction}`)}
					amount={total}
					color="primary.main"
				/>
				<Box sx={rowsSx}>
					<FinRow label={t("transaction.detail.subtotal")}>
						<Money value={subtotal} />
					</FinRow>
					<FinRow label={t("transaction.detail.discountByLines")}>
						{discount ? (
							<Box component="span" sx={{ color: designTokens.saffron700 }}>
								<Money value={discount} />
							</Box>
						) : (
							<NoValue />
						)}
					</FinRow>
					<Box sx={{ height: "1px", bgcolor: "divider" }} />
					<FinRow label={t("transaction.detail.fin.paid")}>
						{paid ? (
							<Box component="span" sx={{ color: "success.main" }}>
								<Money value={paid} />
							</Box>
						) : (
							<NoValue />
						)}
					</FinRow>
					<FinRow label={t("transaction.detail.fin.remaining")}>
						{remaining > 0 ? (
							<Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
								<Money value={remaining} />
							</Box>
						) : (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "6px",
									color: "success.dark",
								}}
							>
								<CheckCircleIcon sx={{ fontSize: 16 }} />
								{t("transaction.detail.fin.paidFull")}
							</Box>
						)}
					</FinRow>
					<FinRow label={t("transaction.detail.fin.status")}>
						<PaymentStatusChip status={status} />
					</FinRow>
				</Box>
			</Box>
		</DetailCard>
	);
};

/** The refund money summary: refunded amount, the original document, positions. */
export const RefundFinancialCard: React.FC<{
	direction: TransactionDirection;
	total: number;
	positions: number;
	originalNumber?: string;
	/** Detail route of the original document; empty while it is not loaded. */
	originalPath: string;
}> = ({ direction, total, positions, originalNumber, originalPath }) => {
	const { t } = useTranslation();
	return (
		<DetailCard>
			<Box sx={{ p: "18px" }}>
				<Hero label={t("transaction.detail.refundAmount")} amount={total} />
				<Box sx={rowsSx}>
					<FinRow label={t(`transaction.detail.original.${direction}`)}>
						{!originalNumber ? (
							<NoValue />
						) : originalPath ? (
							<DetailLink to={originalPath}>{formatEntityId(originalNumber)}</DetailLink>
						) : (
							formatEntityId(originalNumber)
						)}
					</FinRow>
					<FinRow label={t("transaction.detail.positionsReturned")}>{positions}</FinRow>
				</Box>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						mt: "18px",
						p: "10px 12px",
						bgcolor: designTokens.gray25,
						border: 1,
						borderColor: "divider",
						borderRadius: `${radius.md}px`,
						fontSize: 12,
						color: "text.secondary",
					}}
				>
					<InfoOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
					{t("transaction.detail.refundImmutable")}
				</Box>
			</Box>
		</DetailCard>
	);
};
