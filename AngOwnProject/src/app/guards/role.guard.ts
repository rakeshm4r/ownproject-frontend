import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { CredentailsService } from '../API-Services/credentails.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router,private credentialsService:CredentailsService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.credentialsService.isAdmin() || this.credentialsService.isDeliveryBoy()) {
      // Allow access if user is an admin
      return true;
    } else {
      // Redirect non-admin users to home (or any other page you prefer)
      this.router.navigate(['/home']);
      return false;
    }
  }
}
