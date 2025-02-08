import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppContanstsService } from '../AppContants/app-contansts.service';

@Injectable({
  providedIn: 'root'
})
export class RazorpayService {

  
  private apiUrl: string;
  
    constructor(private http: HttpClient, private appConstants: AppContanstsService) {
      this.apiUrl = `${this.appConstants.API_ENDPOINT}api/payment`;
    }

  createOrder(oData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createOrder`, oData);
  }
}
