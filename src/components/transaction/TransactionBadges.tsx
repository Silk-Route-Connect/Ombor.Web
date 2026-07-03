import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionStatus, TransactionType } from "models/transaction";
import { chipTokens } from "theme";
import { directionOf, isRefundType } from "utils/transactionUtils";

import { SvgIconComponent } from "@mui/icons-material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

/** Transaction type → chipTokens key (DSN-1: teal=Sale, saffron=Supply, refunds outlined). */
const TYPE_TOKEN: Record<TransactionType, keyof typeof chipTokens> = {
	Sale: "sale",
	Supply: "supply",
	SaleRefund: "saleRefund",
	SupplyRefund: "supplyRefund",
};

/** Type → leading icon, matched by meaning (sell / inbound supply / reversal). */
const TYPE_ICON: Record<TransactionType, SvgIconComponent> = {
	Sale: SellOutlinedIcon,
	Supply: LocalShippingOutlinedIcon,
	SaleRefund: UndoOutlinedIcon,
	SupplyRefund: UndoOutlinedIcon,
};

/** Transaction status → chipTokens key (the served `TransactionDto.Status` enum). */
const STATUS_TOKEN: Record<TransactionStatus, keyof typeof chipTokens> = {
	Open: "open",
	PartiallyPaid: "partiallyPaid",
	Overdue: "overdue",
	Closed: "closed",
};

/** Type pill — colour + icon sourced from `chipTokens` (DSN-1 locked semantics). */
export const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
	const { t } = useTranslation();
	const direction = directionOf(type);
	const refund = isRefundType(type);
	const tk = chipTokens[TYPE_TOKEN[type]];
	const Icon = TYPE_ICON[type];
	const label = refund
		? t(`transaction.badge.refund.${direction}`)
		: t(`transaction.badge.base.${direction}`);

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				height: 22,
				px: "10px",
				borderRadius: "999px",
				fontSize: 11.5,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			<Icon sx={{ fontSize: 13 }} />
			{label}
		</Box>
	);
};

/** Soft payment-status chip. */
export const TransactionStatusChip: React.FC<{ status: TransactionStatus }> = ({ status }) => {
	const { t } = useTranslation();
	const tk = chipTokens[STATUS_TOKEN[status]];
	const label = t(`transaction.statusShort.${status}`);

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
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			{label}
		</Box>
	);
};
