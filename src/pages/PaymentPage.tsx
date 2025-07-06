import { useEffect, useMemo, useState } from "react";
import PaymentHeader from "components/payment/Header/PaymentHeader";
import PaymentSidePane from "components/payment/SidePane/PaymentSidePane";
import { paymentColumns } from "components/payment/Table/paymentTableConfigs";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { Payment, PaymentDirection } from "models/payment";
import { useStore } from "stores/StoreContext";

const PaymentPage: React.FC = observer(() => {
	const { paymentStore, partnerStore } = useStore();

	const [selectedDirection, setSelectedDirection] = useState<PaymentDirection | null>(null);
	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		paymentStore.getAll();
		partnerStore.getAll();
	}, [paymentStore, partnerStore]);

	const handleDirectionChange = (value: PaymentDirection | null): void => {
		setSelectedDirection(value);
	};

	const handlePartnerChange = (value: Partner | null): void => {
		setSelectedPartner(value);
		paymentStore.setFilterPartner(value?.id);
	};

	const handleCreate = (): void => {
		console.log("create payment");
	};

	const handleRowClick = (payment: Payment): void => {
		paymentStore.setSelectedPayment(payment);
	};

	const handleEdit = (payment: Payment): void => {
		console.log("edit payment" + payment.id);
	};

	const handleDelete = (payment: Payment): void => {
		console.log("delete payment" + payment.id);
	};

	const columns: Column<Payment>[] = [
		...paymentColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			align: "right",
			renderCell: (payment: Payment) => (
				<ActionMenuCell
					onEdit={() => handleEdit(payment)}
					onArchive={() => {}}
					onDelete={() => handleDelete(payment)}
				/>
			),
		},
	];

	const rows = useMemo(() => {
		if (!selectedDirection) {
			return paymentStore.filteredPayments;
		}

		if (selectedDirection === "Income") {
			return paymentStore.incomes;
		}

		return paymentStore.expenses;
	}, [selectedDirection, paymentStore.filteredPayments]);

	const paymentsCount = useMemo(() => {
		if (paymentStore.filteredPayments === "loading") {
			return 0;
		}

		if (!selectedDirection) {
			return paymentStore.filteredPayments.length;
		}

		if (selectedDirection === "Income") {
			return paymentStore.incomes.length;
		}

		return paymentStore.expenses.length;
	}, [paymentStore.filteredPayments, selectedDirection]);

	return (
		<>
			<PaymentHeader
				titleCount={paymentsCount}
				selectedDirection={selectedDirection}
				selectedPartner={selectedPartner}
				searchTerm={searchTerm}
				onSearch={setSearchTerm}
				onDirectionChange={handleDirectionChange}
				onPartnerChange={handlePartnerChange}
				onCreate={handleCreate}
			/>

			<DataTable<Payment> rows={rows} columns={columns} onRowClick={handleRowClick} pagination />

			<PaymentSidePane
				payment={paymentStore.selectedPayment}
				isOpen={!!paymentStore.selectedPayment}
				onClose={() => paymentStore.setSelectedPayment(null)}
			/>
		</>
	);
});

export default PaymentPage;
