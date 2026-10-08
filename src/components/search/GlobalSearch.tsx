import React from "react";
import { useTranslation } from "react-i18next";
import Kbd from "components/shared/Keyboard/Kbd";
import { useGlobalSearchHotkey } from "hooks/search/useGlobalSearchHotkey";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens, iconSize, radius } from "theme";

import SearchIcon from "@mui/icons-material/Search";
import { Box, ButtonBase, Typography } from "@mui/material";

import GlobalSearchDialog from "./GlobalSearchDialog";

/**
 * The topbar search: a field-looking button with the «Ctrl K» hint (the
 * audience is on Windows — never «⌘K») that opens the search palette; Ctrl+K
 * opens it from anywhere. Below `md` it shrinks to the icon.
 */
const GlobalSearch: React.FC = observer(() => {
	const { t } = useTranslation();
	const { searchStore } = useStore();
	useGlobalSearchHotkey(searchStore.open);

	return (
		<>
			<ButtonBase
				onClick={searchStore.open}
				aria-label={t("search.open")}
				aria-haspopup="dialog"
				aria-keyshortcuts="Control+K"
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: { xs: "center", md: "flex-start" },
					gap: 1.125,
					width: { xs: 38, md: 300 },
					height: 38,
					flexShrink: 0,
					px: { xs: 0, md: 1.625 },
					bgcolor: "background.paper",
					border: 1,
					borderColor: designTokens.borderControl,
					borderRadius: `${radius.md}px`,
					color: "text.disabled",
					fontFamily: "inherit",
					"&:hover": { borderColor: "text.primary" },
				}}
			>
				<SearchIcon sx={{ fontSize: iconSize.md, color: "text.secondary" }} />
				<Typography
					noWrap
					sx={{
						display: { xs: "none", md: "block" },
						flex: 1,
						textAlign: "left",
						fontSize: 13,
						color: "inherit",
					}}
				>
					{t("topbar.search.placeholder")}
				</Typography>
				<Box sx={{ display: { xs: "none", md: "inline-flex" }, gap: "3px" }}>
					<Kbd>Ctrl</Kbd>
					<Kbd>K</Kbd>
				</Box>
			</ButtonBase>
			<GlobalSearchDialog />
		</>
	);
});

export default GlobalSearch;
