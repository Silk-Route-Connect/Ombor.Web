import React from "react";
import { useTranslation } from "react-i18next";

import { ListItemButton, ListItemText } from "@mui/material";

import { ChildNavItem } from "../config";
import { navLabelSx, subItemSx } from "./styles";

interface SubItemProps {
	item: ChildNavItem;
	active: boolean;
	onClick: () => void;
}

/** A child page under an expanded group. */
export default function SubItem({ item, active, onClick }: Readonly<SubItemProps>) {
	const { t } = useTranslation();

	return (
		<ListItemButton
			onClick={onClick}
			aria-current={active ? "page" : undefined}
			sx={subItemSx(active)}
		>
			<ListItemText
				primary={t(item.labelKey)}
				slotProps={{ primary: { sx: navLabelSx(active) } }}
			/>
		</ListItemButton>
	);
}
