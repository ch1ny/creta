import React, { useEffect, useState } from 'react';
import { CretaLogo } from '../CretaLogo';
import styles from './index.module.less';

const iArr = new Array(5).fill(undefined);

export const MainBody: React.FC = () => {
	const [version, setVersion] = useState('');

	useEffect(() => {
		window.ipc.invoke('APP.VERSION').then((value) => {
			setVersion(value);
		});
	}, []);

	return (
		<div className={styles.mainBody}>
			<div className={styles.image}>
				<CretaLogo />
			</div>
			<div className={styles.text}>Hello CRETA</div>
			<div className={styles.loadingAnime}>
				{iArr.map((_, index) => (
					<i key={`loadingAnime_${index}`} />
				))}
			</div>
			<div className={styles.text}>版本号: {version}</div>
		</div>
	);
};
