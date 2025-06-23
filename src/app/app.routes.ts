import { Routes } from '@angular/router';
import {Dashboard} from './components/dashboard/dashboard';
import {authGuard} from './services/authguard';
import {Loginpage} from './components/loginpage/loginpage';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: Loginpage
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
