import React from "react";
import { useTranslation } from "react-i18next";
import Callout from "components/shared/Callout/Callout";
import FormField from "components/shared/Forms/FormField";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import {
	POS_CARD_PADDING,
	posSubmitSx,
	posSummaryCardSx,
} from "components/transaction/Create/posStyles";
import PartnerBalanceBlock from "components/transaction/Create/Summary/PartnerBalanceBlock";
import SummaryRow from "components/transaction/Create/Summary/SummaryRow";
import SummaryTotal from "components/transaction/Create/Summary/SummaryTotal";
import { Partner } from "models/partner";
import { formatCurrency } from "utils/formatCurrency";

import CheckIcon from "@mui/icons-material/Check";
import { Box, TextField } from "@mui/material";

interface OrderSummaryCardProps {
	client: Partner | null;
	warehouseName: string;
	/** «ДД.ММ.ГГГГ · ЧЧ:ММ», or empty while no date is picked. */
	delivery: string;
	subtotal: number;
	discTotal: number;
	total: number;
	address: string;
	onAddressChange: (address: string) => void;
	note: string;
	onNoteChange: (note: string) => void;
	onSubmit: () => void;
}

const blockSx = {
	p: POS_CARD_PADDING,
	borderTop: "1px solid",
	borderColor: "divider",
	display: "flex",
	flexDirection: "column",
	gap: "12px",
} as const;

/**
 * The New Order rail: the client's served balance, what the order holds and its
 * totals, the delivery address and note, and «Создать заказ». No payment and no
 * immutability note — an order moves no money or stock until delivery.
 */
export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
	client,
	warehouseName,
	delivery,
	subtotal,
	discTotal,
	total,
	address,
	onAddressChange,
	note,
	onNoteChange,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<Box sx={posSummaryCardSx}>
			<PartnerBalanceBlock
				direction="Sale"
				partner={client}
				balanceAfter={client?.balance ?? 0}
				showAfter={false}
			/>

			<Box sx={{ ...blockSx, borderTop: "none" }}>
				<SummaryRow label={t("order.field.client")} value={client?.name ?? "—"} text />
				<SummaryRow label={t("order.new.field.warehouse")} value={warehouseName || "—"} text />
				<SummaryRow
					label={t("order.new.summary.delivery")}
					value={delivery || "—"}
					valueColor={delivery ? "text.primary" : "text.disabled"}
					text
				/>
				<Box sx={{ borderTop: "1px solid", borderColor: "divider", my: "4px" }} />
				<SummaryRow label={t("order.new.summary.subtotal")} value={formatCurrency(subtotal)} />
				<SummaryRow
					label={t("order.new.summary.discount")}
					value={discTotal > 0 ? `−${formatCurrency(discTotal)}` : "—"}
					valueColor={discTotal > 0 ? "error.main" : "text.disabled"}
				/>
				<SummaryTotal label={t("order.new.summary.total")} total={total} />
			</Box>

			<Box sx={blockSx}>
				<FormField label={t("order.field.address")} hint={t("common.optional")}>
					<TextField
						value={address}
						placeholder={t("order.edit.addressPlaceholder")}
						onChange={(e) => onAddressChange(e.target.value)}
						fullWidth
					/>
				</FormField>
				<FormField label={t("order.field.note")} hint={t("common.optional")}>
					<TextField
						value={note}
						placeholder={t("order.edit.notePlaceholder")}
						onChange={(e) => onNoteChange(e.target.value)}
						multiline
						minRows={2}
						fullWidth
					/>
				</FormField>
			</Box>

			<Box sx={blockSx}>
				<Callout tone="info">{t("order.new.editableNote")}</Callout>
				<PrimaryButton icon={<CheckIcon />} onClick={onSubmit} fullWidth sx={posSubmitSx}>
					{t("order.new.submit")}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default OrderSummaryCard;
