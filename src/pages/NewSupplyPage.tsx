import React from "react";
import { useTranslation } from "react-i18next";
import NewTransactionEntry from "components/transaction/Create/NewTransactionEntry";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";

/** Redesigned full-page POS New Supply at `/supplies/new` (see NewTransactionEntry). */
const NewSupplyPage: React.FC = () => {
	const { t } = useTranslation();
	useDocumentTitle(t("transaction.new.title.Supply"));
	return <NewTransactionEntry direction="Supply" />;
};

export default NewSupplyPage;
