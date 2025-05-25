import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { RootState } from 'app/store';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredRoles?: string[];
}

/**
 * Компонент для защиты маршрутов от неавторизованных пользователей
 * При необходимости проверяет роли пользователя
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRoles = [],
}) => {
	const { isAuthenticated, user, isLoading } = useSelector(
		(state: RootState) => state.auth,
	);
	const location = useLocation();

	// Пока проверяем авторизацию, показываем индикатор загрузки
	if (isLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
				}}>
				<CircularProgress />
			</Box>
		);
	}

	// Если пользователь не авторизован, перенаправляем на страницу входа
	if (!isAuthenticated) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	// Проверяем роли, если они указаны
	if (requiredRoles.length > 0 && user) {
		const hasRequiredRole = requiredRoles.some(role =>
			user.roles.includes(role),
		);

		if (!hasRequiredRole) {
			// Если у пользователя нет нужной роли, перенаправляем на главную
			return <Navigate to='/' replace />;
		}
	}

	// Если все проверки пройдены, показываем дочерние компоненты
	return <>{children}</>;
};

export default ProtectedRoute;
