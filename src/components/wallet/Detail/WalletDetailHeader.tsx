import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { WalletTypeBadge } from "components/wallet/WalletPresentation";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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

interface WalletDetailHeaderProps {
	wallet: Wallet;
	onBack: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
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
 * Wallet detail header per the bundle: «Касса › name» breadcrumb, bordered back
 * chevron, title with the type + archive badges, the «Начальный остаток · создана»
 * meta row, and either the ⋮ actions menu (edit / archive) or a primary
 * «Восстановить» when archived (locked pattern 2).
 */
export const WalletDetailHeader: React.FC<WalletDetailHeaderProps> = ({
	wallet,
	onBack,
	onEdit,
	onArchive,
	onRestore,
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
					{t("wallet.title")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{wallet.name}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "20px",
					mb: "22px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
					<ButtonBase
						onClick={onBack}
						aria-label={t("wallet.detail.back")}
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
						<Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
							<Typography
								component="h1"
								sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}
							>
								{wallet.name}
							</Typography>
							<WalletTypeBadge type={wallet.type} />
							{wallet.isArchived && <ArchivedBadge />}
						</Box>
						<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "6px" }}>
							{t("wallet.detail.openingLabel")}{" "}
							<Box component="span" sx={numericSx}>
								{formatCurrency(wallet.openingBalance)}
							</Box>{" "}
							UZS · {t("wallet.detail.createdLabel")} {formatDate(wallet.createdAt)} ·{" "}
							{wallet.createdBy}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
					{wallet.isArchived ? (
						<PrimaryButton icon={<UnarchiveOutlinedIcon />} onClick={onRestore}>
							{t("common.restore")}
						</PrimaryButton>
					) : (
						<DetailActionsMenu onEdit={onEdit} onArchive={onArchive} />
					)}
				</Box>
			</Box>
		</>
	);
};

export default WalletDetailHeader;
