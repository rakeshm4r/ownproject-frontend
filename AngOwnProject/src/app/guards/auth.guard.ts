import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CredentailsService } from '../API-Services/credentails.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {


constructor(private credentailsService: CredentailsService, private router: Router){}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      

    //  const userId = sessionStorage.getItem('userId');

    const userId= this.credentailsService.getUserId();

      if (userId) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }

    
  }
  
}
