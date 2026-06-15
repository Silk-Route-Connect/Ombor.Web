import React from "react";
import { useTranslation } from "react-i18next";

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

export type PhoneRowField = {
	id: string;
	value: string;
};

/** Fixed country code — the app is Uzbekistan-only, so every number is +998. */
const COUNTRY_PREFIX = "+998";
/** Uzbek national numbers are 9 digits after the country code (e.g. 90 123 45 67). */
const LOCAL_MAX = 9;

/** Strip the stored value down to the editable national part (digits after +998). */
const toLocal = (value: string): string => {
	const digits = value.replace(/\D/g, "");
	const national = digits.startsWith("998") ? digits.slice(3) : digits;
	return national.slice(0, LOCAL_MAX);
};

/**
 * Rebuild the stored value from the typed national digits. Kept empty when the
 * user clears the field so the entry is treated as blank (and filtered out),
 * rather than persisting a bare «+998».
 */
const toStored = (input: string): string => {
	const national = input.replace(/\D/g, "").slice(0, LOCAL_MAX);
	return national === "" ? "" : COUNTRY_PREFIX + national;
};

interface PhoneRowProps {
	row: PhoneRowField;
	disabled: boolean;
	canDelete: boolean;
	error?: string;
	onChange: (id: string, value: string) => void;
	onRemove: (id: string) => void;
	onBlur: () => void;
}

export const PhoneRow: React.FC<PhoneRowProps> = ({
	row,
	disabled,
	canDelete,
	error,
	onChange,
	onRemove,
	onBlur,
}) => {
	const { t } = useTranslation();

	return (
		<Grid size={{ xs: 12 }}>
			<Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
				<TextField
					id={`phone-${row.id}`}
					type="tel"
					size="small"
					fullWidth
					value={toLocal(row.value)}
					disabled={disabled}
					error={!!error}
					helperText={error}
					placeholder="90 123 45 67"
					onChange={(e) => onChange(row.id, toStored(e.target.value))}
					onBlur={onBlur}
					slotProps={{
						input: {
							inputMode: "numeric",
							startAdornment: (
								<InputAdornment position="start">
									<Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
										{COUNTRY_PREFIX}
									</Typography>
								</InputAdornment>
							),
							endAdornment: canDelete ? (
								<InputAdornment position="end">
									<IconButton
										aria-label={t("remove")}
										size="small"
										color="error"
										onClick={() => onRemove(row.id)}
										disabled={disabled}
										edge="end"
									>
										<DeleteIcon />
									</IconButton>
								</InputAdornment>
							) : undefined,
						},
					}}
				/>
			</Box>
		</Grid>
	);
};
