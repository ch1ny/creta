interface IScriptCallbackParameters {
	/**
	 * 当前环境
	 */
	env: 'development' | 'production';
}

type TScriptCallback = (params: IScriptCallbackParameters) => void;

export const defineScriptCallback = (cb: TScriptCallback) => {
	const CRETA_ENV = (process.env.CRETA_ENV || 'development') as IScriptCallbackParameters['env'];

	cb({
		env: CRETA_ENV,
	});
};
