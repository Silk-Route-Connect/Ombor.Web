import React from "react";
import { useTranslation } from "react-i18next";
import PartnerPicker from "components/transaction/Create/PartnerPicker";
import PosField from "components/transaction/Create/PosField";
import { POS_CARD_PADDING, posCardSx } from "components/transaction/Create/posStyles";
import WarehousePicker from "components/transaction/Create/WarehousePicker";
import { OrderSource } from "models/order";
import { Partner } from "models/partner";
import { Warehouse } from "models/warehouse";

import { Box, TextField } from "@mui/material";

import OrderSourcePicker from "./OrderSourcePicker";

interface OrderHeaderCardProps {
	customers: Partner[];
	client: Partner | null;
	onClientChange: (client: Partner | null) => void;
	warehouses: Warehouse[];
	warehouseId: number | null;
	onWarehouseChange: (id: number) => void;
	source: OrderSource;
	onSourceChange: (source: OrderSource) => void;
	deliveryDate: string;
	onDeliveryDateChange: (date: string) => void;
	deliveryTime: string;
	onDeliveryTimeChange: (time: string) => void;
	/** After a submit attempt: which required field is missing. */
	errors: { client: boolean; warehouse: boolean; deliveryDate: boolean };
}

const rowSx = (columns: string) =>
	({ display: "grid", gridTemplateColumns: { xs: "1fr", sm: columns }, gap: "16px" }) as const;

/**
 * Who the order is for, where it ships from and when — the New Order header card.
 * Date and time stay native inputs on the theme field (a localized date picker is
 * an owner decision).
 */
export const OrderHeaderCard: React.FC<OrderHeaderCardProps> = ({
	customers,
	client,
	onClientChange,
	warehouses,
	warehouseId,
	onWarehouseChange,
	source,
	onSourceChange,
	deliveryDate,
	onDeliveryDateChange,
	deliveryTime,
	onDeliveryTimeChange,
	errors,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				...posCardSx,
				p: POS_CARD_PADDING,
				display: "flex",
				flexDirection: "column",
				gap: "16px",
			}}
		>
			<Box sx={rowSx("1.3fr 1fr 1fr")}>
				<PosField
					label={t("order.field.client")}
					required
					error={errors.client ? t("order.new.err.client") : undefined}
				>
					<PartnerPicker
						direction="Sale"
						partner={client}
						partners={customers}
						error={errors.client}
						onPick={onClientChange}
					/>
				</PosField>
				<PosField
					label={t("order.new.field.warehouse")}
					required
					error={errors.warehouse ? t("order.new.err.warehouse") : undefined}
				>
					<WarehousePicker
						value={warehouseId}
						warehouses={warehouses}
						onChange={onWarehouseChange}
					/>
				</PosField>
				<PosField label={t("order.field.source")}>
					<OrderSourcePicker value={source} onChange={onSourceChange} />
				</PosField>
			</Box>
			<Box sx={rowSx("1fr 1fr")}>
				<PosField
					label={t("order.field.deliveryDate")}
					required
					error={errors.deliveryDate ? t("order.new.err.deliveryDate") : undefined}
				>
					<TextField
						type="date"
						value={deliveryDate}
						error={errors.deliveryDate}
						onChange={(e) => onDeliveryDateChange(e.target.value)}
						fullWidth
					/>
				</PosField>
				<PosField label={t("order.field.deliveryTime")} optional>
					<TextField
						type="time"
						value={deliveryTime}
						onChange={(e) => onDeliveryTimeChange(e.target.value)}
						fullWidth
					/>
				</PosField>
			</Box>
		</Box>
	);
};

export default OrderHeaderCard;
