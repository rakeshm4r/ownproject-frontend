import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppContanstsService } from '../AppContants/app-contansts.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl: string;
  
  
    constructor(private http: HttpClient, private appConstants: AppContanstsService) {
      this.apiUrl = `${this.appConstants.API_ENDPOINT}api/cart`; 
    }

  
    saveCartDetails(productData: any): Observable<any> {
      const saveCartUrl = `${this.apiUrl}/add-to-cart`;
      return this.http.post<any>(saveCartUrl, productData);
    }
    
    getCartDetsByUser(): Observable<any> {
      const getCartDetsByUser = `${this.apiUrl}/getCartDetsByUser`;
      return this.http.get<any>(getCartDetsByUser);
    }

    removeProductFromCart(cartId:any): Observable<any> {  
      const removeProductFromCartUrl = `${this.apiUrl}/removeProductFromCart`;
      return this.http.post<any>(removeProductFromCartUrl,cartId);
    }

}
