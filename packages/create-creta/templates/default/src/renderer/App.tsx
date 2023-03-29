import { useState } from 'react';
import styles from './App.module.less';
import { InitApp, MainBody, TopBar } from './partials';

export default () => {
	const [initAlready, setInitAlready] = useState(false);

	return (
		<div className={styles.app}>
			<TopBar />
			{initAlready ? (
				<MainBody />
			) : (
				<InitApp
					afterInit={() => {
						setInitAlready(true);
					}}
				/>
			)}
		</div>
	);
};
