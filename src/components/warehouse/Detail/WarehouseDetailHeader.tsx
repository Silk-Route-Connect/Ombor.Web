import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/product/ArchivedBadge";
import GhostButton from "components/shared/Buttons/GhostButton";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Warehouse } from "models/warehouse";
import { designTokens, numericSx } from "theme";

import AddIcon from "@mui/icons-material/Add";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import {
	Box,
	ButtonBase,
	IconButton,
	Link,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";

interface WarehouseDetailHeaderProps {
	warehouse: Warehouse;
	onBack: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onOpeningStock: () => void;
}

/** Bordered ⋮ trigger + entity actions (locked pattern 2). */
const DetailActionsMenu: React.FC<{ onEdit: () => void; onArchive: () => void }> = ({
	onEdit,
	onArchive,
}) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);

	return (
		<>
			<IconButton
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-label="actions"
				sx={{
					width: 38,
					height: 38,
					borderRadius: "8px",
					border: "1px solid",
					borderColor: designTokens.gray300,
					color: designTokens.gray600,
				}}
			>
				<MoreVertIcon sx={{ fontSize: 20 }} />
			</IconButton>
			<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
				<MenuItem
					onClick={() => {
						close();
						onEdit();
					}}
				>
					<ListItemIcon>
						<EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
					</ListItemIcon>
					<ListItemText primary={t("common.edit")} />
				</MenuItem>
				<MenuItem
					onClick={() => {
						close();
						onArchive();
					}}
				>
					<ListItemIcon>
						<ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />
					</ListItemIcon>
					<ListItemText
						primary={t("common.archive")}
						slotProps={{ primary: { sx: { color: designTokens.saffron700 } } }}
					/>
				</MenuItem>
			</Menu>
		</>
	);
};

/**
 * Detail header per the bundle: «Склады › name» breadcrumb, bordered back
 * chevron, 24px title with the address meta row, and either the «Начальный
 * остаток» child-event button + ⋮ actions menu, or a primary «Восстановить» when
 * archived (locked pattern 2 — entity actions live in the ⋮ menu; standalone
 * buttons are reserved for child-event creation).
 */
export const WarehouseDetailHeader: React.FC<WarehouseDetailHeaderProps> = ({
	warehouse,
	onBack,
	onEdit,
	onArchive,
	onRestore,
	onOpeningStock,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					mb: "16px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Link
					component="button"
					underline="hover"
					onClick={onBack}
					sx={{ color: "text.secondary", fontSize: 13 }}
				>
					{t("warehouse.title")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{warehouse.name}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "20px",
					mb: "20px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
					<ButtonBase
						onClick={onBack}
						aria-label={t("warehouse.detail.back")}
						sx={{
							width: 40,
							height: 40,
							flex: "0 0 auto",
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							bgcolor: "background.paper",
							color: designTokens.gray700,
							"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
						}}
					>
						<ChevronLeftIcon sx={{ fontSize: 20 }} />
					</ButtonBase>

					<Box sx={{ minWidth: 0 }}>
						<Typography
							component="h1"
							sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}
						>
							{warehouse.name}
						</Typography>
						<Box sx={{ display: "flex", alignItems: "center", gap: "10px", mt: "8px" }}>
							{warehouse.location && (
								<Box
									component="span"
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "7px",
										fontSize: 13.5,
										color: "text.secondary",
										...numericSx,
									}}
								>
									<PlaceOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
									{warehouse.location}
								</Box>
							)}
							{warehouse.isArchived && <ArchivedBadge />}
						</Box>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
					{warehouse.isArchived ? (
						<PrimaryButton icon={<UnarchiveOutlinedIcon />} onClick={onRestore}>
							{t("common.restore")}
						</PrimaryButton>
					) : (
						<>
							<GhostButton
								icon={<AddIcon sx={{ fontSize: "18px !important" }} />}
								onClick={onOpeningStock}
							>
								{t("warehouse.opening.action")}
							</GhostButton>
							<DetailActionsMenu onEdit={onEdit} onArchive={onArchive} />
						</>
					)}
				</Box>
			</Box>
		</>
	);
};

export default WarehouseDetailHeader;
