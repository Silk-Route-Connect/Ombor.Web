import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export interface EntityWithIdName {
	id: number;
	name: string;
}

export interface EntityAutocompleteProps<T extends EntityWithIdName> {
	label: string;
	placeholder: string;
	options: T[];
	value: T | null;
	onChange(value: T | null): void;
	additionalFilter?(entity: T, text: string): boolean;
	onKeyDown?: (
		event: React.KeyboardEvent<HTMLDivElement> & {
			defaultMuiPrevented?: boolean;
		},
	) => void;
}

function EntityAutocomplete<T extends EntityWithIdName>({
	label,
	placeholder,
	options,
	value,
	onChange,
	additionalFilter,
	onKeyDown,
}: Readonly<EntityAutocompleteProps<T>>) {
	return (
		<Autocomplete<T, false, false, false>
			options={options}
			getOptionLabel={(o) => o.name}
			isOptionEqualToValue={(o, v) => o.id === v.id}
			filterOptions={(opts, { inputValue }) => {
				const txt = inputValue.trim().toLowerCase();
				if (!txt) return opts;
				return opts.filter(
					(e) =>
						e.name.toLowerCase().includes(txt) ||
						(additionalFilter ? additionalFilter(e, txt) : false),
				);
			}}
			onKeyDown={onKeyDown}
			value={value}
			onChange={(_, v) => onChange(v)}
			renderOption={(props, option) => (
				<li {...props} key={option.id}>
					{option.name}
				</li>
			)}
			renderInput={(params) => (
				<TextField {...params} label={label} placeholder={placeholder} fullWidth />
			)}
		/>
	);
}

export default EntityAutocomplete;
