import type { ComponentType } from "react";
import { SearchGroupKey } from "models/search";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { SvgIconProps } from "@mui/material";

/** One glyph per result group — the sidebar's module icons where the module has one. */
export const SEARCH_GROUP_ICONS: Record<SearchGroupKey, ComponentType<SvgIconProps>> = {
	partners: HandshakeOutlinedIcon,
	products: Inventory2OutlinedIcon,
	documents: ReceiptLongOutlinedIcon,
	employees: BadgeOutlinedIcon,
	warehouses: WarehouseOutlinedIcon,
	wallets: AccountBalanceWalletOutlinedIcon,
};

export const SEARCH_DIALOG_ID = "global-search-dialog";
export const SEARCH_LISTBOX_ID = "global-search-results";

/** DOM id of a result row — the input's `aria-activedescendant` points at it. */
export const searchOptionDomId = (key: string): string => `global-search-option-${key}`;
