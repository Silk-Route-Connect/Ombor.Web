import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentStatus, TransactionType } from "models/transaction";
import { designTokens } from "theme";
import { directionOf, isRefundType, STATUS_TONE } from "utils/transactionUtils";

import { alpha, Box, useTheme } from "@mui/material";

/** Type pill per the bundle's `.tx-badge`: base = primary-soft, refund = outlined. */
export const TransactionTypeBadge: React.FC<{ type: TransactionType; large?: boolean }> = ({
	type,
	large,
}) => {
	const { t } = useTranslation();
	const direction = directionOf(type);
	const refund = isRefundType(type);
	const label = refund
		? t(`transaction.badge.refund.${direction}`)
		: t(`transaction.badge.base.${direction}`);

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				height: large ? 26 : 22,
				px: large ? "13px" : "10px",
				borderRadius: "999px",
				fontSize: large ? 12.5 : 11.5,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				...(refund
					? { color: "text.secondary", borderColor: designTokens.gray300, bgcolor: "transparent" }
					: {
							color: "primary.main",
							bgcolor: "primary.light",
							borderColor: designTokens.primaryLine,
						}),
			}}
		>
			{label}
		</Box>
	);
};

/** Soft payment-status chip (short label for the list, full for the detail). */
export const TransactionStatusChip: React.FC<{ status: PaymentStatus; full?: boolean }> = ({
	status,
	full,
}) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const color = theme.palette[STATUS_TONE[status]].main;
	const label = full
		? t(`transaction.statusFull.${status}`)
		: t(`transaction.statusFilter.${status}`);

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				fontSize: 11.5,
				fontWeight: 600,
				whiteSpace: "nowrap",
				color,
				bgcolor: alpha(color, 0.12),
				border: "1px solid",
				borderColor: alpha(color, 0.24),
			}}
		>
			{label}
		</Box>
	);
};
