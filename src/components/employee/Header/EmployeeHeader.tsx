import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { EmployeeStatus } from "models/employee";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

type StatusFilter = EmployeeStatus | "all";

interface EmployeeHeaderProps {
	searchValue: string;
	selectedStatus: EmployeeStatus | null;
	onSearch: (value: string) => void;
	onStatusChange: (value: EmployeeStatus | null) => void;
	onCreate: () => void;
	onExport: () => void;
}

/**
 * Employees page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») on the title row; the view-shaping search + status segmented filter
 * on the filter row below.
 */
const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
	searchValue,
	selectedStatus,
	onSearch,
	onStatusChange,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const statusOptions: { value: StatusFilter; label: string }[] = [
		{ value: "all", label: t("employee.filter.all") },
		{ value: "Active", label: t("employee.status.Active") },
		{ value: "OnVacation", label: t("employee.status.OnVacation") },
		{ value: "Terminated", label: t("employee.status.Terminated") },
	];

	return (
		<>
			<PageHeader
				title={t("employeesTitle")}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("common.export")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("employee.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("searchEmployeesPlaceholder")}
					sx={{ width: { xs: "100%", sm: 320 } }}
				/>
				<SegmentedControl<StatusFilter>
					value={selectedStatus ?? "all"}
					onChange={(v) => onStatusChange(v === "all" ? null : v)}
					options={statusOptions}
				/>
			</Box>
		</>
	);
};

export default EmployeeHeader;
