import React from "react";
import NewTransactionEntry from "components/transaction/Create/NewTransactionEntry";

/** Redesigned full-page POS New Supply at `/supplies/new` (see NewTransactionEntry). */
const NewSupplyPage: React.FC = () => <NewTransactionEntry direction="Supply" />;

export default NewSupplyPage;
