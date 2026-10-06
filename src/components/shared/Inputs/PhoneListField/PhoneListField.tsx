import React, { useCallback, useMemo, useRef, useState } from "react";
import { FieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PhoneRow, PhoneRowField } from "components/shared/Inputs/PhoneListField/PhoneRow";
import { nanoid } from "nanoid";

import { Button, Grid, Typography } from "@mui/material";

interface PhoneListFieldProps {
	disabled: boolean;
	values: string[];
	errors: (FieldError | undefined)[];
	/** An error about the list as a whole (e.g. «at least one phone»), under the rows. */
	listError?: string;
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
	listError,
	maxCount = 5,
	onChange,
	onBlur,
}) => {
	const { t } = useTranslation();
	const prevRowsRef = useRef<PhoneRowField[]>([]);
	// Why «Добавить номер» did nothing — the button stays enabled (hard rule 5).
	const [addHint, setAddHint] = useState<string | null>(null);

	const rows = useMemo(() => {
		const phoneRows = toRows(values, prevRowsRef.current);
		prevRowsRef.current = phoneRows;
		return phoneRows;
	}, [values]);

	const handleAdd = () => {
		if (rows.length >= maxCount) {
			setAddHint(t("common.phone.maxReached", { count: maxCount }));
			return;
		}
		if (rows.some((r) => r.value.trim() === "")) {
			setAddHint(t("common.phone.fillEmptyFirst"));
			return;
		}
		setAddHint(null);
		onChange([...values, ""]);
	};

	const handleUpdate = useCallback(
		(id: string, value: string) => {
			setAddHint(null);
			const updated = rows.map((el) => (el.id === id ? value : el.value));
			onChange([...updated]);
		},
		[rows, onChange],
	);

	const handleRemove = (id: string) => {
		setAddHint(null);
		const updated = rows.filter((el) => el.id !== id).map((el) => el.value);
		onChange(updated.length ? [...updated] : [""]);
	};

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
				{listError && (
					<Typography sx={{ fontSize: 12, color: "error.main", mb: "4px" }}>{listError}</Typography>
				)}
				<Button size="small" onClick={handleAdd} disabled={disabled}>
					{t("addPhoneNumber")}
				</Button>
				{addHint && (
					<Typography role="status" sx={{ fontSize: 12, color: "text.secondary", mt: "4px" }}>
						{addHint}
					</Typography>
				)}
			</Grid>
		</Grid>
	);
};

export default PhoneListField;
