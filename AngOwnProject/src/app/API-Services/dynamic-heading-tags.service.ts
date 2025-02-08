import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppContanstsService } from '../AppContants/app-contansts.service';

@Injectable({
  providedIn: 'root'
})
export class DynamicHeadingTagsService {

  private apiUrl: string;
  
  
  constructor(private http: HttpClient, private appConstants: AppContanstsService) {
      this.apiUrl = `${this.appConstants.API_ENDPOINT}api/form`; 
  }

  // Method to submit the form data
  submitForm(fields: any[]): Observable<any> {
    const SubmitFromUrl = `${this.apiUrl}/submit`;
    return this.http.post<any>(SubmitFromUrl, fields);
  }

  getAllHeadingTags(): Observable<any> {
    const getAllHeadingTagsUrl = `${this.apiUrl}/all-headings`;
    return this.http.get<any>(getAllHeadingTagsUrl);
  }

  updateHeadingT(fields: any): Observable<any> {
    const updateHeadingTagsUrl = `${this.apiUrl}/updateHeadingTag`;
    return this.http.put<any>(updateHeadingTagsUrl, fields);
  }
  
//updateOrDeleteHeadingTag.
updateHeadingTags(fields: any): Observable<any> {
  const updateHeadingTagsUrl = `${this.apiUrl}/updateOrDeleteHeadingTag`;
  return this.http.put<any>(updateHeadingTagsUrl, fields);
}
}
