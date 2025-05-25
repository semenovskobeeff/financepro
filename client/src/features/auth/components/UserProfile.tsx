import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
	Box,
	Button,
	Card,
	CardContent,
	Typography,
	TextField,
	Avatar,
	Grid,
	Divider,
	Alert,
	CircularProgress,
} from '@mui/material';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import { RootState } from 'app/store';
import { useDispatch } from 'react-redux';
import { useUpdateProfileMutation } from '../api/authApi';
import { logout } from '../model/authSlice';

const UserProfile: React.FC = () => {
	const { user, isAuthenticated } = useSelector(
		(state: RootState) => state.auth,
	);
	const [updateProfile, { isLoading, isError, error }] =
		useUpdateProfileMutation();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [editMode, setEditMode] = useState(false);
	const [name, setName] = useState(user?.name || '');
	const [formError, setFormError] = useState('');

	// Перенаправление на страницу входа, если пользователь не авторизован
	React.useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	if (!user) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
				<CircularProgress />
			</Box>
		);
	}

	const handleLogout = () => {
		dispatch(logout());
		navigate('/login');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError('');

		if (!name.trim()) {
			setFormError('Имя не может быть пустым');
			return;
		}

		try {
			await updateProfile({ name }).unwrap();
			setEditMode(false);
		} catch (err) {
			console.error('Ошибка обновления профиля:', err);
		}
	};

	return (
		<Card elevation={3} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
			<CardContent>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						mb: 3,
					}}>
					<Avatar sx={{ width: 100, height: 100, mb: 2 }}>
						<AccountCircleIcon sx={{ fontSize: 80 }} />
					</Avatar>

					{!editMode ? (
						<Typography variant='h5' gutterBottom>
							{user.name}
						</Typography>
					) : (
						<TextField
							fullWidth
							label='Имя'
							value={name}
							onChange={e => setName(e.target.value)}
							sx={{ mb: 2 }}
						/>
					)}

					<Typography variant='body1' color='text.secondary'>
						{user.email}
					</Typography>
				</Box>

				<Divider sx={{ my: 2 }} />

				{(isError || formError) && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{formError ||
							(error as any)?.data?.message ||
							'Произошла ошибка'}
					</Alert>
				)}

				{editMode ? (
					<Box component='form' onSubmit={handleSubmit}>
						<Grid container spacing={2} justifyContent='center'>
							<Grid item>
								<Button
									type='submit'
									variant='contained'
									disabled={isLoading}>
									{isLoading ? (
										<CircularProgress size={24} />
									) : (
										'Сохранить'
									)}
								</Button>
							</Grid>
							<Grid item>
								<Button
									variant='outlined'
									onClick={() => {
										setEditMode(false);
										setName(user.name);
										setFormError('');
									}}
									disabled={isLoading}>
									Отмена
								</Button>
							</Grid>
						</Grid>
					</Box>
				) : (
					<Grid container spacing={2} justifyContent='center'>
						<Grid item>
							<Button
								variant='contained'
								onClick={() => setEditMode(true)}>
								Редактировать профиль
							</Button>
						</Grid>
						<Grid item>
							<Button
								variant='outlined'
								color='error'
								onClick={handleLogout}>
								Выйти
							</Button>
						</Grid>
					</Grid>
				)}
			</CardContent>
		</Card>
	);
};

export default UserProfile;
