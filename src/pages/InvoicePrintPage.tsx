import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import InvoiceSheet from "components/shared/Print/InvoiceSheet";
import PrintLayout from "components/shared/Print/PrintLayout";
import PrintOrganizationGate from "components/shared/Print/PrintOrganizationGate";
import { isPresent } from "helpers/Loading";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { orderDetailPath, PATHS, saleDetailPath, supplyDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { InvoiceSource, invoiceTitle } from "utils/invoiceDocument";

const LIST_PATH: Record<InvoiceSource, string> = {
	Sale: PATHS.sales,
	Supply: PATHS.supplies,
	Order: PATHS.orders,
};

const DETAIL_PATH: Record<InvoiceSource, (id: number) => string> = {
	Sale: saleDetailPath,
	Supply: supplyDetailPath,
	Order: orderDetailPath,
};

/** The printable «Накладная» of a sale / supply / refund (`/sales|supplies/:id/print`) or order (`/orders/:id/print`). */
const InvoicePrintPage: React.FC<{ source: InvoiceSource }> = observer(({ source }) => {
	const { t } = useTranslation();
	const id = useRouteEntityId();
	const { invoicePrintStore } = useStore();

	useEffect(() => {
		if (id !== null) {
			void invoicePrintStore.load(source, id);
		}
		return () => invoicePrintStore.clear();
	}, [id, source, invoicePrintStore]);

	const invoice = id === null ? null : invoicePrintStore.invoice;
	if (id === null || !isPresent(invoice)) {
		return (
			<LoadStateView
				state={isPresent(invoice) ? null : invoice}
				onRetry={() => id !== null && void invoicePrintStore.load(source, id)}
				errorTitle={t("print.error.invoice")}
				notFound={{ title: t("print.invoice.notFound"), backTo: LIST_PATH[source] }}
			/>
		);
	}

	return (
		<PrintOrganizationGate>
			{(organization) => (
				<PrintLayout title={invoiceTitle(t, invoice)} backTo={DETAIL_PATH[source](id)}>
					<InvoiceSheet doc={invoice} organization={organization} />
				</PrintLayout>
			)}
		</PrintOrganizationGate>
	);
});

export default InvoicePrintPage;
