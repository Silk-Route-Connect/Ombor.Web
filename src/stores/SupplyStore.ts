// src/stores/SupplyStore.ts
import { makeAutoObservable, runInAction } from "mobx";

import { Loadable } from "../helpers/helpers";
import { Supply } from "../models/supply";

export interface ISupplyStore {
	filteredSupplies: Loadable<Supply[]>;
	loadSupplies(params: { productId: number; from: string; to: string }): Promise<void>;
}

export class SupplyStore implements ISupplyStore {
	allSupplies: Loadable<Supply[]> = [];

	constructor() {
		makeAutoObservable(this);
	}

	get filteredSupplies(): Loadable<Supply[]> {
		return this.allSupplies;
	}

	async loadSupplies(params: { productId: number; from: string; to: string }) {
		const { productId, from, to } = params;
		console.log(from, to);
		this.allSupplies = "loading";
		await new Promise((r) => setTimeout(r, 500));

		const mock: Supply[] = [
			{
				id: 101,
				supplierName: "ООО «Поставщик»",
				supplierId: 301,
				date: new Date("2025-05-05"),
				items: [
					{ id: 201, productId, quantity: 5, unitPrice: 4000 },
					{ id: 202, productId: 999, quantity: 2, unitPrice: 3500 },
				],
				totalDue: 0,
				totalPaid: 0,
			},
			{
				id: 102,
				supplierName: "ЗАО «Импортер»",
				supplierId: 302,
				date: new Date("2025-05-11"),
				items: [{ id: 203, productId, quantity: 3, unitPrice: 4500 }],
				totalDue: 0,
				totalPaid: 0,
			},
			{
				id: 103,
				supplierName: "ЧП «Локальный»",
				supplierId: 303,
				date: new Date("2025-05-14"),
				items: [
					{ id: 204, productId, quantity: 1, unitPrice: 5000 },
					{ id: 205, productId, quantity: 4, unitPrice: 4200 },
				],
				totalDue: 0,
				totalPaid: 0,
			},
		];

		const filtered = mock.filter((s) => s.items.some((i) => i.productId === productId));

		runInAction(() => {
			this.allSupplies = filtered;
		});
	}
}
