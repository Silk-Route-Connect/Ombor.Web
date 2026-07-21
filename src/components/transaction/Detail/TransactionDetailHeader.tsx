import React from "react";
import { useTranslation } from "react-i18next";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import GhostButton from "components/shared/Buttons/GhostButton";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { TransactionRecord } from "models/transaction";
import { PATHS } from "routing/paths";
import { formatEntityId } from "utils/formatEntityId";
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
 * Transaction detail header on the shared {@link DetailPageHeader}: the «№…»
 * title ONLY — type/status/date/partner/warehouse all live in the body sections
 * («Информация», financial card, refund banner), per the locked name-only rule.
 * Download stays the visible action; the refund create is the kebab's only row —
 * refund details are kebab-less (a refund cannot be refunded).
 */
export const TransactionDetailHeader: React.FC<TransactionDetailHeaderProps> = ({
	tx,
	direction,
	onCreateRefund,
	onDownload,
}) => {
	const { t } = useTranslation();
	const refund = isRefundType(tx.type);

	const actions: ActionMenuRow[] = refund
		? []
		: [
				{
					key: "refund",
					label: t("transaction.detail.createRefund"),
					icon: <UndoOutlinedIcon fontSize="small" />,
					onClick: onCreateRefund,
				},
			];

	return (
		<DetailPageHeader
			backTo={direction === "Sale" ? PATHS.sales : PATHS.supplies}
			title={formatEntityId(tx.transactionNumber ?? tx.id)}
			primaryAction={
				<GhostButton
					icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
					onClick={onDownload}
				>
					{t("transaction.detail.download")}
				</GhostButton>
			}
			actions={actions}
		/>
	);
};

export default TransactionDetailHeader;
