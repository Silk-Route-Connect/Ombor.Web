import React from "react";
import { FieldError } from "react-hook-form";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Grid, IconButton, TextField } from "@mui/material";
import { translate } from "i18n/i18n";

export interface PhoneListInputProps {
	values: string[];
	errors: (FieldError | undefined)[];
	onChange: (v: string[]) => void;
	onBlur: () => void;
}

const PhoneListField: React.FC<PhoneListInputProps> = ({ values, errors, onChange, onBlur }) => {
	const valuesToRender = values.length ? values : [""];

	const update = (i: number, v: string) => {
		const next = [...values];
		next[i] = v;
		onChange(next);
	};

	const add = () => onChange([...values, ""]);

	const remove = (i: number) => {
		const next = values.filter((_, idx) => idx !== i);
		onChange(next.length ? next : [""]);
	};

	return (
		<Grid container spacing={2}>
			{valuesToRender.map((phone, idx) => (
				<Grid size={{ xs: 12 }} key={idx}>
					<Box
						sx={{
							position: "relative",
							display: "flex",
							alignItems: "center",
							"&:hover .delBtn, &:focus-within .delBtn": {
								visibility: values.length > 1 ? "visible" : "hidden",
							},
						}}
					>
						<TextField
							label={translate("phoneNumber")}
							value={phone}
							onChange={(e) => update(idx, e.target.value)}
							onBlur={onBlur}
							fullWidth
							error={!!errors[idx]?.message}
							helperText={errors[idx]?.message ?? undefined}
						/>
						{values.length > 1 && (
							<IconButton
								className="delBtn"
								aria-label={translate("remove")}
								size="small"
								color="error"
								onClick={() => remove(idx)}
								sx={{ position: "absolute", right: 0, visibility: "hidden" }}
							>
								<DeleteIcon />
							</IconButton>
						)}
					</Box>
				</Grid>
			))}

			<Grid size={{ xs: 12 }}>
				<Button
					size="small"
					onClick={add}
					disabled={values.length >= 5 || values.some((v) => v.trim() === "")}
				>
					{translate("addPhoneNumber")}
				</Button>
			</Grid>
		</Grid>
	);
};

export default PhoneListField;
