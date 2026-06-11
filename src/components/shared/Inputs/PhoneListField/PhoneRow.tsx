import React from "react";
import { useTranslation } from "react-i18next";

import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Grid, IconButton, InputAdornment, TextField } from "@mui/material";

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
					label={t("phoneNumber")}
					type="tel"
					fullWidth
					value={row.value}
					disabled={disabled}
					error={!!error}
					helperText={error}
					onChange={(e) => onChange(row.id, e.target.value)}
					onBlur={onBlur}
					slotProps={{
						input: {
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
