import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { RegistroComponent } from './components/registro/registro.component';
import { AuthGuard } from './guards/auth.guard';
import { SheetDetailComponent } from './components/sheet-detail/sheet-detail.component';
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

  // Qualquer coisa → redireciona ao login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },

  // ...suas outras rotas existentes...
  { path: 'fichas/:id', component: SheetDetailComponent },
  // Adicione uma rota padrão ou de fallback se necessário

];

