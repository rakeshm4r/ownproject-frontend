import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card'; 
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitterModule } from 'primeng/splitter';
import { CarouselModule } from 'primeng/carousel';

import { HomeComponent } from './home/home.component';
import { HomeHeaderComponent } from './home-header/home-header.component';
import { HomeFooterComponent } from './home-footer/home-footer.component';
import { UserCredentialsComponent } from './user-credentials/user-credentials.component';
import { ErrorComponent } from './error/error.component';
import { ControlSettingComponent } from './control-setting/control-setting.component';
import { LayoutComponent } from './layout/layout.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { ProfileComponent } from './profile/profile.component';
import { DynamicHeadingTagsComponent } from './dynamic-heading-tags/dynamic-heading-tags.component';
import { ContextMenuComponent } from './UI-Services/context-menu/context-menu.component';
import { AddProductsComponent } from './add-products/add-products.component';
import { ProductsComponent } from './products/products.component';
import { ShowProductDtlsComponent } from './show-product-dtls/show-product-dtls.component';
import { CartComponent } from './cart/cart.component';
import { AuthInterceptorService } from './API-Services/auth-interceptor.service';
import { OrderComponent } from './order/order.component';
import { PaymentsComponent } from './payments/payments.component';
import { OrderConfirmationComponent } from './order-confirmation/order-confirmation.component';
import { MyOrdersComponent } from './my-orders/my-orders.component';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component';
import { DeliveryHomeComponent } from './delivery-home/delivery-home.component';
import { CalendarModule } from 'primeng/calendar';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HomeHeaderComponent,
    HomeFooterComponent,
    UserCredentialsComponent,
    ErrorComponent,
    ControlSettingComponent,
    LayoutComponent,
    SideBarComponent,
    ProfileComponent,
    DynamicHeadingTagsComponent,
    ContextMenuComponent,
    AddProductsComponent,
    ProductsComponent,
    ShowProductDtlsComponent,
    CartComponent,
    OrderComponent,
    PaymentsComponent,
    OrderConfirmationComponent,
    MyOrdersComponent,
    AdminOrdersComponent,
    DeliveryHomeComponent
  ],
  imports: [
    BrowserModule,ReactiveFormsModule , HttpClientModule ,FormsModule,CardModule,
    AppRoutingModule,ToastModule,ButtonModule,BrowserAnimationsModule,InputTextModule,
    DialogModule,ProgressBarModule,ProgressSpinnerModule,SplitterModule,CarouselModule,
    DropdownModule,CalendarModule,MatTabsModule,
  ],
  providers: [MessageService,
                        { provide: HTTP_INTERCEPTORS,    useClass: AuthInterceptorService,    multi: true  }
      ],
  bootstrap: [AppComponent]
})
export class AppModule { }
