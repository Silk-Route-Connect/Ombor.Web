import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import PaymentAllocationCard from "components/payment/Detail/PaymentAllocationCard";
import {
	PaymentAmountCard,
	PaymentAttachmentsCard,
	PaymentGeneralCard,
	PaymentInfoCard,
	PaymentPayrollCard,
	PaymentWithdrawalCard,
} from "components/payment/Detail/PaymentDetailCards";
import PaymentSourceCard from "components/payment/Detail/PaymentSourceCard";
import { DETAIL_RAIL_COLUMNS } from "components/shared/Detail/detailLayout";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isPresent } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatEntityId, hasEntityNumber } from "utils/formatEntityId";

import { Box, Stack } from "@mui/material";

const PaymentDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const paymentId = useRouteEntityId();
	const { selectedPaymentStore } = useStore();

	useEffect(() => {
		if (paymentId !== null) {
			void selectedPaymentStore.load(paymentId);
		}
		return () => selectedPaymentStore.clear();
	}, [paymentId, selectedPaymentStore]);

	const payment = paymentId === null ? null : selectedPaymentStore.payment;

	if (!isPresent(payment)) {
		return (
			<LoadStateView
				state={payment}
				onRetry={() => paymentId !== null && void selectedPaymentStore.load(paymentId)}
				errorTitle={t("payment.error.getById")}
				notFound={{ title: t("payment.detail.notFound"), backTo: PATHS.payments }}
			/>
		);
	}

	const isPayroll = payment.type === "Payroll";
	const isGeneral = payment.type === "General";
	const isWithdrawal = payment.type === "Withdrawal";

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.payments}
				title={
					hasEntityNumber(payment.number)
						? t("payment.detail.title", { number: formatEntityId(payment.number) })
						: t("payment.detail.untitled")
				}
			/>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: DETAIL_RAIL_COLUMNS,
					gap: "20px",
					alignItems: "start",
				}}
			>
				<Stack sx={{ gap: "16px", minWidth: 0 }}>
					{isPayroll && <PaymentPayrollCard payment={payment} />}
					{isGeneral && <PaymentGeneralCard payment={payment} />}

					<PaymentSourceCard payment={payment} />

					{isWithdrawal && <PaymentWithdrawalCard payment={payment} />}
					{!isPayroll && !isGeneral && !isWithdrawal && payment.allocations.length > 0 && (
						<PaymentAllocationCard payment={payment} />
					)}

					{(payment.attachments?.length > 0 ||
						payment.transactionNotes ||
						payment.transactionAttachments?.length > 0) && (
						<PaymentAttachmentsCard payment={payment} />
					)}
				</Stack>

				<Stack sx={{ gap: "16px" }}>
					<PaymentAmountCard payment={payment} />
					<PaymentInfoCard payment={payment} />
				</Stack>
			</Box>
		</Box>
	);
});

export default PaymentDetailPage;
