import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CartService } from '../API-Services/cart.service';
import { ProductService } from '../API-Services/product.service';
import { CredentailsService } from '../API-Services/credentails.service';
import { RazorpayService } from '../API-Services/razorpay.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  selectedProduct: any;
  products: any[] = [];

  constructor(
      private route: ActivatedRoute, private router: Router,private messageService:MessageService,
      private productService: ProductService ,private cartService:CartService,private credentialsService:CredentailsService,
      private razorpayService: RazorpayService
    ) {}
  
    ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
        const productId = params.get('productName')!;
        this.getProductDetails(productId);
      });
      this.getUserProfile()
    }
  
    // Fetch product details from your service or data source based on product ID
    getProductDetails(productId: string | null) {
      if (productId) {
        this.productService.getProductById(productId).subscribe((product: any) => {
          this.products = product; 
          this.selectedProduct=true
        });
      }
    }

    userProfile: any = null;
    getUserProfile() {
      const userId = this.credentialsService.getUserId()
      this.credentialsService.getUserProfile(userId).subscribe(
        (response: any) => {
          this.userProfile = response;  
        },
        (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
        }
      );
    }


    saveOrder(productId:any){
    }
 

  pay(amount: number,productId:any,userProfile:any) {
    const orderData ={
      amount: amount,
      productId: productId
    }

    this.razorpayService.createOrder(orderData).subscribe(response => {
      console.log("Received response: ", response);
      if (response && response.razorpayOrderId && response.amount) {
        // Pass the orderId and amount to the loadRazorpay function
        this.loadRazorpay(response.razorpayOrderId,productId, response.amount,userProfile);
      } else {
        // Handle error or missing data from the backend response
        console.error('Razorpay order creation failed: Invalid response', response);
      }
            });
      }
        
      loadRazorpay(orderId: string, productId: any, amount: number, userProfile: any) {
        if (typeof Razorpay === "undefined") {
          console.error("Razorpay SDK not loaded properly");
          return;
        }
      
        const options = {
          key: 'rzp_test_be4CL02hCvAVmA',  // Your Razorpay Key ID
          amount: amount * 100,  // Convert to paise
          currency: 'INR',
          name: 'Your Company',
          description: 'Product Purchase',
          image: 'https://example.com/logo.png',
          order_id: orderId,
          handler: (response: any) => {  // Arrow function to bind `this`
          //  console.log("Payment Response: ", response);
      
            const paymentDetails = {
              userId: userProfile.userId,  // Ensure this is available in userProfile
              productId: productId,  // You can pass product ID from the server if necessary
              amount: amount,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature:response.razorpay_signature
            };
      
            // Call the saveOrderPaymentDetails method
           this.saveOrderPaymentDetails(paymentDetails);  
          
          },
          prefill: {
            name: userProfile.userName,
            email: userProfile.emailId,
            contact: userProfile.mobileNo
          }
        };
      
        // Initialize Razorpay payment window
        const razorpay = new Razorpay(options);
        razorpay.open();
      }
      
      countdown: number = 10; // Default countdown starts at 10
      countdownTimer: any;
    
      saveOrderPaymentDetails(paymentDetails: { userId: any; productId: any; amount: number; razorpay_payment_id: any; razorpay_order_id: any }) {
        this.razorpayService.saveOrderpaymentDetails(paymentDetails).subscribe(
          (response: any) => {
            if (response.message) {              
              this.router.navigate(['/order-confirmation']);
            }         
          },
          error => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
          }
        );
      }
      
}



