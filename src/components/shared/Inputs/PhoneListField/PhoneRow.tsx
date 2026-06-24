import React from "react";
import { useTranslation } from "react-i18next";
import { UZ_COUNTRY_PREFIX, uzNationalPart, uzPhoneToStored } from "utils/phoneUtils";

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

export type PhoneRowField = {
	id: string;
	value: string;
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
					value={uzNationalPart(row.value)}
					disabled={disabled}
					error={!!error}
					helperText={error}
					placeholder="90 123 45 67"
					onChange={(e) => onChange(row.id, uzPhoneToStored(e.target.value))}
					onBlur={onBlur}
					slotProps={{
						input: {
							inputMode: "numeric",
							startAdornment: (
								<InputAdornment position="start">
									<Typography sx={{ color: "text.secondary", fontWeight: 600 }}>
										{UZ_COUNTRY_PREFIX}
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
