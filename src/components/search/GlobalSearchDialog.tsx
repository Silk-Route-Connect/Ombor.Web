import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import KeyHint from "components/shared/Keyboard/KeyHint";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { dialogPaperSx } from "theme";

import { Box, Dialog, LinearProgress } from "@mui/material";

import SearchField from "./SearchField";
import { SEARCH_DIALOG_ID, searchOptionDomId } from "./searchGroupMeta";
import SearchResultsBody from "./SearchResultsBody";

/**
 * The global search palette: one field over everything the business has —
 * partners, products, documents, employees, warehouses, wallets. ↑ / ↓ move
 * through the results, Enter opens the highlighted one, Esc closes; focus never
 * leaves the field.
 */
const GlobalSearchDialog: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { searchStore } = useStore();

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
			<SearchField onKeyDown={onKeyDown} />
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
				<KeyHint keys={["↑", "↓"]} either label={t("search.kbd.move")} />
				<KeyHint keys={["Enter"]} label={t("search.kbd.open")} />
				<KeyHint keys={["Esc"]} label={t("search.kbd.close")} />
			</Box>
		</Dialog>
	);
});

export default GlobalSearchDialog;
