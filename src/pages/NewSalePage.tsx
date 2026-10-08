import React from "react";
import { useTranslation } from "react-i18next";
import NewTransactionEntry from "components/transaction/Create/NewTransactionEntry";
import { useDocumentTitle } from "hooks/shared/useDocumentTitle";

/** Redesigned full-page POS New Sale at `/sales/new` (see NewTransactionEntry). */
const NewSalePage: React.FC = () => {
	const { t } = useTranslation();
	useDocumentTitle(t("transaction.new.title.Sale"));
	return <NewTransactionEntry direction="Sale" />;
};

export default NewSalePage;
