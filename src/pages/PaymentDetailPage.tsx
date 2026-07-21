import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
	PaymentAllocationCard,
	PaymentAttachmentsCard,
	PaymentGeneralCard,
	PaymentInfoCard,
	PaymentPayrollCard,
	PaymentSourceCard,
	PaymentWithdrawalCard,
} from "components/payment/Detail/PaymentDetailCards";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import { observer } from "mobx-react-lite";
import { partnerDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatEntityId } from "utils/formatEntityId";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

const PaymentDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const paymentId = Number(id);
	const { selectedPaymentStore } = useStore();

	useEffect(() => {
		if (Number.isFinite(paymentId)) {
			selectedPaymentStore.load(paymentId);
		}
		return () => selectedPaymentStore.clear();
	}, [paymentId, selectedPaymentStore]);

	const payment = selectedPaymentStore.payment;

	if (payment === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (payment === null) {
		return (
			<Box sx={{ py: 10, textAlign: "center" }}>
				<Typography sx={{ color: "text.secondary" }}>{t("payment.detail.notFound")}</Typography>
			</Box>
		);
	}

	const isPayroll = payment.type === "Payroll";
	const isGeneral = payment.type === "General";
	const isWithdrawal = payment.type === "Withdrawal";

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.payments}
				title={formatEntityId(payment.number ?? payment.id)}
			/>

			<Box
				sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 340px" }, gap: "20px" }}
			>
				<Stack sx={{ gap: "16px", minWidth: 0 }}>
					{isPayroll && <PaymentPayrollCard payment={payment} />}
					{isGeneral && <PaymentGeneralCard payment={payment} />}

					<PaymentSourceCard payment={payment} />

					{isWithdrawal && <PaymentWithdrawalCard payment={payment} />}
					{!isPayroll && !isGeneral && !isWithdrawal && payment.allocations.length > 0 && (
						<PaymentAllocationCard payment={payment} />
					)}

					{(payment.attachments.length > 0 ||
						payment.transactionNotes ||
						payment.transactionAttachments.length > 0) && (
						<PaymentAttachmentsCard payment={payment} />
					)}
				</Stack>

				<Box>
					<PaymentInfoCard
						payment={payment}
						onOpenPartner={
							payment.partnerId != null
								? () => navigate(partnerDetailPath(payment.partnerId as number))
								: undefined
						}
					/>
				</Box>
			</Box>
		</Box>
	);
});

export default PaymentDetailPage;
