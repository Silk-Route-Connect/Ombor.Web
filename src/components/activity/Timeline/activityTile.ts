import { KindPresentation, kindPresentation } from "components/shared/Chip/movementKind";
import { ActivityItem, ActivityRecordKind } from "models/activity";
import { currentValue, findField, findPrimaryChange } from "utils/activity/activitySentence";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CompareArrowsOutlinedIcon from "@mui/icons-material/CompareArrowsOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

const NEUTRAL = "neutral" as const;

/**
 * The leading tile of a timeline row, by the record the operation is about:
 * documents in their type hue (the shared movement-kind presentation), payments
 * green / red by direction like their amount, everything else neutral with the
 * module's own icon — so the log reads at a glance without a chip per row.
 */
const RECORD_TILE: Record<ActivityRecordKind, KindPresentation> = {
	Sale: kindPresentation("Sale"),
	Supply: kindPresentation("Supply"),
	SaleRefund: kindPresentation("SaleRefund"),
	SupplyRefund: kindPresentation("SupplyRefund"),
	Adjustment: kindPresentation("Adjustment"),
	Transfer: kindPresentation("Transfer"),
	OpeningStock: kindPresentation("Opening"),
	Payment: { token: NEUTRAL, icon: PaymentsOutlinedIcon },
	Payroll: { token: "expense", icon: PaymentsOutlinedIcon },
	WalletTransfer: { token: NEUTRAL, icon: CompareArrowsOutlinedIcon },
	Order: { token: NEUTRAL, icon: AssignmentOutlinedIcon },
	Product: { token: NEUTRAL, icon: Inventory2OutlinedIcon },
	Category: { token: NEUTRAL, icon: CategoryOutlinedIcon },
	Partner: { token: NEUTRAL, icon: HandshakeOutlinedIcon },
	Wallet: { token: NEUTRAL, icon: AccountBalanceWalletOutlinedIcon },
	Warehouse: { token: NEUTRAL, icon: WarehouseOutlinedIcon },
	Employee: { token: NEUTRAL, icon: BadgeOutlinedIcon },
	Template: { token: NEUTRAL, icon: ShoppingBasketOutlinedIcon },
	Organization: { token: NEUTRAL, icon: BusinessOutlinedIcon },
	User: { token: NEUTRAL, icon: PersonOutlineOutlinedIcon },
};

export function activityTile(item: ActivityItem): KindPresentation {
	const kind = item.primary.entityKind as ActivityRecordKind;
	const tile = RECORD_TILE[kind] ?? { token: NEUTRAL, icon: Inventory2OutlinedIcon };
	if (kind === "Payment") {
		const direction = currentValue(findField(findPrimaryChange(item), "direction"));
		if (direction === "Income") return { ...tile, token: "income" };
		if (direction === "Expense") return { ...tile, token: "expense" };
	}
	return tile;
}
