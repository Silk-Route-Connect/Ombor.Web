import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PaymentHeader from "components/payment/Header/PaymentHeader";
import PaymentSidePane from "components/payment/SidePane/PaymentSidePane";
import { PaymentsTable } from "components/payment/Table/PaymentsTable";
import { observer } from "mobx-react-lite";
import { Payment } from "models/payment";
import { useStore } from "stores/StoreContext";
import { isNumber } from "utils/stringUtils";

const PAYMENTS_BASE_ROUTE = "/payments";

const PaymentPage: React.FC = observer(() => {
	const { paymentStore, partnerStore } = useStore();
	const navigate = useNavigate();
	const { id: navigationId } = useParams<{ id?: string }>();

	useEffect(() => {
		paymentStore.getAll();
		partnerStore.getAll();
	}, [paymentStore, partnerStore]);

	useEffect(() => {
		if (!isNumber(navigationId)) {
			paymentStore.setSelectedPayment(null);
			return;
		}

		if (paymentStore.allPayments === "loading") {
			return;
		}

		const payment = paymentStore.allPayments.find((p) => p.id.toString() === navigationId) ?? null;

		if (payment) {
			paymentStore.setSelectedPayment(payment);
		} else {
			navigate(PAYMENTS_BASE_ROUTE, { replace: true });
		}
	}, [navigationId, paymentStore.allPayments]);

	const handleCreate = (): void => {
		// TODO: hook up actual create flow
		// Intentionally left as-is per current behavior
		// eslint-disable-next-line no-console
		console.log("create payment");
	};

	const handleRowClick = useCallback(
		(payment: Payment) => {
			paymentStore.setSelectedPayment(payment);
			navigate(`${PAYMENTS_BASE_ROUTE}/${payment.id}`, { replace: false });
		},
		[navigate, paymentStore],
	);

	const handleCloseSidePane = useCallback(() => {
		paymentStore.setSelectedPayment(null);
		navigate(PAYMENTS_BASE_ROUTE, { replace: false });
	}, [navigate, paymentStore]);

	const paymentsCount = useMemo(() => {
		if (paymentStore.filteredPayments === "loading") {
			return 0;
		}

		return paymentStore.filteredPayments.length;
	}, [paymentStore.filteredPayments]);

	return (
		<>
			<PaymentHeader
				titleCount={paymentsCount}
				selectedDirection={paymentStore.filterDirection}
				selectedPartner={paymentStore.filterPartner}
				searchTerm={paymentStore.searchTerm}
				onSearch={paymentStore.setSearch}
				onDirectionChange={paymentStore.setFilterDirection}
				onPartnerChange={paymentStore.setFilterPartner}
				onCreate={handleCreate}
			/>

			<PaymentsTable
				payments={paymentStore.filteredPayments}
				onPaymentClick={handleRowClick}
				pagination
			/>

			<PaymentSidePane
				payment={paymentStore.selectedPayment}
				isOpen={!!paymentStore.selectedPayment}
				onClose={handleCloseSidePane}
			/>
		</>
	);
});

export default PaymentPage;
