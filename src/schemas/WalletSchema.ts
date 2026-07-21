import i18next from "i18n/config";
import { WALLET_TYPES } from "models/wallet";
import { z } from "zod";

/**
 * Wallet create/edit form contract. On create, name + type + opening balance;
 * on edit only the name is editable (type and opening balance are immutable
 * auditable facts — business-rules rule 16), so the modal locks them and the
 * form value is ignored. Opening balance may be zero (an empty till).
 */
export const WalletSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, i18next.t("wallet.validation.nameMin"))
		.max(250, i18next.t("wallet.validation.nameMax")),
	type: z.enum(WALLET_TYPES),
	openingBalance: z.number().min(0, i18next.t("wallet.validation.openingNonNegative")),
});

export type WalletFormInputs = z.input<typeof WalletSchema>;
export type WalletFormValues = z.output<typeof WalletSchema>;

/**
 * Inter-wallet transfer form contract (business-rules rule 16). Source and
 * destination are required and must differ; the amount is strictly positive.
 * The over-balance check is contextual (it depends on the live source balance),
 * so — like the Transfers over-stock guard — it is enforced in the modal, not
 * here. The note is optional and rides along for the audit trail.
 */
export const TransferSchema = z
	.object({
		fromWalletId: z.number().int().positive(i18next.t("wallet.transfer.validation.fromRequired")),
		toWalletId: z.number().int().positive(i18next.t("wallet.transfer.validation.toRequired")),
		amount: z.number().positive(i18next.t("wallet.transfer.validation.amountPositive")),
		note: z
			.string()
			.trim()
			.max(500, i18next.t("wallet.transfer.validation.noteMax"))
			.transform((v) => (v === "" ? null : v))
			.nullable(),
	})
	.refine((v) => v.fromWalletId !== v.toWalletId, {
		path: ["toWalletId"],
		message: i18next.t("wallet.transfer.validation.sameWallet"),
	});

export type TransferFormInputs = z.input<typeof TransferSchema>;
export type TransferFormValues = z.output<typeof TransferSchema>;
