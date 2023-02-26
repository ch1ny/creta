import Theme from 'vitepress/theme';
import { h } from 'vue';
import SvgImage from './components/SvgImage.vue';
import './styles/vars.css';

export default {
	...Theme,
	Layout() {
		return h(Theme.Layout, null, {});
	},
	enhanceApp({ app }) {
		app.component('SvgImage', SvgImage);
	},
};
