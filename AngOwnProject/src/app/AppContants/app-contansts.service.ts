import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppContanstsService {


  public readonly API_ENDPOINT = 'http://localhost:8413/';
  public readonly APP_NAME = 'My Angular App';
  
  constructor() { }
}
