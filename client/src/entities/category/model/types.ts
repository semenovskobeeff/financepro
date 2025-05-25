export type CategoryType = 'income' | 'expense';

export interface Category {
	id: string;
	userId: string;
	name: string;
	type: CategoryType;
	icon: string;
	status: 'active' | 'archived';
	createdAt: string;
	updatedAt: string;
}

export interface CategoriesState {
	categories: Category[];
	selectedCategory: Category | null;
	isLoading: boolean;
	error: string | null;
}

export interface CreateCategoryRequest {
	name: string;
	type: CategoryType;
	icon?: string;
}

export interface UpdateCategoryRequest {
	name?: string;
	icon?: string;
}
