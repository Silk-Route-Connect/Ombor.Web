import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { TenantUser } from "models/settings";

import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { Box, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";
import UserRow from "./UserRow";

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
				{users.map((u, i) => (
					<UserRow
						key={u.id}
						user={u}
						last={i === users.length - 1}
						onDeactivate={onDeactivate}
						onReactivate={onReactivate}
					/>
				))}
			</Box>

			<Typography sx={{ mt: "18px", fontSize: 12, color: "text.disabled", lineHeight: 1.5 }}>
				{t("settings.users.footnote")}
			</Typography>
		</SettingsSectionCard>
	);
};

export default UsersSection;
