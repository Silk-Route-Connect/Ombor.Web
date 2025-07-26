import { Typography } from "@mui/material";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";

import ConfirmDialog from "components/shared/ConfirmDialog";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import EmployeeFormModal, { EmployeeFormPayload } from "components/employee/Form/EmployeeFormModal";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeeSidePane from "components/employee/SidePane/EmployeeSidePane";
import { employeeColumns } from "components/employee/employeeTableConfigs";

import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { useStore } from "stores/StoreContext";

const EmployeePage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const { employeeStore } = useStore();

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore, employeeStore.searchTerm]);

	const rows = useMemo<Loadable<Employee[]>>(
		() => employeeStore.filteredEmployees,
		[employeeStore.filteredEmployees],
	);

	const handleCreate = useCallback(() => {
		setSelectedEmployee(null);
		setIsFormOpen(true);
	}, []);

	const handleEdit = useCallback((e: Employee) => {
		setSelectedEmployee(e);
		setIsFormOpen(true);
	}, []);

	const handleDelete = useCallback((e: Employee) => {
		setSelectedEmployee(e);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirmDelete = () => {
		if (selectedEmployee) {
			employeeStore.deleteEmployee(selectedEmployee.id);
		}
		setIsDeleteDialogOpen(false);
		setSelectedEmployee(null);
	};

	const handleSave = (payload: EmployeeFormPayload) => {
		if (selectedEmployee) {
			employeeStore.updateEmployee({
				...payload,
				id: selectedEmployee.id,
			});
		} else {
			employeeStore.createEmployee({ ...payload });
		}
		setIsFormOpen(false);
		setSelectedEmployee(null);
	};

	const handleRowClick = useCallback((e: Employee) => {
		employeeStore.setSelectedEmployee(e.id);
		setSelectedEmployee(e);
		setIsSidePanelOpen(true);
	}, []);

	const handleSidePanelClose = () => {
		setSelectedEmployee(null);
		setIsSidePanelOpen(false);
	};

	const columns = useMemo<Column<Employee>[]>(
		() => [
			...employeeColumns,
			{
				key: "actions",
				headerName: "",
				width: 80,
				align: "right",
				renderCell: (employee: Employee) => (
					<ActionMenuCell
						onEdit={() => handleEdit(employee)}
						onArchive={() => {}}
						onDelete={() => handleDelete(employee)}
					/>
				),
			},
		],
		[handleEdit, handleDelete],
	);

	const getConfirmationContent = (): JSX.Element => {
		if (!selectedEmployee) {
			return <Typography>{translate("employee.confirmDeleteTitle")}</Typography>;
		}

		return (
			<Typography>
				{translate("employee.ConfirmDeleteTitle")} <strong>{selectedEmployee.fullName}</strong>?
			</Typography>
		);
	};

	return (
		<>
			<EmployeeHeader
				searchValue={employeeStore.searchTerm}
				onSearch={(value) => employeeStore.setSearch(value)}
				onCreate={handleCreate}
			/>

			<DataTable<Employee>
				rows={rows}
				columns={columns}
				pagination
				onRowClick={(emp) => handleRowClick(emp)}
			/>

			<EmployeeFormModal
				key={selectedEmployee?.id ?? "new"}
				isOpen={isFormOpen}
				employee={selectedEmployee}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedEmployee(null);
				}}
				onSave={handleSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("employee.deleteTitle")}
				content={getConfirmationContent()}
				confirmLabel={translate("delete")}
				cancelLabel={translate("cancel")}
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
			/>

			<EmployeeSidePane
				open={isSidePanelOpen}
				employee={selectedEmployee}
				onClose={handleSidePanelClose}
			/>
		</>
	);
});

export default EmployeePage;
