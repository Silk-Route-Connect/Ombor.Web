import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import EntityAutocomplete, { AutocompleteSize } from "components/shared/Autocomplete/Autocomplete";
import { observer } from "mobx-react-lite";
import type { Employee } from "models/employee";
import { useStore } from "stores/StoreContext";

interface EmployeeAutocompleteProps {
	value: Employee | null;
	size?: AutocompleteSize;
	required?: boolean;
	error?: boolean;
	helperText?: React.ReactNode;
	onChange(value: Employee | null): void;
}

const EmployeeAutocomplete: React.FC<EmployeeAutocompleteProps> = ({
	value,
	size,
	required,
	error,
	helperText,
	onChange,
}) => {
	const { t } = useTranslation();
	const { employeeStore } = useStore();

	const options = useMemo(() => {
		if (employeeStore.allEmployees === "loading") {
			return [];
		}
		return employeeStore.allEmployees;
	}, [employeeStore.allEmployees]);

	const loading = employeeStore.allEmployees === "loading";

	return (
		<EntityAutocomplete<Employee>
			label={t("employeeAutocomplete.employee")}
			placeholder={t("employeeAutocomplete.search")}
			options={options}
			value={value}
			size={size}
			required={required}
			error={error}
			helperText={helperText}
			onChange={onChange}
			loading={loading}
			disabled={loading}
			isOptionEqualToValue={(opt, val) => opt.id === val.id}
			additionalFilter={(employee, text) =>
				employee.position.toLowerCase().includes(text) ||
				employee.contactInfo?.phoneNumbers.some((phone) => phone.includes(text)) ||
				false
			}
		/>
	);
};

export default observer(EmployeeAutocomplete);
