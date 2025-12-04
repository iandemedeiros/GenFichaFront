import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { AuthGuard } from './guards/auth.guard';
import { SheetDetailComponent } from './components/sheet-detail/sheet-detail.component';

// --- Componentes do Painel Administrativo ---
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { MagiaListComponent } from './components/magia-list/magia-list.component';
import { MagiaFormComponent } from './components/magia-form/magia-form.component';
// import { HabilidadeListComponent } from './components/admin/habilidade-list/habilidade-list.component';
// import { ItemListComponent } from './components/admin/item-list/item-list.component';
 import { adminGuard } from './guards/admin.guard'; // Você precisará criar este guard
import { HabilidadeListComponent } from './components/habilidade-list/habilidade-list.component';
import { ItemListComponent } from './components/item-list/item-list.component';
import { HabilidadeFormComponent } from './components/habilidade-form/habilidade-form.component';
import { ItemFormComponent } from './components/item-form/item-form.component';

export const routes: Routes = [

  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistroComponent },

  // Rotas privadas
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },


  // Rota para ver detalhes de uma ficha (agora protegida)
  {
    path: 'fichas/:id',
    component: SheetDetailComponent,
    canActivate: [AuthGuard]
  },

  // --- Rotas do Painel Administrativo ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, adminGuard], 
    children: [
      { path: '', redirectTo: 'magias', pathMatch: 'full' }, // Redireciona para a primeira entidade
      { path: 'magias', component: MagiaListComponent },
      { path: 'magias/nova', component: MagiaFormComponent },
      { path: 'magias/editar/:id', component: MagiaFormComponent },
      { path: 'habilidades', component: HabilidadeListComponent },
      { path: 'habilidades/nova', component: HabilidadeFormComponent },
      { path: 'habilidades/editar/:id', component: HabilidadeFormComponent },
      { path: 'itens', component: ItemListComponent },
      { path: 'itens/nova', component: ItemFormComponent },
      { path: 'itens/editar/:id', component: ItemFormComponent },
      
      
    ]
  },

  // Qualquer coisa → redireciona ao login (deve ser a última rota)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
