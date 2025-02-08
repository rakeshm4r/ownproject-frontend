import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError, Observable, tap, of } from 'rxjs';
import { AppContanstsService } from '../AppContants/app-contansts.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class CredentailsService {

  private apiUrl: string;


  constructor(private http: HttpClient, private appConstants: AppContanstsService, private router: Router) {
    this.apiUrl = `${this.appConstants.API_ENDPOINT}api/users`;
  }

  private loggedIn = false;

  isLogged_Frm_Session_Stg(): boolean {
    return !!this.getUserId;
  }

  // Log out the user by removing the userId from sessionStorage
  logOut() {
    const token = sessionStorage.getItem('jwtToken');  // Or from localStorage if you're using it

    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }), responseType: 'text'
      }).subscribe({
        next: (response: any) => {
          // Remove the token from sessionStorage or localStorage
          sessionStorage.removeItem('jwtToken');  // Or localStorage if you're using it

          window.location.reload();
        },
        error: (err) => {
          console.error('Logout failed', err);
          // Handle error (e.g., invalid token, etc.)
        },
        complete: () => {
          console.log('Logout request completed');
        }
      });
    }
  }


  isLoggedIn(): boolean {
    return this.loggedIn;
  }


  setLoggedIn(status: boolean): void {
    this.loggedIn = status;
  }


  signIn(credentials: FormData): Observable<any> {
    const signInUrl = `${this.apiUrl}/signIn`; // Appending /signIn
    return this.http.post<any>(signInUrl, credentials);
  }

  login(loginRequest: { emailId: string, userPassword: string }): Observable<any> {
    const loginUrl = `${this.apiUrl}/login`; // Appending /login
    return this.http.post<any>(loginUrl, loginRequest).pipe(
      tap(response => {
        if (response.token) {
          sessionStorage.setItem('jwtToken', response.token);
        }
      })
    );
  }


  getUserId(): string | null {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      return null;  // Return null if the token doesn't exist in sessionStorage
    }

    const payload = this.decodeJwt(token);
    return payload?.userId || null;  // Return the userId or null if it's not found
  }

  // Utility to get user role from JWT token
  getUserRole(): string | null {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      return null;  // Return null if the token doesn't exist in sessionStorage
    }

    const payload = this.decodeJwt(token);
    return payload?.role || null;  // Return the role or null if it's not found
  }

  // Utility to decode JWT token and return the payload as an object
  private decodeJwt(token: string): any {
    const base64Url = token.split('.')[1]; // Get the payload part of the JWT
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Correct base64 characters for decoding
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    try {
      return JSON.parse(jsonPayload);  // Parse the JSON payload and return it as an object
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }


  // Check if the user is an admin
  isAdmin(): boolean {
    return this.getUserRole() === 'Admin' || this.getUserRole() === 'admin';
  }

  checkEmail(email: string): Observable<boolean> {
    const checkEmailUrl = `${this.apiUrl}/check-email`;
    return this.http.post<boolean>(checkEmailUrl, { emailId: email }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }


  sendResetLink(email: FormData): Observable<any> {
    const sendResetUrl = `${this.apiUrl}/send-reset-link`;
    return this.http.post<any>(sendResetUrl, email)
  }

  resetPassword(resetEmPsd: { emailId: string, userPassword: string }): Observable<any> {
    const resetPasswordUrl = `${this.apiUrl}/reset-password`;
    return this.http.post<any>(resetPasswordUrl, resetEmPsd)
  }

  getAllUsers(): Observable<any> {
    const getAllUsersUrl = `${this.apiUrl}/all-users`;
    return this.http.get<any>(getAllUsersUrl);
  }

  updateRole(userId: string, newRole: string): Observable<any> {
    const payload = {
      userId: userId,
      userRole: newRole
    };
    return this.http.put<any>(`${this.apiUrl}/updateRole`, payload);
  }


  getUserProfile(userId: any): Observable<any> {
    const getUser = `${this.apiUrl}/getUser`;
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.get<any>(getUser, { params });
  }
}
