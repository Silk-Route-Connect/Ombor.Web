import React, { useCallback, useMemo, useRef } from "react";
import { FieldError } from "react-hook-form";
import { Button, Grid } from "@mui/material";
import { translate } from "i18n/i18n";
import { nanoid } from "nanoid";
import { MAX_PHONES_COUNT } from "schemas/PartnerSchema";

import { PhoneRow, PhoneRowField } from "./PhoneRow";

interface PhoneListFieldProps {
	disabled: boolean;
	values: string[];
	errors: (FieldError | undefined)[];
	onChange: (values: string[]) => void;
	onBlur: () => void;
}

const toRows = (values: string[], prev?: PhoneRowField[]): PhoneRowField[] =>
	values.map((v, i) => ({
		id: prev?.[i]?.id ?? nanoid(),
		value: v,
	}));

const PhoneListField: React.FC<PhoneListFieldProps> = ({
	disabled,
	values,
	errors,
	onChange,
	onBlur,
}) => {
	const prevRowsRef = useRef<PhoneRowField[]>([]);

	const rows = useMemo(() => {
		const phoneRows = toRows(values, prevRowsRef.current);
		prevRowsRef.current = phoneRows;
		return phoneRows;
	}, [values]);

	const handleAdd = () => onChange([...values, ""]);

	const handleUpdate = useCallback(
		(id: string, value: string) => {
			const updated = rows.map((el) => (el.id === id ? value : el.value));
			onChange([...updated]);
		},
		[values, onChange],
	);

	const handleRemove = (id: string) => {
		const updated = rows.filter((el) => el.id !== id).map((el) => el.value);
		onChange(updated.length ? [...updated] : [""]);
	};

	const addDisabled =
		disabled || rows.length >= MAX_PHONES_COUNT || rows.some((r) => r.value.trim() === "");

	return (
		<Grid container spacing={2}>
			{rows.map((row, idx) => (
				<PhoneRow
					key={row.id}
					row={row}
					disabled={disabled}
					canDelete={!disabled && rows.length > 1}
					error={errors[idx]?.message}
					onChange={handleUpdate}
					onRemove={handleRemove}
					onBlur={onBlur}
				/>
			))}

			<Grid size={{ xs: 12 }}>
				<Button size="small" onClick={handleAdd} disabled={addDisabled}>
					{translate("partner.addPhoneNumber")}
				</Button>
			</Grid>
		</Grid>
	);
};

export default PhoneListField;
