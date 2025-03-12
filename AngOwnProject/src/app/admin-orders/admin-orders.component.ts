import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { OrderDetails } from '../Admin-OrdersDetails_Interface';
import { RazorpayService } from '../API-Services/razorpay.service';
import { CredentailsService } from '../API-Services/credentails.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent   {

  constructor(private razorPayService:RazorpayService,private credentailsService: CredentailsService,private changeDetectorRef: ChangeDetectorRef){}
  
  selectedStatus: string = 'Confirmed'; // Default tab is 'Confirmed'
   
  onTabChange(event: any) {
    this.selectedStatus = event.tab.textLabel;
  }

}
 