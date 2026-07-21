import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PaymentCreateModal from "components/payment/Form/PaymentCreateModal";
import PaymentHeader from "components/payment/Header/PaymentHeader";
import PaymentSummaryStrip from "components/payment/List/PaymentSummaryStrip";
import { PAYMENT_TYPE_META } from "components/payment/PaymentPresentation";
import { PaymentsTable } from "components/payment/Table/PaymentsTable";
import { observer } from "mobx-react-lite";
import { CreatePaymentRecordRequest, PaymentRecord } from "models/payment";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatEntityId } from "utils/formatEntityId";

import { Box } from "@mui/material";

const PaymentPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { paymentStore } = useStore();

	useEffect(() => {
		paymentStore.getAll();
	}, [paymentStore]);

	// Load reference data lazily when the create modal opens (refetched after a
	// create, since advances / outstanding / wallet balances moved).
	useEffect(() => {
		if (paymentStore.isCreateOpen && paymentStore.formData === "loading") {
			paymentStore.getFormData();
		}
	}, [paymentStore.isCreateOpen, paymentStore.formData, paymentStore]);

	const handleCreate = (request: CreatePaymentRecordRequest): void => {
		void paymentStore.create(request);
	};

	const handleExport = (): void => {
		const rows = paymentStore.filteredPayments === "loading" ? [] : paymentStore.filteredPayments;
		const columns: CsvColumn<PaymentRecord>[] = [
			{ header: t("payment.table.number"), value: (p) => formatEntityId(p.number ?? p.id) },
			{ header: t("payment.table.date"), value: (p) => formatDate(p.date) },
			{ header: t("payment.table.type"), value: (p) => t(PAYMENT_TYPE_META[p.type].labelKey) },
			{
				header: t("payment.table.direction"),
				value: (p) =>
					p.direction === "Income" ? t("payment.direction.income") : t("payment.direction.expense"),
			},
			{ header: t("payment.table.party"), value: (p) => p.partnerName ?? p.employeeName ?? "" },
			{ header: t("payment.table.wallet"), value: (p) => p.walletName },
			{ header: t("payment.table.amount"), value: (p) => p.amount },
		];
		exportToCsv(`payments_${csvDateStamp()}`, columns, rows);
	};

	const isFiltering =
		paymentStore.searchTerm.trim().length > 0 ||
		paymentStore.typeFilter !== "all" ||
		paymentStore.walletFilter !== "all" ||
		paymentStore.directionFilter !== "all";

	return (
		<Box>
			<PaymentHeader
				searchValue={paymentStore.searchTerm}
				typeFilter={paymentStore.typeFilter}
				walletFilter={paymentStore.walletFilter}
				walletOptions={paymentStore.walletOptions}
				onSearch={paymentStore.setSearch}
				onTypeChange={paymentStore.setTypeFilter}
				onWalletChange={paymentStore.setWalletFilter}
				onCreate={paymentStore.openCreate}
				onExport={handleExport}
			/>

			<PaymentSummaryStrip
				summary={paymentStore.summary}
				directionFilter={paymentStore.directionFilter}
				onToggle={paymentStore.setDirectionFilter}
			/>

			<PaymentsTable
				rows={paymentStore.filteredPayments}
				isFiltering={isFiltering}
				onOpen={(payment) => navigate(`/payments/${payment.id}`)}
			/>

			<PaymentCreateModal
				isOpen={paymentStore.isCreateOpen}
				isSaving={paymentStore.isSaving}
				formData={paymentStore.formData}
				outstanding={paymentStore.outstanding}
				onLoadOutstanding={paymentStore.loadOutstanding}
				onSave={handleCreate}
				onClose={paymentStore.closeCreate}
			/>
		</Box>
	);
});

export default PaymentPage;
