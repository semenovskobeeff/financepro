import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import UserProfile from '../../features/auth/components/UserProfile';
import ProtectedRoute from '../../features/auth/components/ProtectedRoute';

const ProfilePage: React.FC = () => {
	return (
		<ProtectedRoute>
			<Container maxWidth='md'>
				<Box sx={{ mt: 4, mb: 4 }}>
					<Typography variant='h4' component='h1' gutterBottom>
						Профиль пользователя
					</Typography>
				</Box>
				<UserProfile />
			</Container>
		</ProtectedRoute>
	);
};

export default ProfilePage;
