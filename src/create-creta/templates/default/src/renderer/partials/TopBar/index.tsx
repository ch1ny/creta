import { BatchFoldingIcon, BorderIcon, CloseIcon, MinusIcon } from '@/components/icon';
import React, { useEffect, useState } from 'react';
import styles from './index.module.less';

const { ipc } = window;
const DRAG_BAR_BUTTON_EVENT = 'DRAG_BAR.BUTTONS_ONCLICK';

export const TopBar: React.FC = () => {
	const [isMaximized, setIsMaximized] = useState(false);
	useEffect(() => {
		ipc.on('WINDOW.ON_MAXIMIZE', () => {
			setIsMaximized(true);
		});
		ipc.on('WINDOW.ON_UNMAXIMIZE', () => {
			setIsMaximized(false);
		});
	}, []);

	return (
		<div className={styles.dragBar}>
			<div className={styles.rightButtonWrapper}>
				<div
					className={styles.rightButton}
					onClick={() => {
						ipc.send(DRAG_BAR_BUTTON_EVENT, 0);
					}}>
					<MinusIcon />
				</div>
				<div
					className={styles.rightButton}
					onClick={() => {
						ipc.send(DRAG_BAR_BUTTON_EVENT, 1);
					}}>
					{isMaximized ? <BatchFoldingIcon /> : <BorderIcon />}
				</div>
				<div
					className={styles.rightButton}
					onClick={() => {
						ipc.send(DRAG_BAR_BUTTON_EVENT, -1);
					}}>
					<CloseIcon />
				</div>
			</div>
		</div>
	);
};
