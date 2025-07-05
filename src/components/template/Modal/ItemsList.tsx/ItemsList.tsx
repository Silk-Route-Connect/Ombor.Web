import React from "react";
import { Box, CircularProgress, Grid } from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";

import { TemplateFormItemPayload } from "../TemplateFormModal";
import { ItemRow } from "./ItemRow";

interface ItemsListProps {
	data: Loadable<TemplateFormItemPayload[]>;
	onUpdate: (index: number, payload: Partial<TemplateFormItemPayload>) => void;
	onRemove: (index: number) => void;
}

export const ItemsList: React.FC<ItemsListProps> = ({ data, onUpdate, onRemove }) => {
	if (data === "loading") {
		return (
			<Box>
				<CircularProgress />
			</Box>
		);
	}

	if (data.length === 0) {
		return <Box color="text.secondary">{translate("transaction.noLines")}</Box>;
	}

	return (
		<Grid container rowSpacing={2}>
			{data.map((item, index) => (
				<ItemRow
					key={`${item.productId}-${index}`}
					item={item}
					onUpdate={(payload) => onUpdate(index, payload)}
					onRemove={() => onRemove(index)}
				/>
			))}
		</Grid>
	);
};
