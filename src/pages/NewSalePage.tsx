import React from "react";
import NewTransactionEntry from "components/transaction/Create/NewTransactionEntry";

/** Redesigned full-page POS New Sale at `/sales/new` (see NewTransactionEntry). */
const NewSalePage: React.FC = () => <NewTransactionEntry direction="Sale" />;

export default NewSalePage;
