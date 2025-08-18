'use client';

import React, { useState, useEffect } from 'react';
import Dropdown from '../components/Dropdown';
import Status from '../components/status';
import { useDashboard } from '@/app/shared/contexts/DashboardContext';
import FullPageLoader from '../components/FullPageLoader';

const DashboardPage = () => {
	const { dashboardData, setDateRange, dateRange, loading } = useDashboard();

	return (
		<>
			{loading && <FullPageLoader />}
			<div className='min-h-screen w-full overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-base-200 to-base-100'>
				{/* Filters */}
				<div className='flex flex-wrap gap-4 mb-6 w-full'>
					<Dropdown
						items={['Last 24 Hours', 'Last 7 Days', 'Last 30 Days']}
						name='Date Range'
						selectedValue={
							dateRange === '24h'
								? 'Last 24 Hours'
								: dateRange === '7d'
								? 'Last 7 Days'
								: 'Last 30 Days'
						}
						onSelect={(item) => {
							if (item === 'Last 24 Hours') setDateRange('24h');
							else if (item === 'Last 7 Days') setDateRange('7d');
							else setDateRange('30d');
						}}
					/>
				</div>

				{/* KPIs */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full'>
					<div className='stats shadow'>
						<div className='stat bg-gradient-to-r from-secondary to-secondary-focus text-secondary-content'>
							<div className='stat-title opacity-80'>
								<span className='font-bold'>
									Active Participants
								</span>
							</div>
							<div className='stat-value'>
								{dashboardData?.stats?.totalUsers ?? 0}
							</div>
							<div className='stat-desc opacity-80'>All time</div>
						</div>
					</div>
					<div className='stats shadow'>
						<div className='stat bg-gradient-to-r from-success to-success/80 text-success-content'>
							<div className='stat-title opacity-80'>
								<span className='font-bold'>Donations</span>
							</div>
							<div className='stat-value'>
								{dashboardData?.stats?.totalDonations ?? 0}
							</div>
							<div className='stat-desc opacity-80'>
								Total funds
							</div>
						</div>
					</div>
					<div className='stats shadow'>
						<div className='stat bg-gradient-to-r from-accent to-accent-focus text-accent-content'>
							<div className='stat-title opacity-80'>
								<span className='font-bold'>Total Users</span>
							</div>
							<div className='stat-value'>
								{dashboardData?.stats?.totalRewards ?? 0}
							</div>
							<div className='stat-desc opacity-80'>
								Registered
							</div>
						</div>
					</div>
					<div className='stats shadow'>
						<div className='stat bg-gradient-to-r from-info to-info/80 text-info-content'>
							<div className='stat-title opacity-80'>
								<span className='font-bold'>Events</span>
							</div>
							<div className='stat-value'>
								{dashboardData?.stats?.activeActivities ?? 0}
							</div>
							<div className='stat-desc opacity-80'>All time</div>
						</div>
					</div>
				</div>

				{/* Placeholder for analytics charts */}
				<div className='grid grid-cols-1 lg:grid-cols-1 gap-4 mb-8'>
					{/* Only Event Calendar remains */}
					<div className='card bg-base-100 shadow-lg'>
						<div className='card-body'>
							<h2 className='card-title text-base-content'>
								<span className='font-bold'>
									Event Calendar
								</span>
							</h2>
							{/* TODO: Insert event calendar component */}
							<div className='text-base-content/60 text-sm'>
								[Event calendar visualization here]
							</div>
						</div>
					</div>
				</div>

				{/* Recent Signups Table */}
				<div className='card bg-base-100 shadow-lg w-full mb-8'>
					<div className='card-body'>
						<h2 className='card-title text-base-content'>
							<span className='font-bold'>Recent Signups</span>
						</h2>
						<div className='overflow-x-auto'>
							<table className='table table-zebra w-full'>
								<thead>
									<tr>
										<th>
											<span className='font-bold'>
												User
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Email
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Date
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Status
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Activities
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Points
											</span>
										</th>
										<th>
											<span className='font-bold'>
												Badges
											</span>
										</th>
									</tr>
								</thead>
								<tbody>
									{(dashboardData?.recentSignups ?? []).map(
										(signup) => (
											<tr key={signup.id}>
												<td className='flex items-center gap-2'>
													{signup.profilePictureUrl ? (
														<img
															src={
																process.env
																	.NEXT_PUBLIC_SUPABASE_URL +
																signup.profilePictureUrl
															}
															alt='Profile'
															className='w-8 h-8 rounded-full'
														/>
													) : (
														<div className='w-8 h-8 rounded-full bg-base-200 flex items-center justify-center text-xs'>
															{signup
																.firstname?.[0] ??
																''}
														</div>
													)}
													<span>
														{signup.firstname ?? ''}{' '}
														{signup.lastname ?? ''}
													</span>
												</td>
												<td>{signup.email ?? ''}</td>
												<td>
													{signup.signupDate
														? new Date(
																signup.signupDate
														  ).toLocaleDateString()
														: ''}
												</td>
												<td>
													<Status
														statusOfUser={
															signup.status ===
															'active'
														}
													/>
												</td>
												<td>
													{signup.totalActivities ??
														0}
												</td>
												<td>
													{signup.totalPoints ?? 0}
												</td>
												<td>
													{signup.badgeCount ?? 0}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default DashboardPage;
