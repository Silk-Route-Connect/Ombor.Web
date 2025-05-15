export type Loadable<T> = T | "loading";

export function isLoading<T>(...elements: Loadable<T>[]): boolean {
	return elements.some((el) => el === "loading");
}
