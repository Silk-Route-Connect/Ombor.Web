import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, IconButton, TextField } from "@mui/material";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";

import { TemplateFormItemPayload } from "../TemplateFormModal";

interface ItemRowProps {
	key: string;
	item: TemplateFormItemPayload;

	onUpdate: (payload: Partial<TemplateFormItemPayload>) => void;
	onRemove: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({ item, key, onUpdate, onRemove }) => {
	return (
		<Grid container key={key} columnSpacing={1} alignItems="center">
			<Grid size={{ xs: 12, sm: 4 }}>
				<TextField
					value={item.productName}
					fullWidth
					aria-readonly
					size="small"
					label={translate("product.name")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<NumericField
					value={item.unitPrice}
					size="small"
					onChange={(e) => onUpdate({ unitPrice: +e.target.value })}
					label={translate("transaction.line.unitPrice")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 2 }}>
				<NumericField
					size="small"
					value={item.discount ?? 0}
					onChange={(e) => onUpdate({ discount: +e.target.value })}
					label={translate("transaction.line.discount")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 2 }}>
				<NumericField
					size="small"
					value={item.quantity}
					onChange={(e) => onUpdate({ quantity: +e.target.value })}
					label={translate("transaction.line.quantity")}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 1 }}>
				<IconButton color="error" onClick={onRemove} aria-label={translate("actionDelete")}>
					<DeleteIcon />
				</IconButton>
			</Grid>
		</Grid>
	);
};
