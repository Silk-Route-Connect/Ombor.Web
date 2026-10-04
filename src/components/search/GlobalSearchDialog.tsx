import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Kbd from "components/shared/Keyboard/Kbd";
import KeyHint from "components/shared/Keyboard/KeyHint";
import { observer } from "mobx-react-lite";
import { SEARCH_MAX_LENGTH } from "stores/SearchStore";
import { useStore } from "stores/StoreContext";
import { dialogPaperSx } from "theme";

import SearchIcon from "@mui/icons-material/Search";
import { Box, Dialog, InputBase, LinearProgress } from "@mui/material";

import { SEARCH_DIALOG_ID, SEARCH_LISTBOX_ID, searchOptionDomId } from "./searchGroupMeta";
import SearchResultsBody from "./SearchResultsBody";

/**
 * The global search palette: one field over everything the business has —
 * partners, products, documents, employees, warehouses, wallets. ↑ / ↓ move
 * through the results, Enter opens the highlighted one, Esc closes. The field
 * is an ARIA combobox over the results listbox; focus never leaves it.
 */
const GlobalSearchDialog: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { searchStore } = useStore();
	const active = searchStore.activeOption;

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			searchStore.moveActive(e.key === "ArrowDown" ? 1 : -1);
			const next = searchStore.activeOption;
			if (next) {
				document.getElementById(searchOptionDomId(next.key))?.scrollIntoView({ block: "nearest" });
			}
			return;
		}
		if (e.key !== "Enter") {
			return;
		}
		e.preventDefault();
		const path = searchStore.pickActive();
		if (path) {
			navigate(path);
		}
	};

	return (
		<Dialog
			open={searchStore.isOpen}
			onClose={searchStore.close}
			slotProps={{
				paper: {
					id: SEARCH_DIALOG_ID,
					"aria-label": t("search.inputLabel"),
					sx: { ...dialogPaperSx("md"), alignSelf: "flex-start", mt: "10vh", overflow: "hidden" },
				},
			}}
		>
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
					autoFocus
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
			<Box sx={{ height: 2, flex: "0 0 auto" }}>
				{searchStore.isRefreshing && <LinearProgress sx={{ height: 2 }} />}
			</Box>
			<Box sx={{ flex: "1 1 auto", minHeight: 0, maxHeight: "60vh", overflowY: "auto" }}>
				<SearchResultsBody />
			</Box>
			<Box
				sx={{
					display: { xs: "none", sm: "flex" },
					alignItems: "center",
					gap: 2,
					px: 2.25,
					py: 1.25,
					borderTop: 1,
					borderColor: "divider",
					flex: "0 0 auto",
				}}
			>
				<KeyHint keys={["↑", "↓"]} label={t("search.kbd.move")} />
				<KeyHint keys={["Enter"]} label={t("search.kbd.open")} />
				<KeyHint keys={["Esc"]} label={t("search.kbd.close")} />
			</Box>
		</Dialog>
	);
});

export default GlobalSearchDialog;
