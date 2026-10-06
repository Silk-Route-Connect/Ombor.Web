import React from "react";

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
	// A list search grows with the room its row leaves (up to 420px) so a long
	// hint such as «Поиск по названию, артикулу или штрих-коду…» is never cut.
	const widthSx = sx ?? {
		width: { xs: "100%", sm: dense ? 280 : "auto" },
		...(!dense && { flex: { sm: "1 1 340px" }, minWidth: { sm: 260 }, maxWidth: { sm: 420 } }),
	};
	return (
		<TextField
			className={className}
			variant="outlined"
			size="small"
			sx={{
				"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
				...widthSx,
			}}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			slotProps={{
				// A hint the box cuts short still reads in full on hover.
				htmlInput: { title: placeholder },
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
						</InputAdornment>
					),
				},
			}}
		/>
	);
};
