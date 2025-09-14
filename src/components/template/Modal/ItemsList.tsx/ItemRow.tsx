import React from "react";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";

import DeleteIcon from "@mui/icons-material/Delete";
import { Grid, IconButton, TextField } from "@mui/material";

import { TemplateFormItemPayload } from "./ItemsList";

interface ItemRowProps {
	item: TemplateFormItemPayload;
	index: number;
	unitPriceRefs: React.RefObject<(HTMLInputElement | null)[]>;
	productAutocompleteRef: React.RefObject<HTMLInputElement | null>;
	onUpdate: (payload: Partial<TemplateFormItemPayload>) => void;
	onRemove: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
	item,
	index,
	unitPriceRefs,
	productAutocompleteRef,
	onUpdate,
	onRemove,
}) => {
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			productAutocompleteRef.current?.focus();
		}
	};

	return (
		<Grid container columnSpacing={1} alignItems="center">
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
					label={translate("transaction.line.unitPrice")}
					value={item.unitPrice}
					size="small"
					inputRef={(el) => (unitPriceRefs.current[index] = el)}
					onChange={(e) => onUpdate({ unitPrice: +e.target.value })}
					onKeyDown={handleKeyDown}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 2 }}>
				<NumericField
					label={translate("transaction.line.quantity")}
					value={item.quantity}
					size="small"
					onChange={(e) => onUpdate({ quantity: +e.target.value })}
					onKeyDown={handleKeyDown}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 2 }}>
				<NumericField
					label={translate("transaction.line.discount")}
					value={item.discount ?? 0}
					size="small"
					onChange={(e) => onUpdate({ discount: +e.target.value })}
					onKeyDown={handleKeyDown}
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
