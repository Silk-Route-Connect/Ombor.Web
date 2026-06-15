import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { TenantUser } from "models/settings";
import { designTokens } from "theme";
import { formatDate } from "utils/dateUtils";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Box, Tooltip, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

interface Props {
	users: TenantUser[];
	onInvite: () => void;
	onDeactivate: (user: TenantUser) => void;
	onReactivate: (user: TenantUser) => void;
}

const Avatar: React.FC<{ name: string; muted: boolean }> = ({ name, muted }) => (
	<Box
		sx={{
			width: 38,
			height: 38,
			flex: "0 0 auto",
			borderRadius: "50%",
			display: "grid",
			placeItems: "center",
			fontSize: 14,
			fontWeight: 700,
			bgcolor: "primary.light",
			color: "primary.main",
			...(muted && { opacity: 0.45, filter: "grayscale(1)" }),
		}}
	>
		{name.trim().charAt(0).toUpperCase()}
	</Box>
);

const Chip: React.FC<{ tone: "primary" | "neutral"; label: string; muted?: boolean }> = ({
	tone,
	label,
	muted,
}) => {
	const tones = {
		primary: { bg: designTokens.primarySoft, color: "#12676B" },
		neutral: { bg: designTokens.gray100, color: designTokens.gray600 },
	}[tone];
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				fontSize: 11.5,
				fontWeight: 600,
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				bgcolor: tones.bg,
				color: tones.color,
				...(muted && { opacity: 0.55, filter: "grayscale(0.6)" }),
			}}
		>
			{label}
		</Box>
	);
};

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
		return {
			text: u.lastActiveAt ? formatDate(u.lastActiveAt) : t("settings.users.invited"),
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
							<Avatar name={u.name} muted={!u.active} />
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
									{u.self && (
										<Box
											component="span"
											sx={{
												fontSize: 10,
												fontWeight: 700,
												letterSpacing: "0.03em",
												textTransform: "uppercase",
												color: "primary.main",
												bgcolor: designTokens.primarySoft,
												borderRadius: "999px",
												px: "7px",
												py: "1px",
											}}
										>
											{t("settings.users.you")}
										</Box>
									)}
								</Box>
								<Typography
									sx={{
										fontSize: 12.5,
										mt: "2px",
										color: u.active ? "text.secondary" : "text.disabled",
									}}
								>
									{u.contact}
								</Typography>
							</Box>

							<Chip tone="primary" label={t("settings.users.admin")} muted={!u.active} />
							{!u.active && <Chip tone="neutral" label={t("settings.users.deactivated")} />}

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
