import React from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import AttachmentChip from "components/shared/AttachmentChip/AttachmentChip";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { TransactionRecord } from "models/transaction";
import { designTokens, numericSx, radius } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatEntityId } from "utils/formatEntityId";
import { directionOf, TransactionDirection } from "utils/transactionUtils";

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";

export const NoteAttachmentsCard: React.FC<{ tx: TransactionRecord }> = ({ tx }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			title={t("transaction.detail.noteTitle")}
			icon={<DescriptionOutlinedIcon sx={detailCardIconSx} />}
		>
			<Box sx={{ p: "16px 18px" }}>
				{tx.notes && (
					<Typography sx={{ fontSize: 13, lineHeight: 1.6, color: designTokens.gray700 }}>
						{tx.notes}
					</Typography>
				)}
				{(tx.attachments?.length ?? 0) > 0 && (
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: tx.notes ? "14px" : 0 }}>
						{tx.attachments?.map((a) => (
							<AttachmentChip key={a.url || a.name} {...a} />
						))}
					</Box>
				)}
			</Box>
		</DetailCard>
	);
};

/** «Информация»: who the partner is, when and by whom it was recorded, which warehouse. */
export const AuditCard: React.FC<{ tx: TransactionRecord; isRefund: boolean }> = ({
	tx,
	isRefund,
}) => {
	const { t } = useTranslation();
	const direction = directionOf(tx.type);
	const rows: Array<{ icon: React.ReactNode; k: string; v: React.ReactNode }> = [
		{
			icon: <PersonOutlineIcon sx={{ fontSize: 16 }} />,
			k: t(`transaction.detail.partnerType.${direction}`),
			v: tx.partnerId ? <PartnerLink id={tx.partnerId} name={tx.partnerName} /> : tx.partnerName,
		},
		{
			icon: <EventOutlinedIcon sx={{ fontSize: 16 }} />,
			k: isRefund ? t("transaction.detail.createdRefund") : t("transaction.detail.createdSale"),
			v: (
				<>
					<Box component="span" sx={numericSx}>
						{formatDateTime(tx.date)}
					</Box>
					{tx.createdBy ? ` · ${tx.createdBy}` : null}
				</>
			),
		},
	];
	// The lean backend DTO may omit the warehouse — drop the row rather than
	// render an empty value.
	if (tx.warehouseName) {
		rows.push({
			icon: <WarehouseOutlinedIcon sx={{ fontSize: 16 }} />,
			k: isRefund
				? t("transaction.detail.warehouse.refund")
				: t(`transaction.detail.warehouse.${direction}`),
			v: tx.warehouseName,
		});
	}
	return (
		<DetailCard
			title={t("transaction.detail.infoTitle")}
			icon={<InfoOutlinedIcon sx={detailCardIconSx} />}
		>
			{rows.map((r) => (
				<Box
					key={r.k}
					sx={{
						display: "flex",
						alignItems: "flex-start",
						gap: "12px",
						p: "13px 18px",
						borderBottom: 1,
						borderColor: "divider",
						"&:last-of-type": { borderBottom: "none" },
					}}
				>
					<Box
						sx={{
							width: 30,
							height: 30,
							borderRadius: `${radius.md}px`,
							display: "grid",
							placeItems: "center",
							flex: "0 0 auto",
							bgcolor: "grey.50",
							border: 1,
							borderColor: "divider",
							color: "text.secondary",
						}}
					>
						{r.icon}
					</Box>
					<Box>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>{r.k}</Typography>
						<Typography component="div" sx={{ fontSize: 13, fontWeight: 500, mt: "2px" }}>
							{r.v}
						</Typography>
					</Box>
				</Box>
			))}
		</DetailCard>
	);
};

export const ReasonCard: React.FC<{ reason: string }> = ({ reason }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			title={t("transaction.detail.reasonTitle")}
			icon={<UndoOutlinedIcon sx={{ fontSize: 16, color: designTokens.saffron600 }} />}
		>
			<Box sx={{ p: "16px 18px" }}>
				<Typography
					sx={{
						fontSize: 14,
						lineHeight: 1.55,
						color: designTokens.gray700,
						p: "12px 14px",
						bgcolor: designTokens.warningBg,
						border: 1,
						borderColor: designTokens.accentSoft,
						borderRadius: `${radius.md}px`,
					}}
				>
					{reason}
				</Typography>
			</Box>
		</DetailCard>
	);
};

/** «Возврат по продаже №N» — the whole banner opens the original document. */
export const RefundReferenceBanner: React.FC<{
	direction: TransactionDirection;
	number?: string;
	onOpen: () => void;
}> = ({ direction, number, onOpen }) => {
	const { t } = useTranslation();
	return (
		<ButtonBase
			onClick={onOpen}
			sx={{
				display: "flex",
				width: "100%",
				justifyContent: "flex-start",
				textAlign: "left",
				alignItems: "center",
				gap: "11px",
				p: "13px 18px",
				mb: "20px",
				bgcolor: designTokens.gray25,
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				fontSize: 14,
				"&:hover": { borderColor: designTokens.primaryLine, bgcolor: "primary.light" },
			}}
		>
			<UndoOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
			<Box component="span">
				{t(`transaction.detail.refundOfBanner.${direction}`)}{" "}
				<Box component="b" sx={{ ...numericSx, color: "primary.main" }}>
					{number ? formatEntityId(number) : ""}
				</Box>
			</Box>
			<Box sx={{ flexGrow: 1 }} />
			<Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: "primary.main" }}>
				{t(`transaction.detail.openOriginal.${direction}`)}
			</Box>
		</ButtonBase>
	);
};
