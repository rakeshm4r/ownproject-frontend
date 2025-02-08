import { Component, OnInit } from '@angular/core';
import { CredentailsService } from '../API-Services/credentails.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  constructor(private credentialsService: CredentailsService, private messageService: MessageService) {}

 

  ngOnInit(): void {
    this.getUserProfile()
  }
 
userProfile: any = null;
getUserProfile() {
  const userId = this.credentialsService.getUserId()
  this.credentialsService.getUserProfile(userId).subscribe(
    (response: any) => {
      this.userProfile = response;  
    },
    (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    }
  );
}


}
