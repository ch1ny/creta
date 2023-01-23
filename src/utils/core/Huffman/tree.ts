import { binStringToHexString, hexStringToBinString } from './numerationBase';

class TreeNode {
	constructor(
		public char: string, // 待编码的字符
		public times: number, // 字符出现的次数
		public left: TreeNode | null = null,
		public right: TreeNode | null = null
	) {}
}

export class HuffmanTree {
	readonly codesMap: Record<string, string>;

	constructor(private originalString: string) {
		// 1. 统计字符出现频率
		const charMap: Record<string, number> = {};

		for (let index = 0; index < originalString.length; index++) {
			charMap[originalString[index]] = ~~charMap[originalString[index]] + 1;
		}

		// 2. 构建哈夫曼树
		const huffmanRoot = HuffmanTree.buildHuffmanTree(charMap);

		// 3. 遍历哈夫曼树，获取编码表
		this.codesMap = HuffmanTree.getHuffmanCodes(huffmanRoot);
	}

	private _binaryString: string = '';
	get binString() {
		if (!this._binaryString) {
			let index = 0;
			while (index < this.originalString.length)
				this._binaryString += this.codesMap[this.originalString[index++]];
		}

		return this._binaryString;
	}

	/**
	 * 获取十六进制编码，
	 * 其前方的 \*x 表示补充了多少位前导零，
	 * 比如 `3x1b` 的转换规则如下：
	 * 1. 首先 `1b` 对应的二进制为 `00011001`
	 * 2. `3x` 表示该数补充了 3 位前导零
	 * 3. 则实际上的二进制字符串为 `11001`
	 */
	get hexString() {
		const binaryStr = this.binString;

		return `${4 - (binaryStr.length % 4 || 4)}x${binStringToHexString(binaryStr)}`;
	}

	decodeSelf() {
		return HuffmanTree.decode(this.binString, this.codesMap);
	}

	static buildHuffmanTree(charMap: Record<string, number>) {
		// 以各字符出现次数为节点值构造森林
		const forest: TreeNode[] = [];
		for (const char in charMap) {
			forest.push(new TreeNode(char, charMap[char]));
		}

		// 等到森林只剩一个节点表示合并结束
		while (forest.length !== 1) {
			// 找到森林中最小的两棵树进行合并
			forest.sort((a, b) => a.times - b.times);

			const aNode = <TreeNode>forest.shift(),
				bNode = <TreeNode>forest.shift();
			const node = new TreeNode('', aNode.times + bNode.times, aNode, bNode);
			forest.push(node);
		}

		return forest[0];
	}

	static getHuffmanCodes(huffmanRoot: TreeNode) {
		const hash: Record<string, string> = {}; // 对照表
		const traversal = (node: TreeNode, curPath: string) => {
			if (!node.left && !node.right) return;

			if (!!node.left && !node.left.left && !node.left.right) {
				hash[node.left.char] = curPath + '0';
			}

			if (!!node.right && !node.right.left && !node.right.right) {
				hash[node.right.char] = curPath + '1';
			}

			// 左遍历，路径加 0
			if (!!node.left) traversal(node.left, `${curPath}0`);

			// 右遍历，路径加 1
			if (!!node.right) traversal(node.right, `${curPath}1`);
		};
		traversal(huffmanRoot, '');
		return hash;
	}

	static decode(binaryStr: string, codesMap: Record<string, string>) {
		const reverseCodesMap: Record<string, string> = {};
		for (const str in codesMap) {
			const code = codesMap[str];
			reverseCodesMap[code] = str;
		}

		let originStr = `${binaryStr}`;
		let result = '';
		const decodeStr = (str: string) => {
			if (!str.length) return;

			let len = 1;
			while (reverseCodesMap[str.slice(0, len)] === undefined) len++;

			result += reverseCodesMap[str.slice(0, len)];

			originStr = str.slice(len);
		};
		while (!!originStr.length) {
			decodeStr(originStr);
		}

		return result;
	}

	static decodeHex(hexStr: string, codesMap: Record<string, string>) {
		if (hexStr.slice(1, 2) !== 'x') throw Error('Invalid hex huffman string!');

		const preZero = Number(hexStr.slice(0, 1));
		if (preZero >= 0 && preZero < 4) {
			const binaryStr = hexStringToBinString(hexStr.slice(2));
			if (!binaryStr.startsWith(new Array(preZero).fill('0').join('')))
				throw Error('Invalid decoded hex huffman string!');

			return this.decode(binaryStr.slice(preZero), codesMap);
		} else {
			throw Error('Invalid pre-zero length!');
		}
	}
}
