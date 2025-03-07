import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserCredentialsComponent } from './user-credentials/user-credentials.component';
import { ErrorComponent } from './error/error.component';
import { AuthGuard } from './guards/auth.guard';
import { ControlSettingComponent } from './control-setting/control-setting.component';
import { LayoutComponent } from './layout/layout.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ProfileComponent } from './profile/profile.component';
import { RoleGuard } from './guards/role.guard';
import { DynamicHeadingTagsComponent } from './dynamic-heading-tags/dynamic-heading-tags.component';
import { AddProductsComponent } from './add-products/add-products.component';
import { ProductsComponent } from './products/products.component';
import { ShowProductDtlsComponent } from './show-product-dtls/show-product-dtls.component';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { DeliveryHomeComponent } from './delivery-home/delivery-home.component';



const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: UserCredentialsComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: '', component: SideBarComponent,
          children: [
            { path: 'control-setting', component: ControlSettingComponent, canActivate: [RoleGuard]  },
            { path: 'add-products', component: AddProductsComponent, canActivate: [RoleGuard]  },
            { path: 'profile', component:ProfileComponent},
            { path: 'dynamic-heading-tags',component:DynamicHeadingTagsComponent},
           
             ]      
      },
      { path:'delivery-home', component:DeliveryHomeComponent, canActivate: [RoleGuard]},
      { path: 'products',component:ProductsComponent},
      { path: 'show-products/:productName',component:ShowProductDtlsComponent},
      { path: 'showCart',component:CartComponent},
      { path: 'order-products/:productName',component:OrderComponent},
      { path: 'order-confirmation',component:OrderConfirmationComponent},
      { path: 'my-orders',component:MyOrdersComponent},
      { path: 'adminorders',component:AdminOrdersComponent, canActivate: [RoleGuard] },
    ]
  },
  { path: '**', component: ErrorComponent },
];



@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
