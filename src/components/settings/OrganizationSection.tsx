import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import { Organization } from "models/settings";
import { designTokens } from "theme";

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CloseIcon from "@mui/icons-material/Close";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import { Box, TextField, Typography } from "@mui/material";

import SettingsSectionCard from "./SettingsSectionCard";

interface Props {
	org: Organization;
	onChange: (patch: Partial<Organization>) => void;
}

const LabeledField: React.FC<{
	label: string;
	optional?: boolean;
	children: React.ReactNode;
}> = ({ label, optional, children }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
			<Typography
				component="label"
				sx={{ fontSize: 13, fontWeight: 600, color: designTokens.gray700 }}
			>
				{label}
				{optional ? (
					<Box component="span" sx={{ fontWeight: 500, color: "text.disabled", ml: "4px" }}>
						{t("settings.org.optional")}
					</Box>
				) : (
					<Box component="span" sx={{ color: "error.main" }}>
						{" *"}
					</Box>
				)}
			</Typography>
			{children}
		</Box>
	);
};

const fieldSx = { "& .MuiInputBase-root": { fontSize: 14 } } as const;

/** Организация — editable company profile + logo (mvp-plan §18). */
const OrganizationSection: React.FC<Props> = ({ org, onChange }) => {
	const { t } = useTranslation();
	const fileRef = useRef<HTMLInputElement>(null);

	const initials = org.name
		.split(" ")
		.map((w) => w[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();

	const onFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const file = e.target.files?.[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (ev) => onChange({ logoUrl: String(ev.target?.result ?? "") });
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	return (
		<SettingsSectionCard
			id="org"
			icon={<BusinessOutlinedIcon sx={{ fontSize: 17 }} />}
			title={t("settings.org.title")}
			subtitle={t("settings.org.subtitle")}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: 600 }}>
				<LabeledField label={t("settings.org.name")}>
					<TextField
						size="small"
						fullWidth
						sx={fieldSx}
						value={org.name}
						onChange={(e) => onChange({ name: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.address")} optional>
					<TextField
						size="small"
						fullWidth
						sx={fieldSx}
						value={org.address}
						placeholder={t("settings.org.addressPlaceholder")}
						onChange={(e) => onChange({ address: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.phone")} optional>
					<TextField
						size="small"
						fullWidth
						sx={fieldSx}
						value={org.phone}
						placeholder="+998 …"
						onChange={(e) => onChange({ phone: e.target.value })}
					/>
				</LabeledField>
				<LabeledField label={t("settings.org.email")} optional>
					<TextField
						size="small"
						fullWidth
						type="email"
						sx={fieldSx}
						value={org.email}
						placeholder="info@company.uz"
						onChange={(e) => onChange({ email: e.target.value })}
					/>
				</LabeledField>

				<LabeledField label={t("settings.org.logo")} optional>
					<Box sx={{ display: "flex", alignItems: "center", gap: "18px" }}>
						<Box
							sx={{
								width: 72,
								height: 72,
								flex: "0 0 auto",
								borderRadius: "50%",
								display: "grid",
								placeItems: "center",
								bgcolor: "primary.main",
								color: "#fff",
								fontWeight: 800,
								fontSize: 24,
								letterSpacing: "-0.02em",
								boxShadow: 1,
								...(org.logoUrl && {
									backgroundImage: `url(${org.logoUrl})`,
									backgroundSize: "cover",
									backgroundPosition: "center",
									color: "transparent",
								}),
							}}
						>
							{initials}
						</Box>
						<Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
									icon={<UploadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
									onClick={() => fileRef.current?.click()}
								>
									{t("settings.org.uploadLogo")}
								</GhostButton>
								{org.logoUrl && (
									<GhostButton
										size="small"
										icon={<CloseIcon sx={{ fontSize: "17px !important" }} />}
										onClick={() => onChange({ logoUrl: null })}
									>
										{t("settings.org.removeLogo")}
									</GhostButton>
								)}
							</Box>
							<Typography sx={{ fontSize: 12, color: "text.disabled" }}>
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
