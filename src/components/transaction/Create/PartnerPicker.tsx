import React from "react";
import { useTranslation } from "react-i18next";
import { Partner, PartnerType } from "models/partner";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Autocomplete, Avatar, Box, TextField, Typography } from "@mui/material";

import { dropdownSlotProps } from "./dropdownSx";
import { balancePresentation, initialsOf } from "./saleBalance";

interface PartnerPickerProps {
	direction: TransactionDirection;
	partner: Partner | null;
	partners: Partner[];
	error?: boolean;
	onPick: (partner: Partner | null) => void;
}

const KIND_KEY: Record<PartnerType, string> = {
	Customer: "transaction.new.partner.customer",
	Supplier: "transaction.new.partner.supplier",
	Both: "transaction.new.partner.both",
};

/**
 * Partner / supplier typeahead for the New Sale / New Supply header. There is no
 * system walk-in partner in this product — a counterparty is always required (per
 * product owner; canon rule 39 superseded). Each option shows the served balance
 * as colour + a natural-language label (locked pattern 4).
 */
export const PartnerPicker: React.FC<PartnerPickerProps> = ({
	direction,
	partner,
	partners,
	error,
	onPick,
}) => {
	const { t } = useTranslation();

	return (
		<Autocomplete
			options={partners}
			value={partner}
			openOnFocus
			onChange={(_, next) => onPick(next)}
			getOptionLabel={(p) => (p.companyName ? `${p.name} · ${p.companyName}` : p.name)}
			isOptionEqualToValue={(a, b) => a.id === b.id}
			noOptionsText={t(`transaction.new.partner.empty.${direction}`)}
			renderInput={(params) => (
				<TextField
					{...params}
					placeholder={t(`transaction.new.partner.placeholder.${direction}`)}
					error={error}
					slotProps={{
						input: {
							...params.InputProps,
							startAdornment: (
								<PersonOutlineIcon sx={{ fontSize: 18, color: "text.disabled", ml: "4px" }} />
							),
						},
					}}
				/>
			)}
			renderOption={(props, p) => {
				const tone = balancePresentation(p.balance);
				return (
					<Box component="li" {...props} key={p.id} sx={{ gap: "12px" }}>
						<Avatar
							sx={{
								width: 34,
								height: 34,
								fontSize: 13,
								fontWeight: 700,
								bgcolor: designTokens.primarySoft,
								color: "primary.main",
							}}
						>
							{initialsOf(p.name)}
						</Avatar>
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }} noWrap>
								{p.name}
							</Typography>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
								{[p.companyName, t(KIND_KEY[p.type])].filter(Boolean).join(" · ")}
							</Typography>
						</Box>
						<Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
							<Typography sx={{ ...numericSx, fontSize: 12, fontWeight: 600, color: tone.color }}>
								{p.balance === 0 ? "—" : formatCurrency(Math.abs(p.balance))}
							</Typography>
							<Typography sx={{ fontSize: 11, color: "text.disabled" }}>
								{t(tone.shortKey)}
							</Typography>
						</Box>
					</Box>
				);
			}}
			slotProps={dropdownSlotProps}
			sx={{
				"& .MuiOutlinedInput-root": { py: "5px", pl: "8px" },
			}}
		/>
	);
};

export default PartnerPicker;
