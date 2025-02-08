import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppContanstsService } from '../AppContants/app-contansts.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl: string;


  constructor(private http: HttpClient, private appConstants: AppContanstsService) {
    this.apiUrl = `${this.appConstants.API_ENDPOINT}api/products`;
  }

  getAllProducts(): Observable<any> {
    const getAllProductsUrl = `${this.apiUrl}/allProducts`;
    return this.http.get<any>(getAllProductsUrl);
  }

  getAllProductCategorys(): Observable<any> {
    const getAllCategoryUrl = `${this.apiUrl}/categories`;
    return this.http.get<any>(getAllCategoryUrl);
  }

  saveCategory(category: any): Observable<any> {
    const addCategoryUrl = `${this.apiUrl}/category`;
    return this.http.post<any>(addCategoryUrl, category);
  }
 
  saveProducts(productFormData: any): Observable<any> {
    const saveProductUrl = `${this.apiUrl}/product`;
    return this.http.post<any>(saveProductUrl, productFormData);
  }

 
  getProductById(productId: string): Observable<any> {
    const url = `${this.apiUrl}/productId?productId=${productId}`;
    return this.http.get<any>(url);  // Correct request format
  }
  
}
