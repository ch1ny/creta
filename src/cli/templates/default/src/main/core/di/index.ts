interface IRegisterOptions {
	identifier?: string;
	/**
	 * 立即实例化
	 */
	instant?: boolean;
	/**
	 * 实例化参数，仅在立即实例化时生效
	 */
	args?: any[];
}

/**
 * 依赖注入容器
 */
class Container {
	private static instanceMap = new Map<string, new (...args: any[]) => any | any>();

	static register(ctor: new (...args: any[]) => any, options?: IRegisterOptions) {
		const { identifier, instant, args } = options || {};

		ctor.toString = identifier ? () => identifier : () => ctor.name;

		const exactIdentifier = ctor.toString();

		if (this.instanceMap.has(exactIdentifier))
			throw new Error(`标识为 "${exactIdentifier}" 的服务已被注册`);

		if (instant) {
			this.instanceMap.set(exactIdentifier, new ctor(...(args || [])));
		} else {
			const that = this;
			const proxy = new Proxy(
				{},
				{
					get(_, p) {
						const instance = new ctor(...(args || []));

						that.instanceMap.set(exactIdentifier, instance);
						return instance[p];
					},
				}
			);
			this.instanceMap.set(exactIdentifier, proxy as any);
		}
	}

	static find<T>(ctor: new (...args: any[]) => T) {
		const instance = this.instanceMap.get(ctor.toString());
		if (!instance) throw new Error('该Service未注册');

		return instance as any;
	}
}

export interface IServiceOptions {
	/**
	 * 标识符
	 */
	identifier?: string;
	/**
	 * 立即实例化
	 */
	instant?: boolean;
	/**
	 * 实例化参数，仅在立即实例化时生效
	 */
	args?: any[];
}
export function Service(options?: IServiceOptions) {
	const { identifier, instant, args } = options || {};

	/**
	 * 返回类装饰器
	 * @param target 被装饰的类
	 */
	return function Class(target: new (...args: any[]) => any) {
		Container.register(target, { identifier, instant, args });
	};
}

export function Inject(injectable: new (...args: any[]) => any) {
	/**
	 * 返回属性装饰器
	 * @param target 被装饰的类
	 * @param propertyKey 被装饰类的属性名
	 */
	return function Property(target: Object, propertyKey: string | symbol) {
		target[propertyKey as keyof typeof target] = Container.find(injectable);
	};
}
