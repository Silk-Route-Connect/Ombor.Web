import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { TenantUser } from "models/settings";
import { designTokens } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatUzPhone } from "utils/phoneUtils";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Box, Tooltip, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

/** A user's contact is a phone or an e-mail; phones read «+998 90 123 45 67». */
const PHONE_LIKE = /^\+?[\d\s()-]+$/;

interface Props {
	users: TenantUser[];
	onInvite: () => void;
	onDeactivate: (user: TenantUser) => void;
	onReactivate: (user: TenantUser) => void;
}

/** Пользователи — invite + deactivate/reactivate (never delete, rule 41). */
const UsersSection: React.FC<Props> = ({ users, onInvite, onDeactivate, onReactivate }) => {
	const { t } = useTranslation();

	const activeCount = users.filter((u) => u.active).length;
	const offCount = users.length - activeCount;
	const subtitle =
		offCount > 0
			? `${t("settings.users.activeCount", { count: activeCount })} · ${t("settings.users.deactivatedCount", { count: offCount })}`
			: t("settings.users.activeCount", { count: activeCount });

	const lastActive = (u: TenantUser): { text: string; online: boolean } => {
		if (!u.active) {
			return {
				text: u.lastActiveAt
					? t("settings.users.deactivatedSince", { date: formatDate(u.lastActiveAt) })
					: t("settings.users.deactivated"),
				online: false,
			};
		}
		if (u.online) {
			return { text: t("settings.users.onlineNow"), online: true };
		}
		// An active user with no recorded activity reads as «Активен» — the backend
		// returns active:true with no separate pending/invite status, so we never
		// mislabel a registered account (e.g. the owner) as «Приглашён» (F-005).
		return {
			text: u.lastActiveAt ? formatDate(u.lastActiveAt) : t("settings.users.active"),
			online: false,
		};
	};

	return (
		<SettingsSectionCard
			id="users"
			icon={<PeopleAltOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("settings.users.title")}
			subtitle={subtitle}
			action={
				<PrimaryButton
					size="small"
					icon={<PersonAddAltOutlinedIcon sx={{ fontSize: "18px !important" }} />}
					onClick={onInvite}
				>
					{t("settings.users.invite")}
				</PrimaryButton>
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{users.map((u, i) => {
					const la = lastActive(u);
					return (
						<Box
							key={u.id}
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "14px",
								py: "14px",
								borderBottom: i === users.length - 1 ? "none" : "1px solid",
								borderColor: designTokens.gray25,
							}}
						>
							<EntityAvatar name={u.name} size={38} muted={!u.active} />
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
									<Typography
										sx={{
											fontSize: 14,
											fontWeight: 600,
											color: u.active ? "text.primary" : "text.disabled",
										}}
									>
										{u.name}
									</Typography>
									{u.self && <StatusPill token="teal" uppercase label={t("settings.users.you")} />}
								</Box>
								<Typography
									sx={{
										fontSize: 12.5,
										mt: "2px",
										color: u.active ? "text.secondary" : "text.disabled",
									}}
								>
									{PHONE_LIKE.test(u.contact) ? formatUzPhone(u.contact) : u.contact}
								</Typography>
							</Box>

							<StatusPill token={u.active ? "teal" : "neutral"} label={t("settings.users.admin")} />
							{!u.active && <StatusPill token="neutral" label={t("settings.users.deactivated")} />}

							<Typography
								sx={{
									fontSize: 12.5,
									minWidth: 120,
									textAlign: "right",
									flex: "0 0 auto",
									fontWeight: la.online ? 600 : 400,
									color: la.online ? "success.main" : "text.disabled",
								}}
							>
								{la.text}
							</Typography>

							{u.active ? (
								<Tooltip title={t("settings.users.deactivate")} arrow enterDelay={200}>
									<Box
										onClick={() => onDeactivate(u)}
										sx={{
											width: 34,
											height: 34,
											flex: "0 0 auto",
											borderRadius: "8px",
											display: "grid",
											placeItems: "center",
											color: "text.disabled",
											cursor: "pointer",
											transition: "background .14s, color .14s",
											"&:hover": { bgcolor: designTokens.errorBg, color: "error.main" },
										}}
									>
										<VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
									</Box>
								</Tooltip>
							) : (
								<Tooltip title={t("settings.users.reactivate")} arrow enterDelay={200}>
									<Box
										onClick={() => onReactivate(u)}
										sx={{
											width: 34,
											height: 34,
											flex: "0 0 auto",
											borderRadius: "8px",
											display: "grid",
											placeItems: "center",
											color: "text.disabled",
											cursor: "pointer",
											transition: "background .14s, color .14s",
											"&:hover": { bgcolor: designTokens.primarySoft, color: "primary.main" },
										}}
									>
										<RestoreOutlinedIcon sx={{ fontSize: 18 }} />
									</Box>
								</Tooltip>
							)}
						</Box>
					);
				})}
			</Box>

			<Typography sx={{ mt: "18px", fontSize: 12, color: "text.disabled", lineHeight: 1.5 }}>
				{t("settings.users.footnote")}
			</Typography>
		</SettingsSectionCard>
	);
};

export default UsersSection;
