import { KindPresentation, kindPresentation } from "components/shared/Chip/movementKind";
import { ActivityRecordKind } from "models/activity";

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
 * The tile of each kind of record — one glyph + tint per record wherever it is
 * named by a tile: the activity-log row and the header of the modal that
 * creates or shows it. Documents take their type hue (the shared movement-kind
 * presentation); payroll is an expense; everything else is neutral and told
 * apart by its module glyph.
 */
export const RECORD_TILE: Record<ActivityRecordKind, KindPresentation> = {
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

export const FALLBACK_RECORD_TILE: KindPresentation = {
	token: NEUTRAL,
	icon: Inventory2OutlinedIcon,
};

export const recordTile = (kind: ActivityRecordKind): KindPresentation =>
	RECORD_TILE[kind] ?? FALLBACK_RECORD_TILE;
