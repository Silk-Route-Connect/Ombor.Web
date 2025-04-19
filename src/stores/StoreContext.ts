import { createContext, useContext } from 'react';
import { stores, RootStoreType } from './RootStore';

export const StoreContext = createContext<RootStoreType>(stores);

export const useStore = () => useContext(StoreContext);
