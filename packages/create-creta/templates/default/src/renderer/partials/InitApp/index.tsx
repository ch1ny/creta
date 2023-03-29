import { CretaLogo } from '@/components/icon';
import { useEffect } from 'react';
import styles from './index.module.less';

const MIN_TIME = 1500;
const iArr = new Array(5).fill(undefined);

export const InitApp = ({ afterInit }: { afterInit: () => void }) => {
	useEffect(() => {
		const start = Date.now();
		setTimeout(afterInit, MIN_TIME - Date.now() + start);
	}, []);

	return (
		<div className={styles.initApp}>
			<div className={styles.image}>
				<CretaLogo />
			</div>
			<div className={styles.text}>Now Loading Creta...</div>
			<div className={styles.loadingAnime}>
				{iArr.map((_, index) => (
					<i key={`loadingAnime_${index}`} />
				))}
			</div>
		</div>
	);
};
