import React from "react";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";

import LinesTable, { LinesTableHandle } from "./LinesTable";

interface Props {
	form: TransactionFormType;
	linesRef: React.RefObject<LinesTableHandle | null>;
	onReturnFocus: () => void;
}

const LinesSection: React.FC<Props> = ({ form, linesRef, onReturnFocus }) => (
	<LinesTable
		ref={linesRef}
		rows={form.lines}
		onUpdate={form.updateLine}
		onRemove={form.removeLine}
		onReturnFocus={onReturnFocus}
	/>
);

export default LinesSection;
