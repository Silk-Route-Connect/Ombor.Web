import React from "react";
import { designTokens } from "theme";

import SearchIcon from "@mui/icons-material/Search";
import { SxProps } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

export interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	className?: string;
	sx?: SxProps;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder,
	className = "",
	sx = { width: { xs: "100%", sm: 350 } },
}) => {
	return (
		<TextField
			className={className}
			variant="outlined"
			size="small"
			sx={{
				// Bundle .search-box: surface bg with the strong border.
				"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
				"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
				...sx,
			}}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon />
						</InputAdornment>
					),
				},
			}}
		/>
	);
};
