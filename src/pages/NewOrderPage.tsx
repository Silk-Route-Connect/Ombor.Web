import React from "react";
import { useTranslation } from "react-i18next";
import NewOrder from "components/order/Create/NewOrder";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";

/** Redesigned full-page New Order entry at `/orders/new` (see NewOrder). */
const NewOrderPage: React.FC = () => {
	const { t } = useTranslation();
	useDocumentTitle(t("order.new.title"));
	return <NewOrder />;
};

export default NewOrderPage;
