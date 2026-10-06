import React from "react";
import { PAYMENT_TYPE_META } from "components/payment/PaymentPresentation";
import { kindPresentation } from "components/shared/Chip/movementKind";
import StatusPill from "components/shared/Chip/StatusPill";
import { PartnerLedgerEventType } from "models/partner";
import { ChipTokenKey } from "theme";

import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { SvgIconProps } from "@mui/material";

/**
 * Ledger event → the same chip the rest of the app shows for it: documents reuse
 * the shared kind presentation (Sale teal, Supply saffron, refunds outlined, with
 * their icons), payment events the Payments-list type chips (Оплата teal, Аванс
 * blue, Возврат аванса saffron), the opening balance a neutral flag. Never
 * green/red — those mark money.
 */
const EVENT: Record<
	PartnerLedgerEventType,
	{ token: ChipTokenKey; icon?: React.ComponentType<SvgIconProps> }
> = {
	sale: kindPresentation("Sale"),
	supply: kindPresentation("Supply"),
	"refund-sale": kindPresentation("SaleRefund"),
	"refund-supply": kindPresentation("SupplyRefund"),
	payment: { token: PAYMENT_TYPE_META.Transaction.token },
	deposit: { token: PAYMENT_TYPE_META.Deposit.token },
	withdraw: { token: PAYMENT_TYPE_META.Withdrawal.token },
	opening: { token: "neutral", icon: FlagOutlinedIcon },
};

export const eventLabelKey = (type: PartnerLedgerEventType): string => `partner.event.${type}`;

/** The event chip of the ledger / transactions / payments tables. */
export const EventCell: React.FC<{ type: PartnerLedgerEventType; label: string }> = ({
	type,
	label,
}) => {
	const { token, icon } = EVENT[type] ?? EVENT.opening;
	return <StatusPill token={token} icon={icon} label={label} />;
};
