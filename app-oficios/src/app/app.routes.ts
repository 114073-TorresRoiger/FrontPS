import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'auth' },
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
	},
	// {
	// 	path: 'usuarios',
	// 	loadChildren: () =>
	// 		import('./features/usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
	// },
	// {
	// 	path: 'profesionales',
	// 	loadChildren: () =>
	// 		import('./features/profesionales/profesionales.routes').then(
	// 			(m) => m.PROFESIONALES_ROUTES,
	// 		),
	// },
	// {
	// 	path: 'chat',
	// 	loadChildren: () => import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
	// },
	// {
	// 	path: 'pagos',
	// 	loadChildren: () => import('./features/pagos/pagos.routes').then((m) => m.PAGOS_ROUTES),
	// },
	{ path: '**', redirectTo: 'auth' },
];
