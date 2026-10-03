import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { PartnerFormInputs, PartnerFormValues } from "schemas/PartnerSchema";
import { useStore } from "stores/StoreContext";
import { toCreatePartnerRequest } from "utils/partnerRequest";
import { canHaveSales, canHaveSupplies } from "utils/partnerUtils";
import { TransactionDirection } from "utils/transactionUtils";

interface PosPartnerCreateProps {
	direction: TransactionDirection;
	/** The text typed in the partner picker, or null while the form is closed. */
	typed: string | null;
	onClose: () => void;
	/** The created partner when it can take part in this sale / supply — the picker selects it. */
	onCreated: (partner: Partner) => void;
}

/**
 * «+ Новый клиент / поставщик» from the POS partner picker: the regular partner
 * form, started as a client (sale) or supplier (supply) with the typed name. The
 * cart underneath stays as it is.
 */
const PosPartnerCreate: React.FC<PosPartnerCreateProps> = observer(
	({ direction, typed, onClose, onCreated }) => {
		const { t } = useTranslation();
		const { partnerStore, notificationStore } = useStore();

		const defaults = useMemo<Partial<PartnerFormInputs>>(() => {
			const name = typed?.trim() ?? "";
			return {
				type: direction === "Sale" ? "Customer" : "Supplier",
				...(name ? { name } : {}),
			};
		}, [direction, typed]);

		const handleSave = async (values: PartnerFormValues): Promise<void> => {
			const created = await partnerStore.create(toCreatePartnerRequest(values));
			if (!created) {
				return;
			}
			onClose();
			const fits =
				direction === "Sale" ? canHaveSales(created.type) : canHaveSupplies(created.type);
			if (fits) {
				onCreated(created);
			} else {
				// The type was switched in the form: the partner exists but can't trade this way.
				notificationStore.info(
					t(`transaction.new.partner.createdOtherType.${direction}`, { name: created.name }),
				);
			}
		};

		return (
			<PartnerFormModal
				isOpen={typed !== null}
				isSaving={partnerStore.isSaving}
				partner={null}
				defaults={defaults}
				onSave={(values) => void handleSave(values)}
				onClose={onClose}
			/>
		);
	},
);

export default PosPartnerCreate;
