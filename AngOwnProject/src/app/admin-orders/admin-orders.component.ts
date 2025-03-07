import { Component, OnInit , ChangeDetectorRef} from '@angular/core';
import { OrderDetails } from '../Admin-OrdersDetails_Interface';
import { RazorpayService } from '../API-Services/razorpay.service';
import { CredentailsService } from '../API-Services/credentails.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent  implements OnInit {

  constructor(private razorPayService:RazorpayService,private credentailsService: CredentailsService,private changeDetectorRef: ChangeDetectorRef){}

  orders: OrderDetails[] = [];  
  users: any[] = [];  // List of users to display
  selectedUserOrders: any[] = [];  // Orders for the selected user
  selectedUserName: any = '';  // Name of the selected user
  noOrdersFound:boolean=false;
  
  usersOrdersMap: { [key: string]: any[] } = {};      // Map to store orders per user.
  selectedUser: string | null = null; // To track selected user.
 // newOrders: string[] = [];
  newOrders: { [username: string]: number } = {};

  
  ngOnInit(): void {
    // this.credentailsService.getAllUsers().subscribe(users => {
    //   this.users = users;
    // }); // Fetch the list of users when the component is initialized
   
    this.loadOrders();
  }
 

  //If new Order is want
  loadOrders(): void {
    this.razorPayService.getAdminOrdersByUsers().subscribe(data => {
      this.orders = data;
      // Map orders by username
      this.orders.forEach(order => {
        const username = order.userName;
        if (!this.usersOrdersMap[username]) {
          this.usersOrdersMap[username] = [];
        }
        this.usersOrdersMap[username].push(order);
        // Check if the user has new orders
        this.checkNewOrders(username);
      });
      
    });
  }

  // Toggle orders for the selected user
  toggleOrders(username: string): void {
    if (this.selectedUser === username) {
      // If user is already selected, hide their orders
      this.selectedUser = null;
    } else {
      // Otherwise, select the new user and show their orders
      this.selectedUser = username;
      // Check if the user has new orders
      //this.checkNewOrders(username);
    }
  }

  // Check if there are new orders for a selected user
  checkNewOrders(username: string): void {
    const ordersForUser = this.usersOrdersMap[username] || [];
    
    // Count the number of orders delivered within the last 1 day
    let newOrderCount = 0;
  
    ordersForUser.forEach(order => {
      const lastOrderDate = new Date(order.deliveredOrderdDate); // Exact timestamp
      const currentDate = new Date();
  
      // Set the time window for "new orders" (e.g., last 1 day)
      const timeWindow = 1 * 24 * 60 * 60 * 1000; // 1 day in milliseconds
  
      // If the order was delivered within the last 1 day, it's considered a new order
      if (Math.abs(currentDate.getTime() - lastOrderDate.getTime()) < timeWindow) {
        if (order.orderStatus !== 'delivered'  ) {
            newOrderCount++; // Increment the new order count for each order within the time window
        }
      }
    });
  
    // If new orders exist, add to the newOrders map
    if (newOrderCount > 0) {
      this.newOrders[username] = newOrderCount; // Store the count of new orders for the user
    } else {
      delete this.newOrders[username]; // Remove the user from newOrders if no new orders
    }
  }
  
  get userKeys(): string[] {
    return Object.keys(this.usersOrdersMap);
  }
  
  // Handle user click and fetch their order details
  onUserClick(user: any): void {
    if (this.selectedUserName === user.userName) {
      // If the user is already selected, toggle the order details visibility
      this.selectedUserName = null;
      this.selectedUserOrders = [];
    } else {
      // If a new user is clicked, show the orders for that user
      this.selectedUserName = user.userName;
      this.selectedUserOrders = this.orders; // This would be a call to fetch orders for the selected user

      this.razorPayService.getUserOrders(user.userId).subscribe(orders => {
        if (orders && orders.length > 0) {
          this.selectedUserOrders = orders;  // Orders exist
        } else {
          this.noOrdersFound=true
          this.selectedUserOrders = [];  // No orders found, set empty array
        }
      });
    }
  }

  onOrderStatusChange(order:any) {
 // alert(`Order status for ${order.productName} updated to: ${order.orderStatus} following user: ${order.userName} --- ${order.ordersStatusId}`);  
  const body = {
    ordersStatusId: order.ordersStatusId,
    orderStatus: order.orderStatus
  };
  this.razorPayService.updateOrderStatus(body).subscribe(response => {
  })
  this.checkNewOrders(order.userName);
 // this.changeDetectorRef.markForCheck(); 
  }
}
//&& order.orderStatus !== 'confirmed'  &&| order.orderStatus !== 'notDelivered' && order.orderStatus !== 'pending' 