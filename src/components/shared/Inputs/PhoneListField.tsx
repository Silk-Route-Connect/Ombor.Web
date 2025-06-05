import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Grid, IconButton, TextField } from "@mui/material";

export interface PhoneListInputProps {
	values: string[];
	onChange: (newValues: string[]) => void;
}

const PhoneListField: React.FC<PhoneListInputProps> = ({ values, onChange }) => {
	const updatePhoneAt = (index: number, val: string) => {
		const copy = [...values];
		copy[index] = val;
		onChange(copy);
	};

	const addPhoneField = () => onChange([...values, ""]);

	const removePhoneField = (index: number) => {
		const copy = values.filter((_, i) => i !== index);
		onChange(copy.length ? copy : [""]);
	};

	return (
		<Grid container spacing={2}>
			{values.map((phone, idx) => (
				<Grid key={`${phone}-${idx}`} size={{ xs: 12 }}>
					<Box
						sx={{
							position: "relative",
							display: "flex",
							alignItems: "center",
							"&:hover .delBtn": {
								visibility: values.length > 1 ? "visible" : "hidden",
							},
							"&:focus-within .delBtn": {
								visibility: values.length > 1 ? "visible" : "hidden",
							},
						}}
					>
						<TextField
							label="Phone"
							value={phone}
							onChange={(e) => updatePhoneAt(idx, e.target.value)}
							fullWidth
							sx={{
								pr: values.length > 1 ? { "&:hover": 5, "&:focus-within": 5 } : 0,
								transition: "padding-right 0.2s",
							}}
						/>
						{values.length > 1 && (
							<IconButton
								className="delBtn"
								aria-label="Remove phone"
								size="small"
								color="error"
								onClick={() => removePhoneField(idx)}
								sx={{
									position: "absolute",
									right: 0,
									visibility: "hidden",
								}}
							>
								<DeleteIcon />
							</IconButton>
						)}
					</Box>
				</Grid>
			))}
			<Grid size={{ xs: 12 }}>
				<Button size="small" onClick={addPhoneField}>
					Add Phone
				</Button>
			</Grid>
		</Grid>
	);
};

export default PhoneListField;
