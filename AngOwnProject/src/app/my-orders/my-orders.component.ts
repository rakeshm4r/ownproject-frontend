import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RazorpayService } from '../API-Services/razorpay.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

   constructor(private razorPayService:RazorpayService,private confirmationService: ConfirmationService,
     private messageService: MessageService,private changeDetectorRef: ChangeDetectorRef,private router: Router){}

  ngOnInit(): void {
    this.loadProducts()
  }

  products: any[] = [];
  expandedUser: string | null = null;
  originalOrdersCopy: any[] = [];

  loading :boolean =false;

  loadProducts() {
    this.loading = true
    this.razorPayService.getMyOrders().subscribe((data: any) => {
      
      this.originalOrdersCopy = JSON.parse(JSON.stringify(data));  // Create a deep copy

      //descending order for Orders
      this.products = data.sort((a: any, b: any) => {
        const dateA = new Date(a.modifiedOrderdStatusDate);
        const dateB = new Date(b.modifiedOrderdStatusDate);

        return dateB.getTime() - dateA.getTime(); // descending order
      });
      this.loading = false;
    });
  }

  selectedOrder: any = {};// The order currently being edited
  reasonDialogVisible: boolean = false; // Dialog visibility state

  onSubmitReason(order: any) {
    // This method is triggered when the "Submit" button is clicked
    if (order.reason) {     
      const body = {
        ordersStatusId: order.ordersStatusId,
        orderStatus: 'cancelled',
        reason: order.reason
      };
      this.razorPayService.updateOrderStatus(body).subscribe(response => {
        // Handle response after the update.
        this.products = this.products.map(o => o.ordersStatusId === order.ordersStatusId 
          ? { ...o, orderStatus: 'cancelled' }
          : o);
       
       this.changeDetectorRef.detectChanges();
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
  openCancelDialog(order: any) {
    // Ensure selectedOrder is never null, set a default object if necessary
    this.selectedOrder = order ? { ...order, reason: order.reason || '' } : { reason: '' };
    this.reasonDialogVisible = true; // show the dialog
  }
  
  seeProduct(order: any) {
    this.router.navigate(['/show-products', order.productName]);
  }
  
  getOrderStatusStyle(status: string) {
    switch (status) {
      case 'cancelled':
      case 'notDelivered':
        return { 'color': 'red' };
      case 'delivered':
        return { 'color': 'green' };
      case 'confirmed':
      case 'packed&shipped':
        return { 'color': 'orange' };
      default:
        return { 'color': 'black' }; // Default color
    }
  }
  generatePDF(order: any): void {
    const doc = new jsPDF();
  
    // Add brand logo
    const logoUrl = 'assets/Brand_Logo/mrk-1.webp';
    doc.addImage(logoUrl, 'PNG', 160, 10, 30, 20);
  
    // Set title
    doc.setFontSize(18);
    doc.setTextColor(0, 128, 128);
    doc.text('INVOICE', 15, 20);
  
    // Invoice details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice No: #${order.orderNumber || 'N/A'}`, 15, 30);
    doc.text(`Date: ${this.formatDate(order.bookedOrderdDate) || 'N/A'}`, 150, 30);
  
    // Bill To Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 15, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(order.userDetails?.userName || 'N/A', 15, 45);
    doc.text(order.userDetails?.address || 'N/A', 15, 50);
    doc.text(`${order.userDetails?.city || 'N/A'}, ${order.userDetails?.state || 'N/A'}`, 15, 55);
    doc.text(order.userDetails?.mobileNo || 'N/A', 15, 60);
  
    // Order Summary (since items are missing)
    const summaryY = 80;
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER SUMMARY:', 15, summaryY);
  
    doc.setFont('helvetica', 'normal');
    doc.text(`Product Name: ${order.productName || 'N/A'}`, 15, summaryY + 10);
    //doc.text(`Payment Amount: $${(order.paymentAmount || 0).toFixed(2)}`, 15, summaryY + 20);
    // Payment Amount with Rupee Symbol
    // Payment Amount with Rupee Symbol (No Gap)
    doc.text('Payment Amount:', 15, summaryY + 20); // "Payment Amount:" text

    const rupeeImage = 'assets/rupee-indian.png'; // Ensure the image path is correct
    const rupeeX = doc.getTextWidth('Payment Amount: ') + 17; // Dynamically position the rupee symbol
    doc.addImage(rupeeImage, 'PNG', rupeeX, summaryY + 17, 4, 4); // Small rupee symbol (3x3)

    const amountX = rupeeX + 4; // Position amount right after the rupee symbol
    doc.text(`${(order.paymentAmount || 0).toFixed(2)}`, amountX, summaryY + 20); // Amount value


    doc.text(`Payment Status: ${order.paymentStatus || 'N/A'}`, 15, summaryY + 30);
    doc.text(`Payment Type: ${order.paymentTypeName || 'N/A'}`, 15, summaryY + 40);
    doc.text(`Order Status: ${order.orderStatus || 'N/A'}`, 15, summaryY + 50);
  
    // Total Payment
    // doc.text(`TOTAL AMOUNT: $${(order.paymentAmount || 0).toFixed(2)}`, 150, summaryY + 60);
 
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT:', 140, summaryY + 70); // "TOTAL AMOUNT:" text

    
    const rupeeX1 = 178; // Move rupee symbol slightly left
    doc.addImage(rupeeImage, 'PNG', rupeeX1, summaryY + 67, 4, 4); // Smaller rupee symbol (4x4)

    const amountX1 = rupeeX1 + 5; // Reduce the gap between image and amount
    doc.text(`${(order.paymentAmount || 0).toFixed(2)}`, amountX1, summaryY + 70); // Amount value

    // Footer
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 128);
    // Footer - Centered Text
    const pageWidth = doc.internal.pageSize.width; // Get page width
    const footerText = 'Thank you for your business!';
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - textWidth) / 2, summaryY + 80);
    // Save PDF
    doc.save(`${order.orderNumber || 'Invoice'}.pdf`);
  }
  
  

  /// for If you have a noof Itemsitems
  // generatePDF(order: any): void {
  //   const doc = new jsPDF();
  
  //   // Add brand logo to the top-right corner
  //   const logoUrl = 'assets/Brand_Logo/mrk-1.webp'; // Adjust path
  //   doc.addImage(logoUrl, 'PNG', 160, 10, 30, 30); // (x, y, width, height)
  
  //   // Set title
  //   doc.setFontSize(18);
  //   doc.setTextColor(0, 128, 128); // Teal color
  //   doc.text('INVOICE', 15, 20);
  
  //   // Invoice details
  //   doc.setFontSize(12);
  //   doc.setTextColor(0, 0, 0);
  //   doc.text(`Invoice No: #${order.orderNumber}`, 15, 30);
  //   doc.text(`Date: ${this.formatDate(order.bookedOrderdDate)}`, 150, 30);
  
  //   // Bill To & Ship To Section
  //   doc.setFontSize(12);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('BILL TO:', 15, 40);
  //   doc.text('SHIP TO:', 110, 40);
  
  //   doc.setFont('helvetica', 'normal');
  //   doc.text(`${order.userDetails.name}`, 15, 45);
  //   doc.text(`${order.userDetails.address}`, 15, 50);
  //   doc.text(`${order.userDetails.city}, ${order.userDetails.state}`, 15, 55);
  //   doc.text(`${order.userDetails.mobileNo}`, 15, 60);
  
   
  //   doc.text(`${order.userDetails.address}`, 110, 50);
  //   doc.text(`${order.userDetails.city}, ${order.state}`, 110, 55);
  //   doc.text(`${order.userDetails.mobileNo}`, 110, 60);
  
  //   // Order Details Table
  //   const table = autoTable(doc, {
  //     startY: 70,
  //     head: [['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']],
  //     body: order.items.map((item: any) => [
  //       item.productName,
  //       item.quantity,
  //       `$${item.unitPrice.toFixed(2)}`,
  //       `$${(item.quantity * item.unitPrice).toFixed(2)}`,
  //     ]),
  //     theme: 'grid',
  //     headStyles: { fillColor: [0, 128, 128], textColor: [255, 255, 255] },
  //     bodyStyles: { fontSize: 10 },
  //   });
  
  //   // Calculations
  //   const subTotal = order.items.reduce((acc: number, item: any) => acc + item.quantity * item.unitPrice, 0);
  //   const discount = order.discount || 0;
  //   const taxRate = 0.08; // 8% Tax
  //   const tax = (subTotal - discount) * taxRate;
  //   const shipping = order.shipping || 2.99;
  //   const balanceDue = subTotal - discount + tax + shipping;
  
  //   // Summary Section
  //   const summaryY = (table as any).lastAutoTable?.finalY ?? 80;
  //   doc.text(`SUBTOTAL: $${subTotal.toFixed(2)}`, 150, summaryY);
  //   doc.text(`DISCOUNT: $${discount.toFixed(2)}`, 150, summaryY + 5);
  //   doc.text(`TAX (8%): $${tax.toFixed(2)}`, 150, summaryY + 10);
  //   doc.text(`SHIPPING: $${shipping.toFixed(2)}`, 150, summaryY + 15);
    
  //   doc.setFont('helvetica', 'bold');
  //   doc.text(`BALANCE DUE: $${balanceDue.toFixed(2)}`, 150, summaryY + 25);
  
  //   // Payment Instructions
  //   doc.setFont('helvetica', 'normal');
  //   doc.setFontSize(10);
  //   doc.text(
  //     'Make all checks payable to <Company Name>. Or submit payment via Venmo or PayPal.',
  //     15,
  //     summaryY + 40
  //   );
  
  //   // Client Signature
  //   doc.text('Client Signature: ______________________', 15, summaryY + 50);
  
  //   // Footer
  //   doc.setFontSize(12);
  //   doc.setTextColor(0, 128, 128);
  //   doc.text('Thank you for your business!', 15, summaryY + 65);
  
  //   // Save PDF
  //   doc.save(`${order.orderNumber}_Invoice.pdf`);
  // }
  formatDate(date:any) {
    if (!date) return ''; // If no date, return empty string
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); // Pad single digit days with leading zero
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = d.getFullYear();
    
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
  }
}
