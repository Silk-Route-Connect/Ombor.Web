import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
	AuditCard,
	NoteAttachmentsCard,
	PartnerMiniCard,
	PaymentsCard,
	PositionsCard,
	ReasonCard,
	RefundFinancialCard,
	RefundFooter,
	RefundHistoryCard,
	RefundReferenceBanner,
	SaleFinancialCard,
	SaleFooter,
} from "components/transaction/Detail/cards";
import TransactionDetailHeader from "components/transaction/Detail/TransactionDetailHeader";
import RefundModal from "components/transaction/Refund/RefundModal";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

interface TransactionDetailPageProps {
	direction: TransactionDirection;
}

const TransactionDetailPage: React.FC<TransactionDetailPageProps> = observer(({ direction }) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const txId = Number(id);
	const { transactionStore, selectedTransactionStore, notificationStore } = useStore();

	useEffect(() => {
		if (Number.isFinite(txId)) {
			void selectedTransactionStore.load(txId);
		}
		return () => selectedTransactionStore.clear();
	}, [txId, selectedTransactionStore]);

	const tx = selectedTransactionStore.transaction;
	const detailBase = direction === "Sale" ? "/sales" : "/supplies";
	const openTransaction = (otherId: number) => navigate(`${detailBase}/${otherId}`);
	const devToast = (name: string) =>
		notificationStore.info(t("transaction.detail.devToast", { name }));

	if (tx === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (tx === null) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("transaction.detail.notFound")}</Typography>
			</Box>
		);
	}

	const refund = isRefundType(tx.type);
	const refundsOf = selectedTransactionStore.refundsOfCurrent;
	const original = selectedTransactionStore.originalOfCurrent;

	const twoColSx = {
		display: "grid",
		gridTemplateColumns: { xs: "1fr", md: "1fr 372px" },
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
				onDownload={() => devToast(t("transaction.detail.download"))}
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

					<PositionsCard
						lines={tx.lines}
						count={tx.lines.length}
						footer={refund ? <RefundFooter lines={tx.lines} /> : <SaleFooter lines={tx.lines} />}
					/>

					{!refund && refundsOf.length > 0 && (
						<RefundHistoryCard direction={direction} refunds={refundsOf} onOpen={openTransaction} />
					)}

					{!refund && (tx.notes || (tx.attachments?.length ?? 0) > 0) && (
						<NoteAttachmentsCard tx={tx} onOpenAttachment={(name) => devToast(name)} />
					)}
				</Stack>

				<Box sx={sideSx}>
					<PartnerMiniCard name={tx.partnerName} direction={direction} id={tx.partnerId} />

					{refund ? (
						<RefundFinancialCard
							direction={direction}
							total={tx.totalDue}
							positions={tx.lines.length}
							originalNumber={tx.originalTransactionNumber}
							onOpenOriginal={() => original && openTransaction(original.id)}
						/>
					) : (
						<SaleFinancialCard
							direction={direction}
							total={tx.totalDue}
							paid={tx.totalPaid}
							remaining={tx.remaining ?? Math.max(tx.totalDue - tx.totalPaid, 0)}
							status={tx.status}
						/>
					)}

					<AuditCard tx={tx} isRefund={refund} />

					{!refund && (
						<PaymentsCard
							tx={tx}
							onOpenPayment={(pid) =>
								devToast(`${t("transaction.detail.paymentLabel", { id: pid })}`)
							}
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
						if (created) {
							await selectedTransactionStore.load(txId);
						}
					}}
				/>
			)}
		</Box>
	);
});

export default TransactionDetailPage;
