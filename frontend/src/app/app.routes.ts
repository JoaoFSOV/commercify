import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/components/auth/auth.component';
import { ProductListComponent } from './features/catalog/product-list/product-list.component';
import { ProductDetailComponent } from './features/products/components/product-detail/product-detail.component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: '**', redirectTo: 'auth' },
  { path: 'login', component: AuthComponent },
  { path: 'reset/:token', component: AuthComponent },

  { path: 'home', component: ProductListComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
];
