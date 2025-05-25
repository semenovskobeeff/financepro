/**
 * Типы для авторизации и управления пользователями
 */

export interface User {
	id: string;
	email: string;
	name: string;
	roles: string[];
	settings?: UserSettings;
}

export interface UserSettings {
	primaryIncomeAccount?: string;
	primaryExpenseAccount?: string;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	name: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}
