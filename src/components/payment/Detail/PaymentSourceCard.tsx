import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import UzsUnit from "components/shared/Money/UzsUnit";
import WalletLink from "components/wallet/Links/WalletLink";
import { WALLET_TYPE_META } from "components/wallet/WalletPresentation";
import { PaymentRecord } from "models/payment";
import { chipTokens, numericSx, radius } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { Box } from "@mui/material";

/** Касса (source) card — one line per source: the wallet (linked) or the advance, and its amount (rule 9). */
export const PaymentSourceCard: React.FC<{ payment: PaymentRecord }> = ({ payment }) => {
	const { t } = useTranslation();
	return (
		<DetailCard
			icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />}
			title={t("payment.detail.source")}
		>
			<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
				{payment.sources.map((s) => {
					const meta = s.walletType ? WALLET_TYPE_META[s.walletType] : null;
					const Icon = meta?.Icon ?? AccountBalanceWalletOutlinedIcon;
					const tile = chipTokens[meta?.token ?? "saffron"];
					return (
						<Box
							key={s.id}
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: "14px",
							}}
						>
							<Box sx={{ display: "inline-flex", alignItems: "center", gap: "11px" }}>
								<Box
									sx={{
										width: 38,
										height: 38,
										borderRadius: `${radius.md}px`,
										display: "grid",
										placeItems: "center",
										bgcolor: tile.bg,
										color: tile.color,
									}}
								>
									<Icon sx={{ fontSize: 18 }} />
								</Box>
								{s.sourceType === "Wallet" ? (
									<span>
										{s.walletId && s.walletName ? (
											<WalletLink id={s.walletId} name={s.walletName} />
										) : (
											s.walletName
										)}{" "}
										<Box component="span" sx={{ color: "text.secondary" }}>
											· {meta ? t(meta.labelKey) : ""}
										</Box>
									</span>
								) : (
									<Box component="span" sx={{ fontWeight: 600 }}>
										{t("payment.detail.advanceSource")}
									</Box>
								)}
							</Box>
							<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 16 }}>
								{formatCurrency(s.amount)}
								<UzsUnit />
							</Box>
						</Box>
					);
				})}
			</Box>
		</DetailCard>
	);
};

export default PaymentSourceCard;
