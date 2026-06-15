import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CurrencySection from "components/settings/CurrencySection";
import InviteUserModal from "components/settings/InviteUserModal";
import LanguageSection from "components/settings/LanguageSection";
import OrganizationSection from "components/settings/OrganizationSection";
import SettingsNav, { SettingsSectionDef } from "components/settings/SettingsNav";
import SettingsSaveBar from "components/settings/SettingsSaveBar";
import UsersSection from "components/settings/UsersSection";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { observer } from "mobx-react-lite";
import { InviteUserRequest, Organization, TenantUser } from "models/settings";
import { useStore } from "stores/StoreContext";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Box, CircularProgress } from "@mui/material";

const SECTION_KEYS = ["org", "lang", "currency", "users"] as const;

const SettingsPage: React.FC = observer(() => {
	const { t, i18n } = useTranslation();
	const { settingsStore, notificationStore } = useStore();

	const [draft, setDraft] = useState<Organization | null>(null);
	const [active, setActive] = useState<string>("org");
	const [inviteOpen, setInviteOpen] = useState(false);
	const [confirmUser, setConfirmUser] = useState<TenantUser | null>(null);

	useEffect(() => {
		settingsStore.load();
	}, [settingsStore]);

	const storeOrg = settingsStore.organization;
	const storeUsers = settingsStore.users;

	// Seed / re-sync the editable draft from the persisted org (on load + save).
	useEffect(() => {
		if (storeOrg !== "loading" && storeOrg) {
			setDraft(storeOrg);
		}
	}, [storeOrg]);

	// Scroll-spy: highlight the section nearest the top of the scrolling <main>.
	useEffect(() => {
		const root = document.querySelector("main");
		if (!root) {
			return;
		}
		const onScroll = (): void => {
			const ct = root.getBoundingClientRect().top + 90;
			let current: string = SECTION_KEYS[0];
			for (const key of SECTION_KEYS) {
				const el = document.getElementById(`settings-${key}`);
				if (el && el.getBoundingClientRect().top <= ct) {
					current = key;
				}
			}
			setActive(current);
		};
		root.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
		return () => root.removeEventListener("scroll", onScroll);
	}, [draft]);

	const sections: SettingsSectionDef[] = [
		{
			key: "org",
			label: t("settings.org.title"),
			icon: <BusinessOutlinedIcon sx={{ fontSize: 18 }} />,
		},
		{ key: "lang", label: t("settings.lang.title"), icon: <LanguageIcon sx={{ fontSize: 18 }} /> },
		{
			key: "currency",
			label: t("settings.currency.title"),
			icon: <PaymentsOutlinedIcon sx={{ fontSize: 18 }} />,
		},
		{
			key: "users",
			label: t("settings.users.title"),
			icon: <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />,
		},
	];

	const dirty = useMemo(
		() =>
			draft !== null &&
			storeOrg !== "loading" &&
			storeOrg !== null &&
			JSON.stringify(draft) !== JSON.stringify(storeOrg),
		[draft, storeOrg],
	);

	const loading = storeOrg === "loading" || storeUsers === "loading" || draft === null;

	const jump = (key: string): void => {
		document
			.getElementById(`settings-${key}`)
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const onSave = (): void => {
		if (draft) {
			void settingsStore.saveOrganization(draft);
		}
	};
	const onReset = (): void => {
		if (storeOrg !== "loading" && storeOrg) {
			setDraft(storeOrg);
		}
	};
	const onInvite = (request: InviteUserRequest): void => {
		void settingsStore.inviteUser(request).then((ok) => {
			if (ok) {
				setInviteOpen(false);
			}
		});
	};
	const onDeactivate = (user: TenantUser): void => {
		if (user.self) {
			notificationStore.info(t("settings.users.cannotDeactivateSelf"));
			return;
		}
		setConfirmUser(user);
	};

	const users = storeUsers === "loading" ? [] : storeUsers;

	return (
		<Box>
			<PageHeader title={t("settings.title")} />

			{loading || !draft ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
					<CircularProgress />
				</Box>
			) : (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "210px 1fr" },
						gap: "30px",
						alignItems: "start",
					}}
				>
					<SettingsNav sections={sections} activeKey={active} onJump={jump} />

					<Box
						sx={{
							minWidth: 0,
							maxWidth: 760,
							display: "flex",
							flexDirection: "column",
							gap: "18px",
						}}
					>
						<OrganizationSection
							org={draft}
							onChange={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))}
						/>
						<LanguageSection
							currentCode={i18n.language}
							onSelect={(code) => void i18n.changeLanguage(code)}
						/>
						<CurrencySection />
						<UsersSection
							users={users}
							onInvite={() => setInviteOpen(true)}
							onDeactivate={onDeactivate}
							onReactivate={(u) => void settingsStore.reactivateUser(u)}
						/>

						<SettingsSaveBar
							dirty={dirty}
							saving={settingsStore.saving}
							onSave={onSave}
							onReset={onReset}
						/>
					</Box>
				</Box>
			)}

			<InviteUserModal
				isOpen={inviteOpen}
				saving={false}
				onClose={() => setInviteOpen(false)}
				onInvite={onInvite}
			/>

			<ConfirmDialog
				isOpen={confirmUser !== null}
				icon={<VisibilityOffOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("settings.users.deactivateTitle")}
				content={t("settings.users.deactivateBody", { name: confirmUser?.name ?? "" })}
				confirmLabel={t("settings.users.deactivate")}
				confirmVariant="danger"
				onCancel={() => setConfirmUser(null)}
				onConfirm={() => {
					if (confirmUser) {
						void settingsStore.deactivateUser(confirmUser);
					}
					setConfirmUser(null);
				}}
			/>
		</Box>
	);
});

export default SettingsPage;
