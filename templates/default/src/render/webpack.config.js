const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const DIRNAME = path.resolve(__dirname, '..', '..');

const devPort = require('../../config/dev.config').DEV_PORT;

module.exports = {
	devServer: {
		static: path.resolve(__dirname, 'public'),
		host: '127.0.0.1',
		port: devPort,
	},
	resolve: {
		extensions: ['.js', '.json', '.ts', '.tsx'],
		alias: {
			'@': __dirname,
		},
	},
	entry: path.resolve(__dirname, 'index.tsx'),
	output: {
		path: path.resolve(DIRNAME, 'build', 'render'),
		filename: 'index.[chunkhash:8].js',
	},
	module: {
		rules: [
			{
				test: /\.(le|c)ss$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							modules: {
								auto: () => true,
								localIdentName: '[local]_[hash:base64:8]',
							},
						},
					},
					'resolve-url-loader',
					{
						loader: 'less-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /\.tsx?$/,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: 'ts-loader',
					},
				],
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 1024, //对文件的大小做限制，1kb
						},
					},
				],
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: path.resolve(DIRNAME, 'public', 'index.html'),
		}),
	],
};
