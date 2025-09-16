'use client';

import { useUser } from '@/app/shared/contexts/userContext';
import '@/app/[locale]/my/css/profile.css';
import Avatar from '@/app/shared/components/avatar';
import AvatarSkeleton from '@/app/shared/components/skeletons/AvatarSkeleton';
import UserProfileCard from '../components/UserProfileCard';
import ProfilePageSkeleton from '@/app/shared/components/skeletons/ProfilePageSkeleton';
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
	const { user, loading } = useUser();
	const t = useTranslations('ProfilePage');

	if (!user || Object.keys(user).length === 0) {
		return <ProfilePageSkeleton />;
	}

	const displayName = `${user.firstname} ${user.lastname}`;
	const userId = `# ${user.id}`;
	const caloriesDonated = user.totalCaloriesDonated;
	const fsPoints = Math.floor(user.totalCaloriesDonated / 500);
	const activitiesJoined = user.joinedActivityIds.length;
	const badges = user.userBadges.length;

	return (
		<div>
			<div className='profile-page-container'>
				<div className='profile-main-row'>
					<div className='profile-left'>
						<div className='profile-avatar-wrapper'>
							{loading ? (
								<div className='w-20 h-20 md:w-28 md:h-28'>
									<AvatarSkeleton isNav={false} />
								</div>
							) : (
								<div className='w-20 h-20 md:w-28 md:h-28'>
									<Avatar
										srcAvatar={
											user.profilePictureUrl || undefined
										}
										firstName={user.firstname || ''}
										lastName={user.lastname || ''}
										isNav={true}
										isProfile={true}
										pointer={false}
										size='24'
									/>
								</div>
							)}
							{/* <div className='profile-level-badge'>
								{user.level || 1}
							</div> */}
						</div>
						<div className='profile-meta'>
							<div className='profile-name'>
								{displayName}
							</div>
							<div className='profile-id'>
								{userId}
							</div>
						</div>
					</div>
					<div className='profile-right'>
						<div className='profile-stats-grid'>
							<div className='profile-stat stat-orange'>
								<span className='ribbon orange'></span>
								<div className='stats p-3'>
									<div className='stat-value text-xl md:text-2xl font-bold'>
										{caloriesDonated.toLocaleString()}
									</div>
									<div className='stat-label text-sm'>
										{t('stats.caloriesLabel')}
									</div>
								</div>
							</div>
							<div className='profile-stat stat-blue'>
								<span className='ribbon blue'></span>
								<div className='stats p-3'>
									<div className='stat-value text-xl md:text-2xl font-bold'>{fsPoints}</div>
									<div className='stat-label text-sm'>
										{t('stats.fsPointsLabel')}
									</div>
								</div>
							</div>
							<div className='profile-stat stat-purple'>
								<span className='ribbon purple'></span>
								<div className='stats p-3'>
									<div className='stat-value text-xl md:text-2xl font-bold'>
										{activitiesJoined}
									</div>
									<div className='stat-label text-sm'>
										{t('stats.activitiesLabel')}
									</div>
								</div>
							</div>
							<div className='profile-stat stat-pink'>
								<span className='ribbon pink'></span>
								<div className='stats p-3'>
									<div className='stat-value text-xl md:text-2xl font-bold'>{badges}</div>
									<div className='stat-label text-sm'>
										{t('stats.badgesLabel')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<UserProfileCard />
		</div>
	);
}
