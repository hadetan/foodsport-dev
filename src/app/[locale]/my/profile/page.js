'use client';

import { useUser } from '@/app/shared/contexts/userContext';
import '@/app/[locale]/my/css/profile.css';
import Avatar from '@/app/shared/components/avatar';
import AvatarSkeleton from '@/app/shared/components/skeletons/AvatarSkeleton';
import UserProfileCard from '../components/UserProfileCard';
import ProfilePageSkeleton from '@/app/shared/components/skeletons/ProfilePageSkeleton';

export default function ProfilePage() {
	const { user, loading } = useUser();

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
		<div style={{ background: '#f3f4f6' }}>
			<div className='profile-page-container'>
				<div className='profile-main-row'>
					<div className='profile-left'>
						<div className='profile-avatar-wrapper'>
							{loading ? (
								<AvatarSkeleton isNav={false} />
							) : (
								<Avatar
									srcAvatar={
										user.profilePictureUrl || undefined
									}
									firstName={user.firstname || ''}
									lastName={user.lastname || ''}
									isNav={true}
									pointer={false}
									size='24'
								/>
							)}
							<div className='profile-level-badge'>
								{user.level || 1}
							</div>
						</div>
						<div className='profile-name'>{displayName}</div>
						<div className='profile-id'>{userId}</div>
					</div>
					<div className='profile-right'>
						<div className='profile-stats-grid'>
							<div className='profile-stat stat-orange'>
								<span className='ribbon orange'></span>
								<div className='stats'>
									<div className='stat-value'>
										{caloriesDonated.toLocaleString()}
									</div>
									<div className='stat-label'>
										#Calories (Kcal) Donated
									</div>
								</div>
							</div>
							<div className='profile-stat stat-blue'>
								<span className='ribbon blue'></span>
								<div className='stat-value'>{fsPoints}</div>
								<div className='stat-label'>
									FS POINTS (500kcal = 1 FS Points)
								</div>
							</div>
							<div className='profile-stat stat-purple'>
								<span className='ribbon purple'></span>
								<div className='stat-value'>
									{activitiesJoined}
								</div>
								<div className='stat-label'>
									#Activities Joined
								</div>
							</div>
							<div className='profile-stat stat-pink'>
								<span className='ribbon pink'></span>
								<div className='stat-value'>{badges}</div>
								<div className='stat-label'>
									Achievement e-badges
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
