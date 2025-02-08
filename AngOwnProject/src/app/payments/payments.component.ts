import { Component } from '@angular/core';
import { RazorpayService } from '../API-Services/razorpay.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent {

  constructor(private razorpayService: RazorpayService) { }
  
  Razorpay: any;

  pay(amount: number) {
    alert(amount)
    this.razorpayService.createOrder(amount).subscribe(response => {
              if (response && response.id) {
                this.loadRazorpay(response.id, amount);
              }
            });
          }
        
          loadRazorpay(orderId: string, amount: number) {
            const options = {
              key: 'your_key_id',  // Your Razorpay Key ID
              amount: amount * 100,  // Convert to paise
              currency: 'INR',
              name: 'Your Company',
              description: 'Product Purchase',
              image: 'https://example.com/logo.png',
              order_id: orderId,
              handler: function (response: any) {
                console.log(response);
                // Send payment details to the server
              },
              prefill: {
                name: 'User Name',
                email: 'user@example.com',
                contact: '9876543210'
              }
            };
            const razorpay = new this.Razorpay(options);
            razorpay.open();
          }
}
