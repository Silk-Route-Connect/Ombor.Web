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
	/**
	 * Compact width (sm:280) for in-card table toolbars that share a bordered band
	 * with filters/export, where the standard sm:350 would wrap. Page-level toolbars
	 * omit it and get the standard width. Ignored when an explicit `sx` is passed.
	 */
	dense?: boolean;
	sx?: SxProps;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder,
	className = "",
	dense = false,
	sx,
}) => {
	const widthSx = sx ?? { width: { xs: "100%", sm: dense ? 280 : 350 } };
	return (
		<TextField
			className={className}
			variant="outlined"
			size="small"
			sx={{
				// Bundle .search-box: surface bg with the strong border.
				"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
				"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
				...widthSx,
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
