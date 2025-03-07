import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RazorpayService } from '../API-Services/razorpay.service';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivery-home',
  templateUrl: './delivery-home.component.html',
  styleUrls: ['./delivery-home.component.css']
})
export class DeliveryHomeComponent implements OnInit {

  constructor(private router: Router,private razorPayService:RazorpayService ) {}
   
  ngOnInit(): void {
    this.loadOrderDetails()
  }

  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStatus: string = 'all';
  selectedFromDate: string = '';  
  selectedToDate: string = '';

  loadOrderDetails() {
    this.razorPayService.getAllOrderDetails().subscribe((data: any) => {
      this.orders = data;   
      this.filteredOrders = data; 
      this.filterOrders();  
    });
  }
  filterOrders() {
    let filteredByStatus = this.orders;
  
    // Filter by order status if it's not 'all'
    if (this.selectedStatus !== 'all') {
      filteredByStatus = filteredByStatus.filter(order => order.orderStatus === this.selectedStatus);
    }
  
    // Filter by date range (from date to to date)
    if (this.selectedFromDate && this.selectedToDate) {
      filteredByStatus = filteredByStatus.filter(order => {
        const orderDate = this.formatDate(order.deliveredOrderdDate); // Extract only the date part (YYYY-MM-DD)
        return orderDate >= this.selectedFromDate && orderDate <= this.selectedToDate;
      });
    } else if (this.selectedFromDate) {
      // If only From Date is selected
      filteredByStatus = filteredByStatus.filter(order => {
        const orderDate = this.formatDate(order.deliveredOrderdDate);
        return orderDate >= this.selectedFromDate;
      });
    } else if (this.selectedToDate) {
      // If only To Date is selected
      filteredByStatus = filteredByStatus.filter(order => {
        const orderDate = this.formatDate(order.deliveredOrderdDate);
        return orderDate <= this.selectedToDate;
      });
    }
  
    // Sort orders by deliveredOrderdDate in descending order
    filteredByStatus = filteredByStatus.sort((a, b) => {
      const dateA = new Date(a.deliveredOrderdDate).getTime();
      const dateB = new Date(b.deliveredOrderdDate).getTime();
      return dateB - dateA; // For descending order
    });
  
    // Update filtered orders
    this.filteredOrders = filteredByStatus;
  }
  
  
  // Helper method to format date to YYYY-MM-DD
  formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  selectedOrder: any = null;

  // Method to select an order and show its details
  selectOrder(order: any): void {
    if (this.selectedOrder === order) {
      this.selectedOrder = null; // Toggle off if the same order is clicked
    } else {
      this.selectedOrder = order;
    }
  }


  getOrderStatusColor(order: any): string {
    const today = new Date();
    const deliveredDate = new Date(order.deliveredOrderdDate);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check for the conditions
    if (order.orderStatus === 'delivered') {
      return 'green'; // Green if delivered
    } else if (deliveredDate.toDateString() === yesterday.toDateString()) {
      return 'red'; // Red if the order was delivered yesterday
    } else if (deliveredDate.toDateString() === today.toDateString()) {
      return 'yellow'; // Yellow if the order was delivered today
    }
    return ''; // Default no color
  }
}
