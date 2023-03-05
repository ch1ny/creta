import styles from './App.module.less';
import { MainBody, TopBar } from './components';

export default () => {
	return (
		<div className={styles.app}>
			<TopBar />
			<MainBody />
		</div>
	);
};
