

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('jwtToken');
    const isPublicEndpoint = request.url.includes('/api/users/login') ||
                             request.url.includes('/api/users/signIn') ||
                             request.url.includes('/api/users/check-email') ||
                             request.url.includes('/api/users/reset-password') ||
                             request.url.includes('/api/users/send-reset-link');
    
    if (token && !isPublicEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  
    // Log headers for debugging
   // console.log('Request headers:', request.headers);
  
    // return next.handle(request).pipe(
    //   catchError(err => {
    //     if (err.status === 403 || err.status === 401) {
    //       this.router.navigate(['/login']);
    //     }
    //     return throwError(err);
    //   })
    // );
    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // If the response has a new token in the Authorization header, store it
          const newToken = event.headers.get('Authorization');
          if (newToken) {
            const tokenWithoutBearer = newToken.replace('Bearer ', '');
            alert("new token is set")
            sessionStorage.setItem('jwtToken', tokenWithoutBearer);
          }
        }
      }),
      catchError(err => {
        if (err.status === 403 || err.status === 401) {
          this.router.navigate(['/login']);
        }
        return throwError(err);
      })
    );
  }
  
}
