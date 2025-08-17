import React, { SyntheticEvent, useCallback } from "react";
import { Autocomplete, AutocompleteProps, FilterOptionsState, TextField } from "@mui/material";
import { translate } from "i18n/i18n";

export type AutocompleteSize = "small" | "medium";

type RestMuiProps<T extends EntityWithIdName> = Omit<
	AutocompleteProps<T, false, false, false>,
	"options" | "value" | "onChange"
>;

export interface EntityWithIdName {
	id: number;
	name: string;
}

export interface EntityAutocompleteProps<T extends EntityWithIdName> {
	label: string;
	placeholder: string;
	options: T[];
	value: T | null;
	size?: AutocompleteSize;
	inputRef?: React.Ref<HTMLInputElement>;
	required?: boolean;
	error?: boolean;
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
	size = "medium",
	loading = false,
	disabled = false,
	required = false,
	error = false,
	inputRef,
	onChange,
	additionalFilter,
	onKeyDown,
	...rest
}: EntityAutocompleteProps<T> & Partial<RestMuiProps<T>>) {
	const filter = useCallback(
		(opts: T[], { inputValue }: FilterOptionsState<T>) => {
			const txt = inputValue.trim().toLowerCase();
			if (!txt) return opts;
			return opts.filter(
				(e) =>
					e.name.toLowerCase().includes(txt) ||
					(additionalFilter ? additionalFilter(e, txt) : false),
			);
		},
		[additionalFilter],
	);

	const handleChange = useCallback(
		(_event: SyntheticEvent<Element, Event>, value: T | null) => onChange(value),
		[onChange],
	);

	return (
		<Autocomplete<T, false, false, false>
			options={options}
			loading={loading}
			disabled={disabled}
			getOptionLabel={(o) => o.name}
			isOptionEqualToValue={(o, v) => o.id === v.id}
			size={size}
			filterOptions={filter}
			onKeyDown={onKeyDown}
			value={value}
			onChange={handleChange}
			renderOption={(props, option) => {
				const { key, ...rest } = props;
				return (
					<li key={key} {...rest}>
						{option.name}
					</li>
				);
			}}
			noOptionsText={translate("noOptionsTitle")}
			renderInput={(params) => (
				<TextField
					inputRef={inputRef}
					{...params}
					label={label}
					placeholder={placeholder}
					fullWidth
					required={required}
					error={error}
				/>
			)}
			{...rest}
		/>
	);
}

export default EntityAutocomplete;
