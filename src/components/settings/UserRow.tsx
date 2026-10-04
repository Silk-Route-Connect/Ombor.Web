import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { TenantUser } from "models/settings";
import { designTokens } from "theme";
import { formatDate } from "utils/dateUtils";
import { displayContact, isUnnamed, tenantUserLabel } from "utils/tenantUser";

import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";

interface UserRowProps {
	user: TenantUser;
	last: boolean;
	onDeactivate: (user: TenantUser) => void;
	onReactivate: (user: TenantUser) => void;
}

const actionSx = (hoverBg: string, hoverColor: string) =>
	({
		width: 34,
		height: 34,
		flex: "0 0 auto",
		borderRadius: "8px",
		color: "text.disabled",
		transition: "background .14s, color .14s",
		"&:hover": { bgcolor: hoverBg, color: hoverColor },
	}) as const;

/** One user in Settings → Пользователи: who, role, status, last activity and the on / off switch. */
const UserRow: React.FC<UserRowProps> = ({ user, last, onDeactivate, onReactivate }) => {
	const { t } = useTranslation();
	const unnamed = isUnnamed(user);
	const label = tenantUserLabel(user);

	const activity = (): { text: string; online: boolean } => {
		if (!user.active) {
			return {
				text: user.lastActiveAt
					? t("settings.users.deactivatedSince", { date: formatDate(user.lastActiveAt) })
					: t("settings.users.deactivated"),
				online: false,
			};
		}
		if (user.online) {
			return { text: t("settings.users.onlineNow"), online: true };
		}
		// An active user with no recorded activity reads as «Активен» — the backend
		// returns active:true with no separate pending/invite status, so we never
		// mislabel a registered account (e.g. the owner) as «Приглашён» (F-005).
		return {
			text: user.lastActiveAt ? formatDate(user.lastActiveAt) : t("settings.users.active"),
			online: false,
		};
	};
	const la = activity();
	const actionLabel = t(
		user.active ? "settings.users.deactivateUser" : "settings.users.reactivateUser",
		{ name: label },
	);

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "14px",
				py: "14px",
				borderBottom: last ? "none" : "1px solid",
				borderColor: designTokens.gray25,
			}}
		>
			<EntityAvatar name={unnamed ? "" : user.name} size={38} muted={!user.active} />
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<Typography
						sx={{
							fontSize: 14,
							fontWeight: 600,
							color: user.active ? "text.primary" : "text.disabled",
						}}
					>
						{label}
					</Typography>
					{user.self && <StatusPill token="teal" uppercase label={t("settings.users.you")} />}
				</Box>
				{!unnamed && (
					<Typography
						sx={{
							fontSize: 13,
							mt: "2px",
							color: user.active ? "text.secondary" : "text.disabled",
						}}
					>
						{displayContact(user.contact)}
					</Typography>
				)}
			</Box>

			<StatusPill token={user.active ? "teal" : "neutral"} label={t("settings.users.admin")} />
			{!user.active && <StatusPill token="neutral" label={t("settings.users.deactivated")} />}

			<Typography
				sx={{
					fontSize: 12,
					minWidth: 120,
					textAlign: "right",
					flex: "0 0 auto",
					fontWeight: la.online ? 600 : 400,
					color: la.online ? "success.main" : "text.disabled",
				}}
			>
				{la.text}
			</Typography>

			<Tooltip
				title={t(user.active ? "settings.users.deactivate" : "settings.users.reactivate")}
				arrow
				enterDelay={200}
			>
				<IconButton
					aria-label={actionLabel}
					onClick={() => (user.active ? onDeactivate(user) : onReactivate(user))}
					sx={
						user.active
							? actionSx(designTokens.errorBg, "error.main")
							: actionSx(designTokens.primarySoft, "primary.main")
					}
				>
					{user.active ? (
						<VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
					) : (
						<RestoreOutlinedIcon sx={{ fontSize: 18 }} />
					)}
				</IconButton>
			</Tooltip>
		</Box>
	);
};

export default UserRow;
