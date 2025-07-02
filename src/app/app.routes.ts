import { Routes } from '@angular/router';
import {Dashboard} from './components/pages/dashboard/dashboard';
import {authGuard} from './services/authguard';
import {Loginpage} from './components/pages/loginpage/loginpage';
import {Detalhesorcamento} from './components/pages/detalhesorcamento/detalhesorcamento';
import {Orcamentos} from './components/pages/orcamentos/orcamentos';
import {Composicoes} from './components/pages/composicoes/composicoes';
import {Insumos} from './components/pages/insumos/insumos';
import {CreateInsumos} from './components/pages/create-insumos/create-insumos';
import {CreateComp} from './components/pages/create-comp/create-comp';
import {Detalhescomposicao} from './components/pages/detalhescomposicao/detalhescomposicao';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  {
    path: 'orcamentos',
    component: Orcamentos,
    canActivate: [authGuard]
  },
  {
    path: 'detalhes-orcamento/:id',
    component: Detalhesorcamento,
    canActivate: [authGuard]
  },
  {
    path: 'composicoes',
    component: Composicoes,
    canActivate: [authGuard]
  },
  {
    path: 'detalhes-composicao/:codigo',
    component: Detalhescomposicao,
    canActivate: [authGuard]
  },
  {
    path: 'insumos',
    component: Insumos,
    canActivate: [authGuard]
  },
  {
    path: 'create-insumos',
    component: CreateInsumos,
    canActivate: [authGuard],
  },
  {
    path: 'create-comp',
    component: CreateComp,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: Loginpage
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
];
