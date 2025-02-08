import { Component } from '@angular/core';
import { CredentailsService } from '../API-Services/credentails.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {

  constructor(private credentialsService:CredentailsService) {}
  isAdmin: boolean = false;  // To store if the user is an admin
  ngOnInit(): void {
    this.isAdmin = this.credentialsService.isAdmin();  // Set isAdmin based on user role
 
  }
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

 

  

 
}
