'use client';

import api from '@/utils/axios/api';
import { createContext, useContext, useEffect, useState } from 'react';

function getToken() {
	if (typeof window === 'undefined') return null;
	return !!localStorage.getItem('auth_token');
}

function getPreToken() {
	if (typeof window === 'undefined') return null;
	return !!localStorage.getItem('pre_auth_token');
}

function setToken(token) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('auth_token', token);
}

function setPreToken(token) {
	if (typeof window === 'undefined') return;
	localStorage.setItem('pre_auth_token', token);
}

async function removeToken() {
	if (typeof window === 'undefined') return;
	await api.delete('/auth/logout');
	localStorage.removeItem('auth_token');
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [authToken, setAuthToken] = useState(getToken());
	const [preAuthToken, setPreAuthToken] = useState(getPreToken());

	useEffect(() => {
		setAuthToken(getToken());
	}, []);

	const login = async ({ email, password }) => {
		try {
			const { data } = await api.post('/auth/login', { email, password });
			return data;
		} catch (err) {
			throw new Error(`Login failed: ${err?.message || 'Unknown error'}`);
		}
	};

	const verifyOtp = async ({ otpId, code, email, password }) => {
		try {
			const { data } = await api.post('/auth/login/otp/verify', { otpId, code, email, password });
			if (data?.session?.access_token) {
				setToken(data.session.access_token);
				setAuthToken(data.session.access_token);
				return data;
			}
			throw new Error('Verification failed');
		} catch (err) {
			throw err;
		}
	};

	const signup = async ({ email, password, firstname, lastname, dateOfBirth, }) => {
		try {
			const { data } = await api.post('/auth/register', { email, password, firstname, lastname, dateOfBirth });
			return data;
		} catch (err) {
			throw new Error(`Signup failed: ${err?.message || 'Unknown error'}`);
		}
	};

	const onboard = async ({ payload }) => {
		try {
			await api.post('/auth/complete-onboarding', payload);
			try {
				localStorage.removeItem('pre_auth_token');
				localStorage.setItem('auth_token', preAuthToken)
			} catch { }
			setAuthToken(preAuthToken);
			setToken(preAuthToken);
		} catch (error) {
			throw new Error(`Onboard failed: ${err?.message}`)
		}
	}

	const verifyRegisterOtp = async ({ otpId, code, email, password, firstname, lastname, dateOfBirth }) => {
		try {
			const { data } = await api.post('/auth/register/otp/verify', { otpId, code, email, password, firstname, lastname, dateOfBirth });
			if (data?.session?.access_token) {
				setToken(data.session.access_token);
				setAuthToken(data.session.access_token);
				return data;
			}
			throw new Error('Registration verification failed');
		} catch (err) {
			throw new Error(`Something went wrong. Please try again. ${err.message}`);
		}
	};

	const handleSession = async (session) => {
		if (!session?.access_token) return null;
		try {
			await api.post('/auth/sync-session', {
				access_token: session.access_token,
				refresh_token: session.refresh_token,
			});
			const { data } = await api.post('/auth/pre-profile');
			if (data.existing && data.userExists && !data.preProfile) {
				try {
					localStorage.setItem('auth_token', session.access_token);
				} catch { }
				setAuthToken(session.access_token);
				setToken(session.access_token);
			} else if (!data.existing && !data.userExists && data.preProfile) {
				try {
					localStorage.setItem('pre_auth_token', session.access_token);
				} catch {}
				setPreAuthToken(session.access_token);
				setPreToken(session.access_token);
			}

			return data || {};
		} catch (e) {
			console.error('handleSession error', e);
			throw e;
		}
	};

	const logout = async () => {
		await removeToken();
		setAuthToken(null);
	};

	return (
		<AuthContext.Provider value={{ authToken, login, logout, signup, verifyOtp, verifyRegisterOtp, handleSession, onboard }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
