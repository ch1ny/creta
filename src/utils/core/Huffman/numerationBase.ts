/**
 * @title 进制转换 工具类
 */

/**
 * 十六进制字符
 */
const HEX_CHAR_MAP = [
	'0',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
];

/**
 * 二进制字符串转换为十六进制字符串
 * @param binString 二进制字符串
 * @return 十六进制字符串
 */
export const binStringToHexString = (binString: string) => {
	// 1. 补充前导零
	const preZero = 4 - (binString.length % 4 || 4);
	let binStr = `${new Array(preZero).fill(0).join('')}${binString}`;

	// 2. 计算十六进制字符串
	let hexStr = '';
	while (!!binStr.length) {
		const nibbleStr = binStr.slice(0, 4);
		const nibbleValue = Number(`0b${nibbleStr}`);
		const nibbleChar = HEX_CHAR_MAP[nibbleValue];
		hexStr += nibbleChar;
		binStr = binStr.slice(4);
	}
	return hexStr;
};

/**
 * 十六进制字符串转换为二进制字符串
 * @param hexString 十六进制字符串
 * @returns 二进制字符串
 */
export const hexStringToBinString = (hexString: string) => {
	return hexString
		.split('')
		.map((hexChar) => {
			const binStr = Number(`0x${hexChar}`).toString(2);
			return `${new Array(4 - binStr.length).fill(0).join('')}${binStr}`;
		})
		.join('');
};

/**
 * 字符串转字节数组
 * @param str 待转换的字符串
 * @returns 转换后的字节数组
 */
export const stringToBytes = (str: string) => {
	var bytes = new Array<number>();
	var len, c;
	len = str.length;
	for (var i = 0; i < len; i++) {
		c = str.charCodeAt(i);
		if (c >= 0x010000 && c <= 0x10ffff) {
			bytes.push(((c >> 18) & 0x07) | 0xf0);
			bytes.push(((c >> 12) & 0x3f) | 0x80);
			bytes.push(((c >> 6) & 0x3f) | 0x80);
			bytes.push((c & 0x3f) | 0x80);
		} else if (c >= 0x000800 && c <= 0x00ffff) {
			bytes.push(((c >> 12) & 0x0f) | 0xe0);
			bytes.push(((c >> 6) & 0x3f) | 0x80);
			bytes.push((c & 0x3f) | 0x80);
		} else if (c >= 0x000080 && c <= 0x0007ff) {
			bytes.push(((c >> 6) & 0x1f) | 0xc0);
			bytes.push((c & 0x3f) | 0x80);
		} else {
			bytes.push(c & 0xff);
		}
	}
	return bytes;
};
