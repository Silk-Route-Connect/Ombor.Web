import { SortOrder } from "components/shared/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, runInAction } from "mobx";
import { CreatePaymentRequest, Payment, PaymentType } from "models/payment";
import PaymentApi from "services/api/PaymentApi";

import { NotificationStore } from "./NotificationStore";

interface IPaymentStore {
	allPayments: Loadable<Payment[]>;
	incomes: Loadable<Payment[]>;
	expenses: Loadable<Payment[]>;
	filteredPayments: Loadable<Payment[]>;
	selectedPayment: Loadable<Payment> | null;
	isSaving: boolean;

	// client-side controls
	searchTerm: string;
	filterType: PaymentType | null;
	filterPartnerId: number | null;
	sortField: keyof Payment | null;
	sortOrder: SortOrder;

	// actions
	getAll(): Promise<void>;
	getById(paymentId: number): Promise<void>;
	create(request: CreatePaymentRequest): Promise<void>;

	// setters for filters & sorting
	setSearch(searchTerm: string): void;
	setFilterType(type: PaymentType | null): void;
	setFilterPartner(partnerId: number | null): void;
	setSort(field: keyof Payment, order: SortOrder): void;
}

export class PaymentStore implements IPaymentStore {
	private readonly notificationStore: NotificationStore;

	allPayments: Loadable<Payment[]> = [];
	selectedPayment: Loadable<Payment> | null = null;
	isSaving: boolean = false;
	searchTerm: string = "";
	filterType: PaymentType | null = null;
	filterPartnerId: number | null = null;
	sortField: keyof Payment | null = null;
	sortOrder: SortOrder = "asc";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this);
	}

	get filteredPayments(): Loadable<Payment[]> {
		if (this.allPayments === "loading") {
			return "loading";
		}

		let payments = this.allPayments;

		if (this.filterType) {
			payments = payments.filter((el) => el.type === this.filterType);
		}

		if (this.filterPartnerId) {
			payments = payments.filter((el) => el.partnerId === this.filterPartnerId);
		}

		if (this.searchTerm) {
			payments = payments.filter((el) =>
				el.notes?.toLocaleLowerCase(this.searchTerm.toLowerCase()),
			);
		}

		return payments;
	}

	get incomes(): Loadable<Payment[]> {
		if (this.filteredPayments === "loading") {
			return "loading";
		}

		return this.filteredPayments.filter((el) => el.direction === "Income");
	}

	get expenses(): Loadable<Payment[]> {
		if (this.filteredPayments === "loading") {
			return "loading";
		}

		return this.filteredPayments.filter((el) => el.direction === "Expense");
	}

	async getAll(): Promise<void> {
		if (this.allPayments === "loading") {
			return;
		}

		runInAction(() => (this.allPayments = "loading"));
		const result = await tryRun(() => PaymentApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.getAll"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allPayments = data));
	}

	async getById(paymentId: number): Promise<void> {
		if (this.selectedPayment === "loading") {
			return;
		}

		runInAction(() => (this.selectedPayment = "loading"));
		const result = await tryRun(() => PaymentApi.getById(paymentId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.getById"));
		}

		const data = result.status === "fail" ? null : result.data;
		runInAction(() => (this.selectedPayment = data));
	}

	async create(request: CreatePaymentRequest): Promise<void> {
		const result = await tryRun(() => PaymentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(translate("payments.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allPayments === "loading") {
				return;
			}

			this.allPayments = [result.data, ...this.allPayments];
			this.selectedPayment = result.data;
			this.notificationStore.success("payments.success.create");
		});
	}

	setSearch(searchTerm: string): void {
		this.searchTerm = searchTerm;
	}

	setFilterType(type: PaymentType | null): void {
		this.filterType = type;
	}

	setFilterPartner(partnerId: number | null): void {
		if (!partnerId) {
			this.filterPartnerId = null;
		} else {
			this.filterPartnerId = partnerId;
		}
	}

	setSort(field: keyof Payment, order: SortOrder): void {
		this.sortField = field;
		this.sortOrder = order;
	}
}
