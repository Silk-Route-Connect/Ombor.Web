import React from "react";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";

import LinesTable, { LinesTableHandle } from "./LinesTable";

interface Props {
	form: TransactionFormType;
	mode: "Sale" | "Supply";
	linesRef: React.RefObject<LinesTableHandle | null>;
	onReturnFocus: () => void;
}

const LinesSection: React.FC<Props> = ({ form, mode, linesRef, onReturnFocus }) => (
	<LinesTable
		ref={linesRef}
		mode={mode}
		rows={form.lines}
		onUpdate={form.updateLine}
		onRemove={form.removeLine}
		onReturnFocus={onReturnFocus}
	/>
);

export default LinesSection;
