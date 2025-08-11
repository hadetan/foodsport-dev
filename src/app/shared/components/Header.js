'use client';

import Image from 'next/image';
import styles from '@/app/shared/css/Header.module.css';
import Link from 'next/link';
import { useAuth } from '@/app/shared/contexts/authContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsCart2 } from 'react-icons/bs';
import { FaSearch } from 'react-icons/fa';
import Avatar from './avatar';
import AvatarSkeleton from './skeletons/AvatarSkeleton';
import { useUser } from '@/app/shared/contexts/userContext';

export default function Header() {
	const { authToken } = useAuth();
	const router = useRouter();
	const { user, loading } = useUser();
	const [mounted, setMounted] = useState(false);

	//#region This fixed the hydration error of mismatched authToken. The authToken is populated only after the mounting, so we wait to be mounted first before using the authToken.
	useEffect(() => {
		setMounted(true);
	}, []);
	if (!mounted) return null;
	//#endregion

	return (
		<header className={styles.headerWrapper}>
			{/* Grey Top Bar */}
			<div className={styles.greyTopBar}>
				<div className={styles.topBarRight}>
					<span className={`${styles.icon} ${styles.borderLeft}`}>
						<FaSearch />
					</span>
					<span className={`${styles.icon} ${styles.borderLeft}`}>
						<BsCart2 />
					</span>
					{authToken ? (
						loading ? (
							<AvatarSkeleton isNav={true} />
						) : (
							<Avatar
								srcAvatar={user.profilePictureUrl || undefined}
								firstName={user.firstname}
								lastName={user.lastname}
								isNav={true}
                				pointer={true}
							/>
						)
					) : (
						<Link href='/auth/login' className={styles.login}>
							LOGIN / REGISTER
						</Link>
					)}

					{/* Language Switch */}
					<span
						className={`${styles.langSwitch} ${styles.borderLeft}`}
					>
						繁 / EN
					</span>
				</div>
			</div>
			{/* White Nav Bar with Centered Logo */}
			<div className={styles.whiteNavBar}>
				<div className={styles.topBarLeft}>
					<span className={styles.menuIcon}>&#9776;</span>
				</div>
				<div className={styles.logoContainer}>
					<Image
						src='/logo.png'
						alt='Foodsport Logo'
						width={220}
						height={60}
						priority
					/>
				</div>
			</div>
			<nav className={styles.navBar}>
				<ul className={styles.navList}>
					<li className={styles.active}>
						<Link
							href={authToken ? '/my/' : '/'}
							style={{ textDecoration: 'none', color: 'inherit' }}
						>
							HOME
						</Link>
					</li>
					<li>
						<Link
							href={authToken ? '/my/activities' : '/activities'}
							style={{ textDecoration: 'none', color: 'inherit' }}
						>
							JOIN ACTIVITIES
						</Link>
					</li>
					<li>REDEEM REWARDS</li>
					<li>HOW DOES IT WORK</li>
				</ul>
			</nav>
		</header>
	);
}
