import { ElementType } from "react";

import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

export type OnboardingStepKey = "products" | "stock" | "sale" | "team";

export interface OnboardingStepDef {
	key: OnboardingStepKey;
	icon: ElementType;
}

/**
 * The one getting-started list (ux-2): the register welcome previews it, the
 * dashboard checklist ticks it off from the organisation's real data. Stock comes
 * before the first sale because the POS refuses to sell what isn't on hand; no
 * partner step — every organisation starts with the «Розничный покупатель»
 * partner for walk-in sales. Texts: `onboarding.step.<key>.title|body`.
 */
export const ONBOARDING_STEPS: readonly OnboardingStepDef[] = [
	{ key: "products", icon: Inventory2OutlinedIcon },
	{ key: "stock", icon: WarehouseOutlinedIcon },
	{ key: "sale", icon: PointOfSaleOutlinedIcon },
	{ key: "team", icon: GroupAddOutlinedIcon },
];
