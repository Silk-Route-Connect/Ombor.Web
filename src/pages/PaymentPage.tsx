import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import PaymentCreateModal from "components/payment/Form/PaymentCreateModal";
import PaymentHeader from "components/payment/Header/PaymentHeader";
import PaymentDirectionCards from "components/payment/List/PaymentDirectionCards";
import PaymentListTotals from "components/payment/List/PaymentListTotals";
import { PAYMENT_TYPE_META } from "components/payment/PaymentPresentation";
import { PaymentsTable } from "components/payment/Table/PaymentsTable";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { isLoading, isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { CreatePaymentRecordRequest, PaymentRecord } from "models/payment";
import { isOpenCreateState } from "routing/navigationState";
import { PATHS, paymentDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { isDateRangeActive } from "utils/dateRange";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatOptionalNumber } from "utils/formatEntityId";

import { Box } from "@mui/material";

const PaymentPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const location = useLocation();
	const { paymentStore } = useStore();
	const tableOrder = useTableOrder<PaymentRecord>();

	useEffect(() => {
		paymentStore.getAll();
	}, [paymentStore]);

	// Arrived from the topbar «Создать → Оплата»: open the real create modal, then
	// drop the state so a reload or back-navigation does not reopen it.
	useEffect(() => {
		if (isOpenCreateState(location.state)) {
			paymentStore.openCreate();
			navigate(PATHS.payments, { replace: true, state: null });
		}
	}, [location.state, navigate, paymentStore]);

	// Load reference data lazily when the create modal opens (refetched after a
	// create, since advances / outstanding / wallet balances moved).
	useEffect(() => {
		if (paymentStore.isCreateOpen && isLoading(paymentStore.formData)) {
			paymentStore.getFormData();
		}
	}, [paymentStore.isCreateOpen, paymentStore.formData, paymentStore]);

	const handleCreate = (request: CreatePaymentRecordRequest): void => {
		void paymentStore.create(request);
	};

	const handleExport = (): void => {
		const rows = readyOr(paymentStore.filteredPayments, []);
		const columns: CsvColumn<PaymentRecord>[] = [
			{
				header: t("payment.table.number"),
				value: (p) => formatOptionalNumber(p.number, t("common.noNumber")),
			},
			{ header: t("payment.table.date"), value: (p) => formatDate(p.date) },
			{ header: t("payment.table.party"), value: (p) => p.partnerName ?? p.employeeName ?? "" },
			{ header: t("payment.table.type"), value: (p) => t(PAYMENT_TYPE_META[p.type].labelKey) },
			{
				header: t("payment.table.direction"),
				value: (p) =>
					p.direction === "Income" ? t("payment.direction.income") : t("payment.direction.expense"),
			},
			{ header: t("payment.table.wallet"), value: (p) => p.walletName },
			{ header: t("payment.table.amount"), value: (p) => p.amount },
		];
		exportToCsv(`payments_${csvDateStamp()}`, columns, tableOrder.apply(rows));
	};

	const isFiltering =
		paymentStore.searchTerm.trim().length > 0 ||
		paymentStore.typeFilter !== "all" ||
		paymentStore.walletFilter !== "all" ||
		paymentStore.directionFilter !== "all" ||
		isDateRangeActive(paymentStore.dateRange);

	return (
		<Box>
			<PaymentHeader
				summary={
					<PaymentDirectionCards
						counts={isReady(paymentStore.filteredPayments) ? paymentStore.directionCounts : null}
						value={paymentStore.directionFilter}
						onChange={paymentStore.setDirectionFilter}
					/>
				}
				searchValue={paymentStore.searchTerm}
				typeFilter={paymentStore.typeFilter}
				walletFilter={paymentStore.walletFilter}
				walletOptions={paymentStore.walletOptions}
				dateRange={paymentStore.dateRange}
				onSearch={paymentStore.setSearch}
				onTypeChange={paymentStore.setTypeFilter}
				onWalletChange={paymentStore.setWalletFilter}
				onDateRangeChange={paymentStore.setDateRange}
				onCreate={paymentStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(paymentStore.filteredPayments, []).length}
			/>

			<PaymentsTable
				exportOrder={tableOrder}
				rows={paymentStore.filteredPayments}
				onRetry={paymentStore.getAll}
				errorTitle={t("payment.error.getAll")}
				isFiltering={isFiltering}
				onOpen={(payment) => navigate(paymentDetailPath(payment.id))}
				summary={
					isReady(paymentStore.filteredPayments) && (
						<PaymentListTotals rows={paymentStore.filteredPayments} />
					)
				}
			/>

			<PaymentCreateModal
				isOpen={paymentStore.isCreateOpen}
				isSaving={paymentStore.isSaving}
				formData={paymentStore.formData}
				outstanding={paymentStore.outstanding}
				onLoadOutstanding={paymentStore.loadOutstanding}
				onRetryFormData={paymentStore.getFormData}
				onSave={handleCreate}
				onClose={paymentStore.closeCreate}
			/>
		</Box>
	);
});

export default PaymentPage;
