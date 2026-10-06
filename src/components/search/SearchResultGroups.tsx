import React from "react";
import { useTranslation } from "react-i18next";
import { SEARCH_GROUP_KEYS, SearchResults } from "models/search";
import { numericSx } from "theme";
import { SearchOption } from "utils/globalSearch";

import { Box, Typography } from "@mui/material";

import { SEARCH_LISTBOX_ID } from "./searchGroupMeta";
import SearchResultRow from "./SearchResultRow";

interface SearchResultGroupsProps {
	results: SearchResults;
	options: SearchOption[];
	activeIndex: number;
	onHover: (index: number) => void;
	onOpened: () => void;
}

/**
 * The results listbox: Партнёры, Товары, Документы, Сотрудники, Склады, Кассы —
 * each heading says how many of its matches are shown when the server found
 * more («5 из 736»), so the user knows to type more.
 */
const SearchResultGroups: React.FC<SearchResultGroupsProps> = ({
	results,
	options,
	activeIndex,
	onHover,
	onOpened,
}) => {
	const { t } = useTranslation();

	return (
		<Box id={SEARCH_LISTBOX_ID} role="listbox" aria-label={t("search.inputLabel")} sx={{ py: 1 }}>
			{SEARCH_GROUP_KEYS.map((group) => {
				const rows = options
					.map((option, index) => ({ option, index }))
					.filter(({ option }) => option.group === group);
				if (rows.length === 0) {
					return null;
				}
				const { total } = results[group];
				const headingId = `${SEARCH_LISTBOX_ID}-${group}`;
				return (
					<Box key={group} role="group" aria-labelledby={headingId} sx={{ pb: 0.5 }}>
						<Box
							sx={{
								display: "flex",
								alignItems: "baseline",
								justifyContent: "space-between",
								gap: 1,
								px: 2.25,
								pt: 1,
								pb: 0.5,
							}}
						>
							<Typography
								id={headingId}
								sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}
							>
								{t(`search.group.${group}`)}
							</Typography>
							{total > rows.length && (
								<Typography sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }}>
									{t("search.shownOf", { shown: rows.length, total })}
								</Typography>
							)}
						</Box>
						{rows.map(({ option, index }) => (
							<SearchResultRow
								key={option.key}
								option={option}
								active={index === activeIndex}
								onHover={() => onHover(index)}
								onOpened={onOpened}
							/>
						))}
					</Box>
				);
			})}
		</Box>
	);
};

export default SearchResultGroups;
