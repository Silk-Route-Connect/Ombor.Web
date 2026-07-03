import React from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import GhostButton from "components/shared/Buttons/GhostButton";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import MetaDot from "components/shared/Detail/MetaDot";
import {
	TransactionStatusChip,
	TransactionTypeBadge,
} from "components/transaction/TransactionBadges";
import { TransactionRecord } from "models/transaction";
import { PATHS } from "routing/paths";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatEntityId } from "utils/formatEntityId";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

interface TransactionDetailHeaderProps {
	tx: TransactionRecord;
	direction: TransactionDirection;
	onCreateRefund: () => void;
	onDownload: () => void;
}

/**
 * Transaction detail header on the shared {@link DetailPageHeader}: «№…» title
 * with the type + payment-status chips beside it and a date · partner meta line
 * (the warehouse lives in the «Информация» card, not the header). Download stays
 * the visible action; the refund create is the kebab's only row — refund details
 * are kebab-less (a refund cannot be refunded).
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
			titleExtra={
				<>
					<TransactionTypeBadge type={tx.type} />
					{!refund && <TransactionStatusChip status={tx.status} full />}
				</>
			}
			meta={
				<>
					<Box component="span" sx={{ ...numericSx, whiteSpace: "nowrap" }}>
						{formatDate(tx.date)}
						{tx.time ? ` · ${tx.time}` : ""}
					</Box>
					<MetaDot />
					{tx.partnerId ? (
						<Box component="span" sx={{ fontWeight: 600 }}>
							<PartnerLink id={tx.partnerId} name={tx.partnerName} />
						</Box>
					) : (
						<Box component="span" sx={{ fontWeight: 600 }}>
							{tx.partnerName}
						</Box>
					)}
				</>
			}
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
