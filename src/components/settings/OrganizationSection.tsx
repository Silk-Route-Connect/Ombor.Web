import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { Organization } from "models/settings";
import { useStore } from "stores/StoreContext";
import { getImageFullUrl } from "utils/productUtils";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseIcon from "@mui/icons-material/Close";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { Box, TextField, Typography } from "@mui/material";

import SettingsSaveBar from "./SettingsSaveBar";
import SettingsSectionCard from "./SettingsSectionCard";
import { settingsFieldSx, settingsFormSx } from "./styles";

interface Props {
	org: Organization;
	onChange: (patch: Partial<Organization>) => void;
	/** The newly-selected logo file (null when removed) — uploaded on save (multipart). */
	onLogoFile: (file: File | null) => void;
	/** The draft differs from the saved organization. */
	dirty: boolean;
	saving: boolean;
	onSave: () => void;
	onReset: () => void;
}

const LabeledField: React.FC<{
	label: string;
	optional?: boolean;
	children: React.ReactNode;
}> = ({ label, optional, children }) => {
	const { t } = useTranslation();
	return (
		<Box sx={settingsFieldSx}>
			<FormFieldLabel
				label={label}
				required={!optional}
				hint={optional ? t("common.optional") : undefined}
			/>
			{children}
		</Box>
	);
};

/** Max logo size, enforced client-side before upload (matches the «до 2 МБ» hint). */
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg"];

/** Организация — editable company profile + logo (mvp-plan §18). */
const OrganizationSection: React.FC<Props> = ({
	org,
	onChange,
	onLogoFile,
	dirty,
	saving,
	onSave,
	onReset,
}) => {
	const { t } = useTranslation();
	const { notificationStore } = useStore();
	const fileRef = useRef<HTMLInputElement>(null);

	const logoSrc = getImageFullUrl(org.logoUrl ?? undefined);
	const initials = org.name
		.split(" ")
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const onFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		// Reset the input first so re-selecting the same (rejected) file still fires.
		e.target.value = "";
		if (!file) {
			return;
		}
		if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
			notificationStore.error(t("settings.org.logoInvalidType"));
			return;
		}
		if (file.size > MAX_LOGO_BYTES) {
			notificationStore.error(t("settings.org.logoTooLarge"));
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => onChange({ logoUrl: String(ev.target?.result ?? "") });
		reader.readAsDataURL(file);
		onLogoFile(file);
	};

	return (
		<SettingsSectionCard
			id="org"
			icon={<BusinessOutlinedIcon />}
			title={t("settings.org.title")}
			subtitle={t("settings.org.subtitle")}
			footer={<SettingsSaveBar dirty={dirty} saving={saving} onSave={onSave} onReset={onReset} />}
		>
			<Box sx={settingsFormSx}>
				<LabeledField label={t("settings.org.name")}>
					<TextField
						size="small"
						fullWidth
						value={org.name}
						onChange={(e) => onChange({ name: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.address")} optional>
					<TextField
						size="small"
						fullWidth
						value={org.address}
						placeholder={t("settings.org.addressPlaceholder")}
						onChange={(e) => onChange({ address: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.phone")} optional>
					<TextField
						size="small"
						fullWidth
						value={org.phone}
						placeholder={t("settings.org.phonePlaceholder")}
						onChange={(e) => onChange({ phone: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.email")} optional>
					<TextField
						size="small"
						fullWidth
						type="email"
						value={org.email}
						placeholder={t("settings.org.emailPlaceholder")}
						onChange={(e) => onChange({ email: e.target.value })}
					/>
				</LabeledField>

				<LabeledField label={t("settings.org.logo")} optional>
					<Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
						<Box
							sx={{
								width: 72,
								height: 72,
								flex: "0 0 auto",
								borderRadius: "50%",
								display: "grid",
								placeItems: "center",
								bgcolor: "primary.main",
								color: "common.white",
								fontWeight: 700,
								fontSize: 24,
								letterSpacing: "-0.02em",
								boxShadow: 1,
								...(logoSrc && {
									backgroundImage: `url(${logoSrc})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
									color: "transparent",
								}),
							}}
						>
							{initials}
						</Box>
						<Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<Box sx={{ display: "flex", gap: "8px" }}>
								<input
									ref={fileRef}
									type="file"
									accept="image/png,image/jpeg"
									style={{ display: "none" }}
									onChange={onFile}
								/>
								<GhostButton
									size="small"
									icon={<UploadOutlinedIcon />}
									onClick={() => fileRef.current?.click()}
								>
									{t("settings.org.uploadLogo")}
								</GhostButton>
								{org.logoUrl && (
									<GhostButton
										size="small"
										icon={<CloseIcon />}
										onClick={() => {
											onChange({ logoUrl: null });
											onLogoFile(null);
										}}
									>
										{t("settings.org.removeLogo")}
									</GhostButton>
								)}
							</Box>
							<Typography variant="caption" sx={{ color: "text.secondary" }}>
								{t("settings.org.logoHint")}
							</Typography>
						</Box>
					</Box>
				</LabeledField>
			</Box>
		</SettingsSectionCard>
	);
};

export default OrganizationSection;
