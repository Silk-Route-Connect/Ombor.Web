import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";
import { formatUzNational, uzPhoneToStored } from "utils/phoneUtils";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box, Grid, IconButton, InputAdornment, TextField } from "@mui/material";

import UzPhonePrefix from "./UzPhonePrefix";

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
					value={formatUzNational(row.value)}
					disabled={disabled}
					error={!!error}
					helperText={error}
					placeholder="90 123 45 67"
					onChange={(e) => onChange(row.id, uzPhoneToStored(e.target.value))}
					onBlur={onBlur}
					slotProps={{
						input: {
							inputMode: "numeric",
							startAdornment: <UzPhonePrefix />,
							endAdornment: canDelete ? (
								<InputAdornment position="end">
									<IconButton
										aria-label={t("remove")}
										size="small"
										onClick={() => onRemove(row.id)}
										disabled={disabled}
										edge="end"
										// The neutral remove glyph of every line editor; red only on hover.
										sx={{
											color: designTokens.fg3,
											"&:hover": { color: "error.main", bgcolor: designTokens.errorBg },
										}}
									>
										<DeleteOutlineIcon sx={{ fontSize: 18 }} />
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
