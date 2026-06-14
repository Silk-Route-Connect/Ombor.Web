import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Partner } from "models/partner";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

interface PartnerActionsMenuProps {
	partner: Partner;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
	/** Bordered trigger for the detail header; plain icon for table rows. */
	bordered?: boolean;
}

/**
 * Entity actions menu (locked pattern 2): Edit · Archive/Restore · Delete in a ⋮
 * menu. Delete is reference-gated by the caller (confirm vs «cannot delete»).
 */
export const PartnerActionsMenu: React.FC<PartnerActionsMenuProps> = ({
	partner,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
	bordered = false,
}) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);
	const run = (fn: () => void) => () => {
		close();
		fn();
	};

	return (
		<>
			<IconButton
				onClick={(e) => {
					e.stopPropagation();
					setAnchor(e.currentTarget);
				}}
				aria-label="actions"
				sx={
					bordered
						? {
								width: 38,
								height: 38,
								borderRadius: "8px",
								border: "1px solid",
								borderColor: designTokens.gray300,
								color: designTokens.gray600,
							}
						: { color: designTokens.gray600 }
				}
			>
				<MoreVertIcon sx={{ fontSize: 20 }} />
			</IconButton>
			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={close}
				onClick={(e) => e.stopPropagation()}
			>
				<MenuItem onClick={run(onEdit)}>
					<ListItemIcon>
						<EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
					</ListItemIcon>
					<ListItemText primary={t("common.edit")} />
				</MenuItem>

				{partner.isArchived ? (
					<MenuItem onClick={run(onRestore)}>
						<ListItemIcon>
							<UnarchiveOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />
						</ListItemIcon>
						<ListItemText
							primary={t("common.restore")}
							slotProps={{ primary: { sx: { color: "success.main" } } }}
						/>
					</MenuItem>
				) : (
					<MenuItem onClick={run(onArchive)}>
						<ListItemIcon>
							<ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />
						</ListItemIcon>
						<ListItemText
							primary={t("common.archive")}
							slotProps={{ primary: { sx: { color: designTokens.saffron700 } } }}
						/>
					</MenuItem>
				)}

				<MenuItem onClick={run(onDelete)}>
					<ListItemIcon>
						<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
					</ListItemIcon>
					<ListItemText
						primary={t("common.delete")}
						slotProps={{ primary: { sx: { color: "error.main" } } }}
					/>
				</MenuItem>
			</Menu>
		</>
	);
};

export default PartnerActionsMenu;
