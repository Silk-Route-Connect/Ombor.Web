import React from "react";
import { Box, CircularProgress, Grid } from "@mui/material";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";

import { TransactionFormLinePayload } from "../TransactionFormModal";
import { LineRow } from "./LineRow";

interface LineListProps {
	data: Loadable<TransactionFormLinePayload[]>;
	onUpdate: (index: number, payload: Partial<TransactionFormLinePayload>) => void;
	onRemove: (index: number) => void;
}

export const LineList: React.FC<LineListProps> = ({ data, onUpdate, onRemove }) => {
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
			{data.map((line, index) => (
				<LineRow
					key={`${line.productId}-${index}`}
					line={line}
					onUpdate={(payload) => onUpdate(index, payload)}
					onRemove={() => onRemove(index)}
				/>
			))}
		</Grid>
	);
};
