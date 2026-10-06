import React from "react";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { Organization } from "models/settings";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";
import { InvoiceDocument, invoiceTitle } from "utils/invoiceDocument";
import { shortDeliveryTime } from "utils/orderUtils";
import { formatUzPhone } from "utils/phoneUtils";

import { Typography } from "@mui/material";

import InvoiceLinesTable from "./InvoiceLinesTable";
import PrintDocHeader from "./PrintDocHeader";
import PrintParties, { PrintParty } from "./PrintParties";
import PrintSignatures from "./PrintSignatures";
import PrintTotals, { PrintTotalRow } from "./PrintTotals";

interface InvoiceSheetProps {
	doc: InvoiceDocument;
	organization: Organization;
}

const money = (t: TFunction, value: number) => `${formatCurrency(value)} ${t("common.unit.uzs")}`;

/** Date, warehouse, refund reference and delivery lines under the title. */
function subtitleLines(t: TFunction, doc: InvoiceDocument): string[] {
	const lines = [t("print.invoice.dated", { date: formatDate(doc.date) })];
	if (doc.originalNumber) {
		lines.push(
			t(`print.invoice.refundOf.${doc.kind}`, {
				number: formatOptionalNumber(doc.originalNumber, t("print.noNumber")),
			}),
		);
	}
	if (doc.warehouseName) {
		lines.push(t("print.invoice.warehouse", { name: doc.warehouseName }));
	}
	if (doc.delivery) {
		const when = [
			doc.delivery.date && formatDate(doc.delivery.date),
			doc.delivery.time && shortDeliveryTime(doc.delivery.time),
		]
			.filter(Boolean)
			.join(" ");
		lines.push(
			t("print.invoice.delivery", {
				details: [when, doc.delivery.address].filter(Boolean).join(", "),
			}),
		);
	}
	return lines;
}

function totalRows(t: TFunction, doc: InvoiceDocument): PrintTotalRow[] {
	const rows: PrintTotalRow[] = [];
	if (doc.discount > 0) {
		rows.push(
			{ key: "subtotal", label: t("print.invoice.subtotal"), value: money(t, doc.subtotal) },
			{ key: "discount", label: t("print.invoice.discount"), value: money(t, doc.discount) },
		);
	}
	rows.push({
		key: "total",
		label: t("print.invoice.total"),
		value: money(t, doc.total),
		strong: true,
	});
	if (doc.payment) {
		rows.push(
			{ key: "paid", label: t("print.invoice.paid"), value: money(t, doc.payment.paid) },
			{
				key: "remaining",
				label: t("print.invoice.remaining"),
				value: money(t, doc.payment.remaining),
			},
		);
	}
	return rows;
}

/**
 * The printed «Накладная» of a sale, supply, refund or order: business header,
 * title with № and date, sender / receiver, the goods, totals (paid and left to
 * pay on sales and supplies), notes, and «Отпустил / Получил» signatures.
 */
export const InvoiceSheet: React.FC<InvoiceSheetProps> = ({ doc, organization }) => {
	const { t } = useTranslation();

	const business = {
		name: organization.name,
		details: [organization.address, organization.phone],
	};
	const partner = {
		name: doc.partner.name,
		details: [
			doc.partner.companyName,
			doc.partner.phoneNumbers.map(formatUzPhone).join(", "),
			doc.partner.address,
		],
	};
	const sender = doc.goodsOut ? business : partner;
	const receiver = doc.goodsOut ? partner : business;
	const parties: PrintParty[] = [
		{ role: t("print.invoice.sender"), ...sender },
		{ role: t("print.invoice.receiver"), ...receiver },
	];

	return (
		<>
			<PrintDocHeader
				organization={organization}
				title={invoiceTitle(t, doc)}
				subtitle={subtitleLines(t, doc)}
			/>
			<PrintParties parties={parties} />
			<InvoiceLinesTable lines={doc.lines} />
			<PrintTotals
				rows={totalRows(t, doc)}
				note={t("print.invoice.lineCount", { count: doc.lines.length })}
			/>
			{doc.refundReason && (
				<Typography sx={{ fontSize: 13, mb: "6px" }}>
					{t("print.invoice.refundReason", { reason: doc.refundReason })}
				</Typography>
			)}
			{doc.notes && (
				<Typography sx={{ fontSize: 13, mb: "6px" }}>
					{t("print.invoice.notes", { notes: doc.notes })}
				</Typography>
			)}
			<PrintSignatures
				blocks={[
					{ title: t("print.invoice.released"), name: sender.name },
					{ title: t("print.invoice.receivedBy"), name: receiver.name },
				]}
			/>
		</>
	);
};

export default InvoiceSheet;
