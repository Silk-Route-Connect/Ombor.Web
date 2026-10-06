import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EntityHistory from "components/activity/History/EntityHistory";
import { DETAIL_RAIL_COLUMNS } from "components/shared/Detail/detailLayout";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import {
	RefundFinancialCard,
	SaleFinancialCard,
} from "components/transaction/Detail/FinancialCards";
import {
	AuditCard,
	NoteAttachmentsCard,
	ReasonCard,
	RefundReferenceBanner,
} from "components/transaction/Detail/InfoCards";
import PaymentsCard from "components/transaction/Detail/PaymentsCard";
import PositionsCard from "components/transaction/Detail/PositionsCard";
import RefundHistoryCard from "components/transaction/Detail/RefundHistoryCard";
import TransactionDetailHeader from "components/transaction/Detail/TransactionDetailHeader";
import { transactionDetailPath } from "components/transaction/List/transactionTableConfigs";
import RefundModal from "components/transaction/Refund/RefundModal";
import { isPresent } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { useOpenRefundOnArrival } from "hooks/transactions/useOpenRefundOnArrival";
import { observer } from "mobx-react-lite";
import {
	PATHS,
	paymentDetailPath,
	saleDetailPath,
	saleInvoicePath,
	supplyDetailPath,
	supplyInvoicePath,
} from "routing/paths";
import { useStore } from "stores/StoreContext";
import {
	isRefundType,
	TransactionDirection,
	txDiscountTotal,
	txSubtotal,
} from "utils/transactionUtils";

import { Box, Paper, Stack } from "@mui/material";

interface TransactionDetailPageProps {
	direction: TransactionDirection;
}

const TransactionDetailPage: React.FC<TransactionDetailPageProps> = observer(({ direction }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const txId = useRouteEntityId();
	const { transactionStore, selectedTransactionStore } = useStore();

	useEffect(() => {
		if (txId !== null) {
			void selectedTransactionStore.load(txId);
		}
		return () => selectedTransactionStore.clear();
	}, [txId, selectedTransactionStore]);

	const tx = txId === null ? null : selectedTransactionStore.transaction;
	useOpenRefundOnArrival();
	const retry = () => txId !== null && void selectedTransactionStore.load(txId);
	const detailPath = direction === "Sale" ? saleDetailPath : supplyDetailPath;
	const invoicePath = direction === "Sale" ? saleInvoicePath : supplyInvoicePath;
	const openTransaction = (otherId: number) => navigate(detailPath(otherId));

	if (!isPresent(tx)) {
		return (
			<LoadStateView
				state={tx}
				onRetry={retry}
				errorTitle={t("transactions.errors.getById")}
				notFound={{
					title: t("transaction.detail.notFound"),
					backTo: direction === "Sale" ? PATHS.sales : PATHS.supplies,
				}}
			/>
		);
	}

	const refund = isRefundType(tx.type);
	const refundsOf = selectedTransactionStore.refundsOfCurrent;
	const original = selectedTransactionStore.originalOfCurrent;
	const relationsError = selectedTransactionStore.relationsError;

	const twoColSx = {
		display: "grid",
		gridTemplateColumns: DETAIL_RAIL_COLUMNS,
		gap: "20px",
		alignItems: "start",
	} as const;
	const sideSx = { display: "flex", flexDirection: "column", gap: "16px" } as const;

	return (
		<Box>
			<TransactionDetailHeader
				tx={tx}
				direction={direction}
				onCreateRefund={() => transactionStore.openRefund(tx)}
				fullyRefunded={selectedTransactionStore.isFullyRefunded}
				onPrint={() => navigate(invoicePath(tx.id))}
			/>

			{refund && original && (
				<RefundReferenceBanner
					direction={direction}
					number={tx.originalTransactionNumber}
					onOpen={() => openTransaction(original.id)}
				/>
			)}

			<Box sx={twoColSx}>
				<Stack sx={{ gap: "16px", minWidth: 0 }}>
					{refund && tx.refundReason && <ReasonCard reason={tx.refundReason} />}

					<PositionsCard lines={tx.lines} count={tx.lines.length} />

					{relationsError && (
						<Paper variant="outlined" sx={{ borderRadius: 1.5 }}>
							<LoadStateView
								state={relationsError}
								size="section"
								onRetry={retry}
								errorTitle={t("transaction.detail.relationsLoadFailed")}
							/>
						</Paper>
					)}

					{!refund && refundsOf.length > 0 && (
						<RefundHistoryCard direction={direction} refunds={refundsOf} onOpen={openTransaction} />
					)}

					{!refund && (tx.notes || (tx.attachments?.length ?? 0) > 0) && (
						<NoteAttachmentsCard tx={tx} />
					)}

					<EntityHistory kind={tx.type} id={tx.id} refreshKey={tx} variant="card" />
				</Stack>

				{/* Rail order of every detail page: the money hero, «Информация», then related records. */}
				<Box sx={sideSx}>
					{refund ? (
						<RefundFinancialCard
							direction={direction}
							total={tx.totalDue}
							positions={tx.lines.length}
							originalNumber={tx.originalTransactionNumber}
							originalPath={original ? transactionDetailPath(original) : ""}
						/>
					) : (
						<SaleFinancialCard
							direction={direction}
							total={tx.totalDue}
							subtotal={txSubtotal(tx.lines)}
							discount={txDiscountTotal(tx.lines)}
							paid={tx.totalPaid}
							remaining={tx.remaining ?? Math.max(tx.totalDue - tx.totalPaid, 0)}
							status={tx.status}
						/>
					)}

					<AuditCard tx={tx} isRefund={refund} />

					{!refund && (
						<PaymentsCard
							tx={tx}
							onOpenPayment={(paymentId) => navigate(paymentDetailPath(paymentId))}
						/>
					)}
				</Box>
			</Box>

			{transactionStore.dialogMode.kind === "refund" && (
				<RefundModal
					transaction={transactionStore.dialogMode.transaction}
					priorRefunds={refundsOf}
					isSaving={transactionStore.isSaving}
					onClose={() => transactionStore.closeDialog()}
					onSubmit={async (payload) => {
						const created = await transactionStore.createRefund(
							transactionStore.dialogMode.kind === "refund"
								? transactionStore.dialogMode.transaction
								: tx,
							payload,
						);
						if (created && txId !== null) {
							await selectedTransactionStore.load(txId);
						}
					}}
				/>
			)}
		</Box>
	);
});

export default TransactionDetailPage;
