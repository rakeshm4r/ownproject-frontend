import { Component, OnInit } from '@angular/core';
import { CredentailsService } from '../API-Services/credentails.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements OnInit {

    constructor(private credentialsService:CredentailsService) {}

    isDeliveryBoy:boolean =false;

    ngOnInit(): void {
      
      this.isDeliveryBoy = this.credentialsService.isDeliveryBoy();
     
    }
}
