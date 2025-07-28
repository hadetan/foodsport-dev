'use client';

import api from '@/utils/axios/api';
import { createContext, useContext, useEffect, useState } from 'react';

function getToken() {
	if (typeof window === 'undefined') return null;
	return !!localStorage.getItem('auth_token') || null;
}

function setToken(token) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('auth_token', token);
}

async function removeToken() {
	if (typeof window === 'undefined') return;
	await api.delete('/auth/logout');
	localStorage.removeItem('auth_token');
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [authToken, setAuthToken] = useState(getToken());

	useEffect(() => {
		setAuthToken(getToken());
	}, []);

	const login = async ({ email, password }) => {
		try {
			const { data } = await api.post('/auth/login', { email, password });
			setToken(data.session?.access_token);
			setAuthToken(data.session?.access_token);
		} catch (err) {
			return err
		}
	};

	const logout = async () => {
		await removeToken();
		setAuthToken(null);
	};

	return (
		<AuthContext.Provider value={{ authToken, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
