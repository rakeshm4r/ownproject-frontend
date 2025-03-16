import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { RazorpayService } from '../API-Services/razorpay.service';
import { OrderDetails } from '../Admin-OrdersDetails_Interface';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-orders-table',
  templateUrl: './admin-orders-table.component.html',
  styleUrls: ['./admin-orders-table.component.css']
})
export class AdminOrdersTableComponent implements OnInit {

  constructor(private razorPayService: RazorpayService,private confirmationService: ConfirmationService, private messageService: MessageService) { }

  @Input() selectedStatus: string = 'Confirmed';
  filteredOrders: OrderDetails[] = [];
  originalOrdersCopy: any[] = [];

  statusMapping: { [key: string]: string } = {
    'Confirmed': 'confirmed',
    'Packed & Shipped': 'packed&shipped',
    'Delivered': 'delivered',
    'Not Delivered': 'notdelivered'
  };
  loading :boolean =false;
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedStatus']) {
      this.filterOrdersByStatus(this.selectedStatus);
    }
  }

  filterOrdersByStatus(status: string) {
    this.loading = true
    const orderStatus = this.statusMapping[status];
    const encodedStatus = encodeURIComponent(orderStatus);

    this.razorPayService.getAdminOrdersByUsers(encodedStatus).subscribe(
      (data) => {
        this.originalOrdersCopy = JSON.parse(JSON.stringify(data));  // Create a deep copy
        
        this.filteredOrders = data.sort((a: any, b: any) => {
          const dateA = new Date(a.modifiedOrderdStatusDate);
          const dateB = new Date(b.modifiedOrderdStatusDate);

          return dateB.getTime() - dateA.getTime(); // descending order
        });
        this.loading = false
      },
      (error) => {
        console.error('Error fetching orders', error);
      }
    );
  }

  isOrderStatusDisabled(): boolean {
    return this.filteredOrders.some(order => order.orderStatus === 'delivered' || order.orderStatus === 'notDelivered');
  }
  isDeliveredOrNotDeliveredPresent(): boolean {
    return this.filteredOrders.some(order => order.orderStatus === 'delivered' || order.orderStatus === 'notDelivered');
  }
  isNotConfirmed(): boolean {
    return this.filteredOrders.some(order => 
      order.orderStatus !== 'confirmed' && 
      ['packed&shipped', 'delivered', 'notDelivered'].includes(order.orderStatus)
    );
  }
  
  
  selectedOrder: any = null; // The order currently being edited
  reasonDialogVisible: boolean = false; // Dialog visibility state

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
        if (order.orderStatus === 'notDelivered' ) {
          this.selectedOrder = order; // Set the selected order
          this.reasonDialogVisible = true; // Open the dialog
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
      this.reasonDialogVisible = false; 
    }
  }

  closeSubmitReason(order:any){
    const originalOrder = this.originalOrdersCopy.find(o => o.orderNumber === order.orderNumber);
    const currentorderStatus = order.orderStatus;
    const currentStatusId = order.ordersStatusId;

    if (originalOrder && (currentorderStatus !== originalOrder.orderStatus || currentStatusId !== originalOrder.ordersStatusId)) {
      // Revert back to the original status and status ID
      order.orderStatus = originalOrder.orderStatus;
    }
    this.reasonDialogVisible = false; 
  }

}
