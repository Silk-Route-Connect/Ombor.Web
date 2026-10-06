import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Kbd from "components/shared/Keyboard/Kbd";
import { observer } from "mobx-react-lite";
import { SEARCH_MAX_LENGTH } from "stores/SearchStore";
import { useStore } from "stores/StoreContext";

import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase } from "@mui/material";

import { SEARCH_LISTBOX_ID, searchOptionDomId } from "./searchGroupMeta";

interface SearchFieldProps {
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * The palette's field: an ARIA combobox over the results listbox. Focused from
 * an effect, not `autoFocus`: when StrictMode re-runs the dialog's effects on
 * mount, its focus trap hands focus back to the opener and then to its own
 * container, dropping an `autoFocus` made earlier in the commit. A child's
 * effect re-runs before the trap's, so the caret stays in the field.
 */
const SearchField: React.FC<SearchFieldProps> = observer(({ onKeyDown }) => {
	const { t } = useTranslation();
	const { searchStore } = useStore();
	const inputRef = useRef<HTMLInputElement>(null);
	const active = searchStore.activeOption;

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1.5,
				px: 2.25,
				height: 56,
				borderBottom: 1,
				borderColor: "divider",
				flex: "0 0 auto",
			}}
		>
			<SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
			<InputBase
				inputRef={inputRef}
				fullWidth
				value={searchStore.query}
				onChange={(e) => searchStore.setQuery(e.target.value)}
				onFocus={(e) => e.target.select()}
				onKeyDown={onKeyDown}
				placeholder={t("search.placeholder")}
				inputProps={{
					role: "combobox",
					"aria-label": t("search.inputLabel"),
					"aria-autocomplete": "list",
					"aria-expanded": searchStore.options.length > 0,
					"aria-controls": SEARCH_LISTBOX_ID,
					"aria-activedescendant": active ? searchOptionDomId(active.key) : undefined,
					maxLength: SEARCH_MAX_LENGTH,
					autoComplete: "off",
					spellCheck: false,
				}}
				sx={{ fontSize: 15 }}
			/>
			<Kbd>Esc</Kbd>
		</Box>
	);
});

export default SearchField;
