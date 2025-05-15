import React, { createContext, FC, ReactNode, useContext } from "react";

import { rootStore, RootStoreType } from "./RootStore";

const StoreContext = createContext<RootStoreType | null>(null);

export const StoreProvider: FC<{
	children: ReactNode;
}> = ({ children }) => <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;

export function useStore(): RootStoreType {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("useStore must be used within a StoreProvider");
	}
	return store;
}
