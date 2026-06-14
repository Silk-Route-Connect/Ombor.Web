import React from "react";
import { useTranslation } from "react-i18next";
import PartnerActionsMenu from "components/partner/PartnerActionsMenu";
import PartnerAvatar from "components/partner/PartnerAvatar";
import PartnerTypeChip from "components/partner/PartnerTypeChip";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Partner } from "models/partner";
import { designTokens } from "theme";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import { Box, ButtonBase, Link, Typography } from "@mui/material";

interface PartnerDetailHeaderProps {
	partner: Partner;
	onBack: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

const ArchivedBadge: React.FC<{ label: string }> = ({ label }) => (
	<Box
		component="span"
		sx={{
			fontSize: 10.5,
			fontWeight: 600,
			letterSpacing: "0.02em",
			textTransform: "uppercase",
			color: designTokens.gray500,
			bgcolor: designTokens.gray100,
			border: "1px solid",
			borderColor: designTokens.gray200,
			px: "7px",
			py: "1px",
			borderRadius: "999px",
		}}
	>
		{label}
	</Box>
);

export const PartnerDetailHeader: React.FC<PartnerDetailHeaderProps> = ({
	partner,
	onBack,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
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
					{t("partner.title")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{partner.name}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "20px",
					mb: "20px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
					<ButtonBase
						onClick={onBack}
						aria-label={t("partner.detail.back")}
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

					<PartnerAvatar name={partner.name} size={48} dimmed={partner.isArchived} />

					<Box sx={{ minWidth: 0 }}>
						<Typography
							component="h1"
							sx={{ fontSize: 25, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}
						>
							{partner.name}
						</Typography>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								mt: "8px",
								flexWrap: "wrap",
							}}
						>
							<PartnerTypeChip type={partner.type} />
							{partner.companyName && (
								<Box
									component="span"
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "6px",
										fontSize: 13.5,
										color: "text.secondary",
									}}
								>
									<Inventory2OutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
									{partner.companyName}
								</Box>
							)}
							{partner.isArchived && <ArchivedBadge label={t("partner.badge.archived")} />}
						</Box>
					</Box>
				</Box>

				<Box sx={{ flex: "0 0 auto" }}>
					{partner.isArchived ? (
						<PrimaryButton icon={<UnarchiveOutlinedIcon />} onClick={onRestore}>
							{t("common.restore")}
						</PrimaryButton>
					) : (
						<PartnerActionsMenu
							partner={partner}
							onEdit={onEdit}
							onArchive={onArchive}
							onRestore={onRestore}
							onDelete={onDelete}
							bordered
						/>
					)}
				</Box>
			</Box>
		</>
	);
};

export default PartnerDetailHeader;
