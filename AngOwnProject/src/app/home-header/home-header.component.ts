import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CredentailsService } from '../API-Services/credentails.service';
import { DynamicHeadingTagsService } from '../API-Services/dynamic-heading-tags.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css']
})
export class HomeHeaderComponent implements OnInit {

  constructor(private router: Router,private credentialsService:CredentailsService, 
    private dynamicHeadingTagsService: DynamicHeadingTagsService,private messageService:MessageService) {}
  
  isAdmin: boolean = false;  // To store if the user is an admin
  isloggedIn:boolean = false;
  isDeliveryBoy:boolean =false;

  ngOnInit(): void {
    this.isloggedIn=this.credentialsService.isLoggedIn();
    this.isAdmin = this.credentialsService.isAdmin();  // Set isAdmin based on user role
    this.isDeliveryBoy = this.credentialsService.isDeliveryBoy();
    if(!this.isDeliveryBoy){
      this. getAllHeadingTags();
    }
  }

   userId = sessionStorage.getItem('userId');

   logOut() {
    this.credentialsService.logOut();
  }
  
  
  headingTags: any[] = [];
  getAllHeadingTags() {
      this.dynamicHeadingTagsService.getAllHeadingTags().subscribe({
        next: (response: any) => {
          // Adding the isEditMode flag to each tag when the data is fetched
          this.headingTags = response
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
        }
      });
  }

  generateRouteLink(headerName: string): string {
    // This converts the header name to a format suitable for routing
    return `/${headerName.toLowerCase().replace(/\s+/g, '-')}`;
  }

}
