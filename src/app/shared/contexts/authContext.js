'use client';

import api from '@/utils/axios/api';
import { createContext, useContext, useEffect, useState } from 'react';

function getToken() {
	if (typeof window === 'undefined') return null;
	return !!localStorage.getItem('auth_token');
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

	const logout = async () => {
		await removeToken();
		setAuthToken(null);
	};

	return (
		<AuthContext.Provider value={{ authToken, login, logout, signup, verifyOtp, verifyRegisterOtp }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
