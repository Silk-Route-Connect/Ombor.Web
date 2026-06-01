// Warehouse card — Bukhara Teal redesign (cards replace the table list).
import React from "react";
import { translate } from "i18n/i18n";
import { Warehouse } from "models/warehouse";
import { formatMoney } from "utils/formatCurrency";
import { getWarehouseStats } from "utils/warehouseStats";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RestoreIcon from "@mui/icons-material/Restore";
import {
	Box,
	Chip,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Tooltip,
	Typography,
} from "@mui/material";

interface WarehouseCardProps {
	warehouse: Warehouse;
	archived?: boolean;
	onOpen: (warehouse: Warehouse) => void;
	onEdit: (warehouse: Warehouse) => void;
	onArchive: (warehouse: Warehouse) => void;
	onRestore: (warehouse: Warehouse) => void;
	onDelete: (warehouse: Warehouse) => void;
}

const Stat: React.FC<{ caption: string; children: React.ReactNode; withDivider?: boolean }> = ({
	caption,
	children,
	withDivider,
}) => (
	<Box sx={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}>
		{withDivider && <Divider orientation="vertical" flexItem sx={{ mr: 2 }} />}
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				{caption}
			</Typography>
			<Typography
				sx={{
					fontSize: "1.125rem",
					fontWeight: 700,
					letterSpacing: "-0.01em",
					mt: 0.5,
					fontVariantNumeric: "tabular-nums",
				}}
			>
				{children}
			</Typography>
		</Box>
	</Box>
);

const WarehouseCard: React.FC<WarehouseCardProps> = ({
	warehouse,
	archived = false,
	onOpen,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
}) => {
	const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
	const stats = getWarehouseStats(warehouse);

	const openMenu = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchor(e.currentTarget);
	};
	const closeMenu = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		setAnchor(null);
	};
	const run = (action: () => void) => (e: React.MouseEvent) => {
		e.stopPropagation();
		setAnchor(null);
		action();
	};

	return (
		<Paper
			elevation={1}
			onClick={() => onOpen(warehouse)}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: 1.5,
				p: 2.5,
				cursor: "pointer",
				position: "relative",
				transition: "box-shadow .15s, border-color .15s, transform .15s",
				opacity: archived ? 0.7 : 1,
				bgcolor: archived ? "grey.50" : "background.paper",
				"&:hover": {
					boxShadow: 2,
					borderColor: "grey.300",
					transform: archived ? "none" : "translateY(-1px)",
					opacity: archived ? 0.9 : 1,
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: 1.5,
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Typography
							component="span"
							sx={{
								fontSize: "1.0625rem",
								fontWeight: 700,
								letterSpacing: "-0.01em",
								color: archived ? "text.secondary" : "primary.main",
								"&:hover": { textDecoration: archived ? "none" : "underline" },
							}}
						>
							{warehouse.name}
						</Typography>
						{archived && (
							<Chip
								label={translate("warehouse.card.archivedBadge")}
								size="small"
								sx={{
									height: 18,
									bgcolor: "grey.100",
									color: "text.secondary",
									"& .MuiChip-label": { px: 0.75, fontSize: "0.625rem", fontWeight: 700 },
								}}
							/>
						)}
					</Box>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.75,
							mt: 0.75,
							color: warehouse.location ? "text.secondary" : "text.disabled",
							fontStyle: warehouse.location ? "normal" : "italic",
						}}
					>
						<LocationOnOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
						<Typography variant="body2" noWrap>
							{warehouse.location || translate("warehouse.card.noAddress")}
						</Typography>
					</Box>
				</Box>

				<IconButton size="small" onClick={openMenu} sx={{ color: "text.secondary" }}>
					<MoreVertIcon fontSize="small" />
				</IconButton>
				<Menu
					anchorEl={anchor}
					open={Boolean(anchor)}
					onClose={closeMenu}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					{archived
						? [
								<MenuItem key="restore" onClick={run(() => onRestore(warehouse))}>
									<ListItemIcon>
										<RestoreIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText>{translate("warehouse.menu.restore")}</ListItemText>
								</MenuItem>,
								<MenuItem
									key="delete"
									onClick={run(() => onDelete(warehouse))}
									sx={{ color: "error.main" }}
								>
									<ListItemIcon>
										<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
									</ListItemIcon>
									<ListItemText>{translate("warehouse.menu.delete")}</ListItemText>
								</MenuItem>,
							]
						: [
								<MenuItem key="edit" onClick={run(() => onEdit(warehouse))}>
									<ListItemIcon>
										<EditOutlinedIcon fontSize="small" />
									</ListItemIcon>
									<ListItemText>{translate("warehouse.menu.edit")}</ListItemText>
								</MenuItem>,
								<MenuItem
									key="archive"
									onClick={run(() => onArchive(warehouse))}
									sx={{ color: "secondary.dark" }}
								>
									<ListItemIcon>
										<ArchiveOutlinedIcon fontSize="small" sx={{ color: "secondary.dark" }} />
									</ListItemIcon>
									<ListItemText>{translate("warehouse.menu.archive")}</ListItemText>
								</MenuItem>,
							]}
				</Menu>
			</Box>

			<Box
				sx={{
					display: "flex",
					mt: 2.25,
					pt: 2,
					borderTop: 1,
					borderColor: "divider",
				}}
			>
				<Stat caption={translate("warehouse.card.products")}>{stats.products}</Stat>
				<Stat caption={translate("warehouse.card.units")} withDivider>
					{formatMoney(stats.units)}
				</Stat>
				<Stat caption={translate("warehouse.card.value")} withDivider>
					{stats.value === null ? (
						<Tooltip title={translate("warehouse.card.valueUnavailableTooltip")} arrow>
							<Box component="span" sx={{ color: "text.disabled" }}>
								—
							</Box>
						</Tooltip>
					) : (
						<>
							{formatMoney(stats.value)}
							<Typography
								component="span"
								sx={{ ml: 0.5, fontSize: "0.6875rem", fontWeight: 600, color: "text.disabled" }}
							>
								UZS
							</Typography>
						</>
					)}
				</Stat>
			</Box>
		</Paper>
	);
};

export default WarehouseCard;
