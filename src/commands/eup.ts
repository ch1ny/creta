import { EUP } from '../utils';

export default async (
	sourcePath: string,
	targetPath: string,
	props: {
		decompress: boolean;
	}
) => {
	if (props.decompress) {
		await EUP.decompress(sourcePath, targetPath);
	} else {
		await EUP.compress(sourcePath, targetPath);
	}
};
