import { Component, OnInit } from '@angular/core';
import { RazorpayService } from '../API-Services/razorpay.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

   constructor(private razorPayService:RazorpayService){}

  ngOnInit(): void {
    this.loadProducts()
  }

  products: any[] = [];
  expandedUser: string | null = null;
  loadProducts() {
    this.razorPayService.getMyOrders().subscribe((data: any) => {
      this.products = data;
      
    });
  }

  // Method to get unique users from the list
  getUniqueUsers(): string[] {
    return [...new Set(this.products.map(order => order.userName))];
  }

  // Method to filter orders by user
  filterOrdersByUser(user: string): any[] {
    return this.products.filter(order => order.userName === user);
  }

  // Method to toggle the user's orders (expand/collapse)
  toggleUserOrders(user: string) {
    this.expandedUser = this.expandedUser === user ? null : user;
  }
}
