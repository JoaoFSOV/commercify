import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/components/auth/auth.component';
import { ProductListComponent } from './features/home/components/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: '**', redirectTo: 'auth' }, // Fall back route
  { path: 'login', component: AuthComponent },
  { path: 'reset/:token', component: AuthComponent },
  { path: 'home', component: ProductListComponent },
];
