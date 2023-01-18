import React from 'react';
import styles from './App.less';
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
