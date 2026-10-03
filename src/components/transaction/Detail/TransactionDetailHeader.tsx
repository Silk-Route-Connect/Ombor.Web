import React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import GhostButton from "components/shared/Buttons/GhostButton";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { TransactionRecord } from "models/transaction";
import { PATHS } from "routing/paths";
import { formatOptionalNumber } from "utils/formatEntityId";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

interface TransactionDetailHeaderProps {
	tx: TransactionRecord;
	direction: TransactionDirection;
	onCreateRefund: () => void;
	onDownload: () => void;
}

/**
 * Transaction detail header on the shared {@link DetailPageHeader}: the typed
 * «Продажа №…» title only — status/date/partner/warehouse live in the body
 * sections. The refund is the only way to correct an immutable sale/supply, so it
 * is the visible `primaryAction` (a child-event creation, pattern 2); «Скачать»
 * sits in the kebab. A refund is not refundable, so its page keeps «Скачать» as
 * the only (visible) action.
 */
export const TransactionDetailHeader: React.FC<TransactionDetailHeaderProps> = ({
	tx,
	direction,
	onCreateRefund,
	onDownload,
}) => {
	const { t } = useTranslation();
	const refund = isRefundType(tx.type);

	const downloadIcon = <FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />;

	const actions: ActionMenuRow[] = refund
		? []
		: [
				{
					key: "download",
					label: t("transaction.detail.download"),
					icon: <FileDownloadOutlinedIcon fontSize="small" />,
					onClick: onDownload,
				},
			];

	const primaryAction = refund ? (
		<GhostButton icon={downloadIcon} onClick={onDownload}>
			{t("transaction.detail.download")}
		</GhostButton>
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
