import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { DebtAgeBucket, DebtDirectionFilter, DebtTab } from "stores/DebtStore";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { Box, ButtonBase, ListItemText, Menu, MenuItem } from "@mui/material";

interface DebtFiltersProps {
	tab: DebtTab;
	searchTerm: string;
	ageBucket: DebtAgeBucket;
	directionFilter: DebtDirectionFilter;
	onlyOverdue: boolean;
	onSearch: (v: string) => void;
	onAgeChange: (v: DebtAgeBucket) => void;
	onDirectionChange: (v: DebtDirectionFilter) => void;
	onClearOverdue: () => void;
}

function Dropdown<T extends string>({
	icon,
	prefix,
	value,
	options,
	onChange,
}: {
	icon: React.ReactNode;
	prefix: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const active = value !== options[0]?.value;
	const current = options.find((o) => o.value === value) ?? options[0];
	return (
		<>
			<ButtonBase
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "7px",
					height: 40,
					px: "13px",
					borderRadius: "8px",
					border: "1px solid",
					borderColor: active ? designTokens.primaryLine : designTokens.gray300,
					bgcolor: active ? designTokens.primarySoft : "background.paper",
					fontSize: 13.5,
					fontWeight: 600,
					fontFamily: "inherit",
					color: active ? "primary.main" : designTokens.gray700,
					whiteSpace: "nowrap",
				}}
			>
				<Box sx={{ display: "inline-flex", color: active ? "primary.main" : "text.disabled" }}>
					{icon}
				</Box>
				{prefix}: {current?.label}
				<KeyboardArrowDownIcon sx={{ fontSize: 16, opacity: 0.6 }} />
			</ButtonBase>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				slotProps={{ paper: { sx: { minWidth: 190, mt: "4px" } } }}
			>
				{options.map((o) => (
					<MenuItem
						key={o.value}
						selected={o.value === value}
						onClick={() => {
							onChange(o.value);
							setAnchor(null);
						}}
					>
						<ListItemText primary={o.label} />
						{o.value === value && (
							<CheckIcon sx={{ fontSize: 16, color: "primary.main", ml: 1.5 }} />
						)}
					</MenuItem>
				))}
			</Menu>
		</>
	);
}

/**
 * Shared debt filter toolbar. Search is leftmost (established pattern); the
 * direction segmented appears only on the transactions tab (column headers own
 * the sorting there). The prototype's date-range picker is omitted (locked
 * pattern 12).
 */
export const DebtFilters: React.FC<DebtFiltersProps> = ({
	tab,
	searchTerm,
	ageBucket,
	directionFilter,
	onlyOverdue,
	onSearch,
	onAgeChange,
	onDirectionChange,
	onClearOverdue,
}) => {
	const { t } = useTranslation();

	const ageOptions: { value: DebtAgeBucket; label: string }[] = [
		{ value: "all", label: t("debt.age.all") },
		{ value: "0-7", label: t("debt.age.0-7") },
		{ value: "8-30", label: t("debt.age.8-30") },
		{ value: "31-60", label: t("debt.age.31-60") },
		{ value: "60+", label: t("debt.age.60+") },
	];

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px", flexWrap: "wrap" }}>
			<SearchInput
				value={searchTerm}
				onChange={onSearch}
				placeholder={t("debt.searchPlaceholder")}
				sx={{ width: { xs: "100%", sm: 300 } }}
			/>

			{tab === "transactions" && (
				<SegmentedControl
					value={directionFilter}
					onChange={onDirectionChange}
					options={[
						{ value: "all", label: t("debt.direction.all") },
						{ value: "Receivable", label: t("debt.direction.receivable") },
						{ value: "Payable", label: t("debt.direction.payable") },
					]}
				/>
			)}

			<Dropdown
				icon={<ScheduleOutlinedIcon sx={{ fontSize: 15 }} />}
				prefix={t("debt.age.prefix")}
				value={ageBucket}
				options={ageOptions}
				onChange={onAgeChange}
			/>

			{onlyOverdue && (
				<ButtonBase
					onClick={onClearOverdue}
					sx={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						height: 40,
						px: "13px",
						borderRadius: "8px",
						border: "1px solid",
						borderColor: designTokens.primaryLine,
						bgcolor: designTokens.primarySoft,
						fontSize: 13.5,
						fontWeight: 600,
						color: "primary.main",
					}}
				>
					<ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />
					{t("debt.onlyOverdue")}
					<CloseIcon sx={{ fontSize: 14 }} />
				</ButtonBase>
			)}
		</Box>
	);
};

export default DebtFilters;
