import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from '@/utils/axios/api';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
	const [dashboardData, setDashboardData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [dateRange, setDateRange] = useState("7d");

	const getDashboardData = useCallback(async (range = dateRange) => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get(`/admin/dashboard?dateRange=${range}`);
			setDashboardData(res.data);
			setLoading(false);
			return res.data;
		} catch (err) {
			setError(err.message);
			setLoading(false);
			return { error: err.message };
		}
	}, [dateRange]);

	useEffect(() => {
		getDashboardData(dateRange);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange]);

	return (
		<DashboardContext.Provider value={{ dashboardData, loading, error, dateRange, setDateRange }}>
			{children}
		</DashboardContext.Provider>
	);
};

export const useDashboard = () => useContext(DashboardContext);
