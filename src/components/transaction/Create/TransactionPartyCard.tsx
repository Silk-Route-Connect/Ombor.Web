import React from "react";
import { useTranslation } from "react-i18next";
import FormField from "components/shared/Forms/FormField";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { Partner } from "models/partner";
import { Warehouse } from "models/warehouse";

import { Box } from "@mui/material";

import PartnerPicker from "./PartnerPicker";
import { POS_CARD_PADDING, posCardSx } from "./posStyles";
import WarehousePicker from "./WarehousePicker";

interface TransactionPartyCardProps {
	entry: UseTransactionEntry;
	partners: Partner[];
	warehouses: Warehouse[];
}

/** Who the sale / supply is with and which warehouse it moves — the page's header card. */
export const TransactionPartyCard: React.FC<TransactionPartyCardProps> = ({
	entry,
	partners,
	warehouses,
}) => {
	const { t } = useTranslation();
	const { direction } = entry;
	const noPartner = entry.tried && !entry.partner;

	return (
		<Box
			sx={{
				...posCardSx,
				p: POS_CARD_PADDING,
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr" },
				gap: "16px",
			}}
		>
			<FormField
				data-ns="partner"
				label={t(`transaction.new.partner.label.${direction}`)}
				required
				error={noPartner ? t(`transaction.new.partner.required.${direction}`) : undefined}
				helperText={
					direction === "Sale" && !entry.partner
						? t("transaction.new.partner.walkInHint")
						: undefined
				}
			>
				<PartnerPicker
					direction={direction}
					partner={entry.partner}
					partners={partners}
					error={noPartner}
					onPick={entry.setPartner}
				/>
			</FormField>
			<FormField
				data-ns="warehouse"
				label={t(`transaction.new.warehouse.label.${direction}`)}
				required
			>
				<WarehousePicker
					value={entry.warehouseId}
					warehouses={warehouses}
					onChange={entry.setWarehouseId}
				/>
			</FormField>
		</Box>
	);
};

export default TransactionPartyCard;
