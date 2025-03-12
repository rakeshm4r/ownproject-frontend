import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RazorpayService } from '../API-Services/razorpay.service';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-delivery-home',
  templateUrl: './delivery-home.component.html',
  styleUrls: ['./delivery-home.component.css']
})
export class DeliveryHomeComponent implements OnInit {

  constructor(private router: Router, private razorPayService: RazorpayService, private confirmationService: ConfirmationService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.loadOrderDetails()
  }

  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStatus: string = 'all';
  selectedFromDate: string = '';
  selectedToDate: string = '';
  originalOrdersCopy: any[] = [];

  loadOrderDetails() {
    this.razorPayService.getAllOrderDetails().subscribe((data: any) => {
      this.orders = data;
      this.filteredOrders = data;
      this.originalOrdersCopy = JSON.parse(JSON.stringify(data));  // Create a deep copy
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

  onOrderStatusChange(event: any, order: any) {
    const target = event.target as HTMLSelectElement; // Get the dropdown element
    const currentorderStatus = order.orderStatus
    const currentStatusId = order.ordersStatusId
    const originalOrder = this.originalOrdersCopy.find(o => o.orderNumber === order.orderNumber);

    this.confirmationService.confirm({
      message: `Are you sure you want to update the status of order "${order.productName}" to "${order.orderStatus}"?`,
      header: 'Confirm Status Change',
      icon: 'pi pi-exclamation-triangle',
      target: target,  // Position relative to the dropdown
      accept: () => {
        if (order.orderStatus === 'notDelivered' && !order.reason) {
          this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please provide a reason for the status change.' });
          return; // Do not submit if no reason is provided
        }

        const body = {
          ordersStatusId: order.ordersStatusId,
          orderStatus: order.orderStatus,
          reason:order.reason
        };

        this.razorPayService.updateOrderStatus(body).subscribe(response => {
          // Handle response after the update.
        });
      },
      reject: () => {
        // Compare with the original order status
        if (originalOrder && (currentorderStatus !== originalOrder.orderStatus || currentStatusId !== originalOrder.ordersStatusId)) {
          // Revert back to the original status and status ID
          order.orderStatus = originalOrder.orderStatus;
        }

      }
    });
  }
  onSubmitReason(order: any) {
    // This method is triggered when the "Submit" button is clicked
    if (order.reason) {
     
      const body = {
        ordersStatusId: order.ordersStatusId,
        orderStatus: order.orderStatus,
        reason:order.reason
      };
      this.razorPayService.updateOrderStatus(body).subscribe(response => {
        // Handle response after the update.
      });
    }
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
