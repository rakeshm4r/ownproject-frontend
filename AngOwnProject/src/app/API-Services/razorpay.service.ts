import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AppContanstsService } from '../AppContants/app-contansts.service';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  
  private apiCreateOrderUrl: string;
  private apiSaveOrderPaymentUrl: string;
  
    constructor(private http: HttpClient, private appConstants: AppContanstsService) {
      
      this.apiSaveOrderPaymentUrl = `${this.appConstants.API_ENDPOINT}api/payment`;

      this.apiCreateOrderUrl = `${this.appConstants.API_ENDPOINT}api/orders`;
    }

    createOrder(oData: any): Observable<any> {    
      return this.http.post(`${this.apiCreateOrderUrl}/createOrder`, oData)
        .pipe(
          tap((response) => {           
          }),
          catchError((error) => {
            console.error('Error during API call: ', error); 
            return throwError(error); 
          })
        );
    }
    
    verifyPayment(oData: any): Observable<any> {    
      return this.http.post(`${this.apiSaveOrderPaymentUrl}/verify-payment`, oData)
        .pipe(
          tap((response) => {           
          }),
          catchError((error) => {
            console.error('Error during API call: ', error); 
            return throwError(error); 
          })
        );
    }

    saveOrderpaymentDetails(oData: any): Observable<any> {    
      return this.http.post(`${this.apiSaveOrderPaymentUrl}/saveOrderPaymentDetails`, oData)
        .pipe(
          tap((response) => {           
          }),
          catchError((error) => {
            console.error('Error during API call: ', error); 
            return throwError(error); 
          })
        );
    }
}
