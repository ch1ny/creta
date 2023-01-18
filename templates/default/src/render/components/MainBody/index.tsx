import React, { useEffect, useState } from 'react';
import styles from './index.less';

const strArr = ['React', 'Electron', 'TypeScript'];
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
			<img
				className={styles.image}
				src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjZmZmIi8+CiAgPGcgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K'
			/>
			{strArr.map((str) => (
				<div key={str} className={styles.text}>
					Hello {str}
				</div>
			))}
			<div className={styles.loadingAnime}>
				{iArr.map((_, index) => (
					<i key={`loadingAnime_${index}`} />
				))}
			</div>
			<div className={styles.text}>版本号: {version}</div>
		</div>
	);
};
