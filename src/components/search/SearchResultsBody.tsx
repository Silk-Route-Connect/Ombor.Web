import React from "react";
import { useTranslation } from "react-i18next";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { isReady } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

import SearchResultGroups from "./SearchResultGroups";

/**
 * What the palette shows under the field: what can be searched (nothing typed
 * yet), a spinner, the error with «Повторить», «Ничего не найдено», or the
 * grouped results.
 */
const SearchResultsBody: React.FC = observer(() => {
	const { t } = useTranslation();
	const { searchStore } = useStore();
	const { results } = searchStore;

	if (results === null) {
		return (
			<TableEmptyState
				icon={<ManageSearchOutlinedIcon />}
				title={t("search.start.title")}
				hint={t("search.start.hint")}
			/>
		);
	}
	if (!isReady(results)) {
		return (
			<LoadStateView
				state={results}
				size="section"
				onRetry={searchStore.searchNow}
				errorTitle={t("search.error")}
			/>
		);
	}
	if (searchStore.options.length === 0) {
		return (
			<TableEmptyState
				icon={<SearchOffOutlinedIcon />}
				title={t("search.empty.title")}
				hint={t("search.empty.hint", { query: results.query })}
			/>
		);
	}
	return (
		<SearchResultGroups
			results={results}
			options={searchStore.options}
			activeIndex={searchStore.activeIndex}
			onHover={searchStore.setActive}
			onOpened={searchStore.close}
		/>
	);
});

export default SearchResultsBody;
