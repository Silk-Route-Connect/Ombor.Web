import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { Partner, PartnerType } from "models/partner";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Autocomplete, Box, createFilterOptions, TextField, Typography } from "@mui/material";

import { dropdownSlotProps } from "./dropdownSx";
import PosPartnerCreate from "./PosPartnerCreate";
import { balancePresentation } from "./saleBalance";

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

/** The last row of the dropdown: create a partner from what was typed. */
interface CreatePartnerOption {
	createNew: true;
	typed: string;
}

type PickerOption = Partner | CreatePartnerOption;

const isCreateOption = (option: PickerOption): option is CreatePartnerOption =>
	"createNew" in option;

const partnerLabel = (p: Partner): string =>
	p.companyName ? `${p.name} · ${p.companyName}` : p.name;

const filterPartners = createFilterOptions<Partner>({ stringify: partnerLabel });

/**
 * Partner / supplier typeahead for the New Sale / New Supply header (and New
 * Order). There is no system walk-in partner — a counterparty is always required
 * (rule 39). Each option shows the served balance as colour + a natural-language
 * label (locked pattern 4). The last row always offers «+ Новый клиент /
 * поставщик», which opens the partner form over the page and picks the result,
 * so a new customer never costs the cart.
 */
export const PartnerPicker: React.FC<PartnerPickerProps> = ({
	direction,
	partner,
	partners,
	error,
	onPick,
}) => {
	const { t } = useTranslation();
	/** What was typed when «+ Новый …» opened the partner form; null while it's closed. */
	const [creating, setCreating] = useState<string | null>(null);

	return (
		<>
			<Autocomplete<PickerOption>
				options={partners}
				value={partner}
				openOnFocus
				onChange={(_, next) => {
					if (next && isCreateOption(next)) {
						setCreating(next.typed);
						return;
					}
					onPick(next);
				}}
				filterOptions={(options, state) => [
					...filterPartners(
						options.filter((o): o is Partner => !isCreateOption(o)),
						state,
					),
					{ createNew: true, typed: state.inputValue.trim() },
				]}
				getOptionLabel={(o) => (isCreateOption(o) ? o.typed : partnerLabel(o))}
				isOptionEqualToValue={(a, b) => !isCreateOption(a) && !isCreateOption(b) && a.id === b.id}
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
				renderOption={(props, o) => {
					if (isCreateOption(o)) {
						return (
							<Box
								component="li"
								{...props}
								key="create-partner"
								sx={{ gap: "12px", color: "primary.main", fontWeight: 600, fontSize: 14 }}
							>
								<Box
									sx={{
										width: 34,
										height: 34,
										flexShrink: 0,
										display: "grid",
										placeItems: "center",
										borderRadius: "50%",
										border: "1px dashed",
										borderColor: "primary.main",
									}}
								>
									<AddIcon sx={{ fontSize: 18 }} />
								</Box>
								{o.typed
									? t(`transaction.new.partner.createNamed.${direction}`, { name: o.typed })
									: t(`transaction.new.partner.create.${direction}`)}
							</Box>
						);
					}
					const tone = balancePresentation(o.balance);
					return (
						<Box component="li" {...props} key={o.id} sx={{ gap: "12px" }}>
							<EntityAvatar name={o.name} size={34} />
							<Box sx={{ flex: 1, minWidth: 0 }}>
								<Typography sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }} noWrap>
									{o.name}
								</Typography>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
									{[o.companyName, t(KIND_KEY[o.type])].filter(Boolean).join(" · ")}
								</Typography>
							</Box>
							<Box sx={{ textAlign: "right", flex: "0 0 auto" }}>
								<Typography sx={{ ...numericSx, fontSize: 12, fontWeight: 600, color: tone.color }}>
									{o.balance === 0 ? "—" : formatCurrency(Math.abs(o.balance))}
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
			<PosPartnerCreate
				direction={direction}
				typed={creating}
				onClose={() => setCreating(null)}
				onCreated={onPick}
			/>
		</>
	);
};

export default PartnerPicker;
