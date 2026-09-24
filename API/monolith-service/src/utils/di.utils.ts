export function createLazyProxy<T extends object>(getServiceInstance: () => T): T {
	return new Proxy({} as T, {
		get(target, prop) {
			const service = getServiceInstance();
			if (!service) {
				throw new Error(`Service accessed before it was initialized!`);
			}
			const value = (service as any)[prop];
			return typeof value === "function" ? value.bind(service) : value;
		},
		set(target, prop, newValue) {
			const service = getServiceInstance();
			(service as any)[prop] = newValue;
			return true;
		},
	});
}
