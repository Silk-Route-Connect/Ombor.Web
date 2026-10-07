import { KindPresentation } from "components/shared/Chip/movementKind";
import { AdjustmentDirection } from "models/stockAdjustment";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const DECREASE: KindPresentation = { token: "stockOut", icon: RemoveIcon };
const INCREASE: KindPresentation = { token: "stockIn", icon: AddIcon };

/**
 * How an adjustment direction reads wherever it is named (list chip, form
 * option): the sign its quantity carries — «−» Списание, «+» Приход товара — in
 * the stock hues (amber out, blue in; green/red stay with money). Arrows are
 * the money convention only (Приход / Расход, Нам должны / Мы должны): beside
 * «−7 т» an «↑ Списание» read as the opposite. Unknown served values read as
 * Increase.
 */
export const directionPresentation = (direction: AdjustmentDirection): KindPresentation =>
	direction === "Decrease" ? DECREASE : INCREASE;
