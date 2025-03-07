import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent {

   constructor(
        private route: ActivatedRoute, private router: Router){}
  goToMyOrders() {
    this.router.navigate(['/my-orders']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }
}
