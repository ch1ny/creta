import styles from './App.module.less';
import { MainBody, TopBar } from './components';

console.log(styles);

export default () => {
	return (
		<div className={styles.app}>
			<TopBar />
			<MainBody />
		</div>
	);
};
