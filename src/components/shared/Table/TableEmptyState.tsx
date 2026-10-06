import React from "react";
import StateMessage from "components/shared/LoadState/StateMessage";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";

import AddIcon from "@mui/icons-material/Add";

export interface TableEmptyAction {
	label: string;
	onClick: () => void;
}

/** Which empty copy an archivable list shows (pattern 13 «Активные | Архив»). */
export type ArchiveListEmptyKind = "filtering" | "empty" | "allArchived";

export const archiveListEmptyKind = (state: {
	isFiltering: boolean;
	hasAny: boolean;
	hasActive: boolean;
	showArchived: boolean;
}): ArchiveListEmptyKind => {
	if (state.isFiltering) return "filtering";
	if (!state.hasAny) return "empty";
	return !state.hasActive && !state.showArchived ? "allArchived" : "filtering";
};

interface TableEmptyStateProps {
	/** Module glyph shown in the icon tile. */
	icon: React.ReactNode;
	title: string;
	/** One plain line: why it is empty / what to do next. */
	hint?: string;
	/** First-run call to action («Добавить товар»); omit for filtered-empty. */
	action?: TableEmptyAction;
}

/**
 * The one empty state for every table — list pages (inside the DataTable card
 * via its `empty` slot) and detail tabs (inside the tab's card). Same tile,
 * title, hint and CTA as the load states, so «nothing here» and «failed to load»
 * read as one family.
 */
export const TableEmptyState: React.FC<TableEmptyStateProps> = ({ icon, title, hint, action }) => (
	<StateMessage
		size="section"
		icon={icon}
		title={title}
		body={hint}
		action={
			action && (
				<PrimaryButton icon={<AddIcon />} onClick={action.onClick}>
					{action.label}
				</PrimaryButton>
			)
		}
	/>
);

export default TableEmptyState;
