import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTable from "components/shared/Detail/DetailTable";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import NotesCell from "components/shared/Table/cells/NotesCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import {
	transactionDetailPath,
	transactionDisplayNumber,
} from "components/transaction/List/transactionTableConfigs";
import { TransactionRecord } from "models/transaction";
import { entityNumberSortValue } from "utils/formatEntityId";
import { TransactionDirection } from "utils/transactionUtils";

import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

/**
 * The refunds made against this sale / supply — № · Дата · Позиций · Причина ·
 * Сумма (unsigned; the card title says these are refunds). A row opens it.
 */
export const RefundHistoryCard: React.FC<{
	direction: TransactionDirection;
	refunds: TransactionRecord[];
	onOpen: (id: number) => void;
}> = ({ direction, refunds, onOpen }) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<TransactionRecord>[]>(
		() => [
			{
				key: "number",
				headerName: t("transaction.detail.refundCol.number"),
				sortValue: (r) => entityNumberSortValue(transactionDisplayNumber(r)),
				renderCell: (r) => (
					<DocNumberCell number={transactionDisplayNumber(r)} to={transactionDetailPath(r)} />
				),
			},
			{
				key: "date",
				headerName: t("transaction.detail.refundCol.date"),
				sortValue: (r) => r.date.getTime(),
				renderCell: (r) => <DateCell value={r.date} />,
			},
			{
				key: "positions",
				headerName: t("transaction.detail.refundCol.positions"),
				align: "right",
				sortValue: (r) => r.lines.length,
				renderCell: (r) => <QuantityCell value={r.lines.length} />,
			},
			{
				key: "reason",
				headerName: t("transaction.detail.refundCol.reason"),
				sortable: false,
				renderCell: (r) => <NotesCell text={r.refundReason} maxWidth={240} />,
			},
			{
				key: "amount",
				headerName: t("transaction.detail.refundCol.amount"),
				align: "right",
				sortValue: (r) => r.totalDue,
				renderCell: (r) => <MoneyCell value={r.totalDue} main />,
			},
		],
		[t],
	);

	return (
		<DetailCard
			title={t(`transaction.detail.refundsTitle.${direction}`)}
			icon={<UndoOutlinedIcon sx={detailCardIconSx} />}
			count={refunds.length}
		>
			<DetailTable<TransactionRecord>
				rows={refunds}
				columns={columns}
				defaultSort={{ key: "date", order: "desc" }}
				onRowClick={(r) => onOpen(r.id)}
			/>
		</DetailCard>
	);
};

export default RefundHistoryCard;
