import React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import GhostButton from "components/shared/Buttons/GhostButton";
import StatusPill from "components/shared/Chip/StatusPill";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { TransactionRecord } from "models/transaction";
import { PATHS } from "routing/paths";
import { formatOptionalNumber } from "utils/formatEntityId";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

interface TransactionDetailHeaderProps {
	tx: TransactionRecord;
	direction: TransactionDirection;
	onCreateRefund: () => void;
	/** Every line already went back: the refund action gives way to a «Возвращено полностью» note. */
	fullyRefunded: boolean;
	/** Opens the printable «Накладная». */
	onPrint: () => void;
}

/**
 * Transaction detail header on the shared {@link DetailPageHeader}: the typed
 * «Продажа №…» title only — status/date/partner/warehouse live in the body
 * sections. The refund is the only way to correct an immutable sale/supply, so it
 * is the visible `primaryAction` (a child-event creation, pattern 2); «Печать
 * накладной» sits in the kebab. A refund is not refundable, so its page keeps
 * the print action as the only (visible) one.
 */
export const TransactionDetailHeader: React.FC<TransactionDetailHeaderProps> = ({
	tx,
	direction,
	onCreateRefund,
	fullyRefunded,
	onPrint,
}) => {
	const { t } = useTranslation();
	const refund = isRefundType(tx.type);

	const actions: ActionMenuRow[] = refund
		? []
		: [
				{
					key: "print",
					label: t("print.invoice.action"),
					icon: <PrintOutlinedIcon fontSize="small" />,
					onClick: onPrint,
				},
			];

	const primaryAction = refund ? (
		<GhostButton
			icon={<PrintOutlinedIcon sx={{ fontSize: "17px !important" }} />}
			onClick={onPrint}
		>
			{t("print.invoice.action")}
		</GhostButton>
	) : fullyRefunded ? (
		<StatusPill
			token="neutral"
			size="md"
			icon={TaskAltOutlinedIcon}
			label={t("transaction.refund.fullyRefunded")}
		/>
	) : (
		<GhostButton
			icon={<UndoOutlinedIcon sx={{ fontSize: "17px !important" }} />}
			onClick={onCreateRefund}
		>
			{t("transaction.detail.createRefund")}
		</GhostButton>
	);

	return (
		<DetailPageHeader
			backTo={direction === "Sale" ? PATHS.sales : PATHS.supplies}
			title={t(`transaction.detail.title.${tx.type}`, {
				number: formatOptionalNumber(tx.transactionNumber, t("common.noNumber")),
			})}
			primaryAction={primaryAction}
			actions={actions}
		/>
	);
};

export default TransactionDetailHeader;
