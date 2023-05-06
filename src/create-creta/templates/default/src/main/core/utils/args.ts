export const parseSingleArgv = (argv: string): { key: string; value?: any } => {
	const [key, ...value] = argv.split('=');
	if (!value.length)
		return {
			key,
		};
	else if (value.length === 1)
		return {
			key,
			value: value[0],
		};
	return {
		key,
		value,
	};
};

export const parseArgvArrayToJson = (arr: { key: string; value?: unknown }[]) => {
	const object: Record<string, any> = {};
	arr.forEach(({ key, value }) => {
		object[`${key}`] = value;
	});
	return object;
};
