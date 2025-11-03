import React, { useCallback, useMemo, useRef } from "react";
import { FieldError } from "react-hook-form";
import { PhoneRow, PhoneRowField } from "components/shared/Inputs/PhoneListField/PhoneRow";
import { translate } from "i18n/i18n";
import { nanoid } from "nanoid";

import { Button, Grid } from "@mui/material";

interface PhoneListFieldProps {
	disabled: boolean;
	values: string[];
	errors: (FieldError | undefined)[];
	maxCount?: number;
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
	maxCount = 5,
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
		[rows, onChange],
	);

	const handleRemove = (id: string) => {
		const updated = rows.filter((el) => el.id !== id).map((el) => el.value);
		onChange(updated.length ? [...updated] : [""]);
	};

	const addDisabled =
		disabled || rows.length >= maxCount || rows.some((r) => r.value.trim() === "");

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
					{translate("addPhoneNumber")}
				</Button>
			</Grid>
		</Grid>
	);
};

export default PhoneListField;
