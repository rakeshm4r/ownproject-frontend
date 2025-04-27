import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CartService } from '../API-Services/cart.service';
import { ProductService } from '../API-Services/product.service';
import { CredentailsService } from '../API-Services/credentails.service';
import { RazorpayService } from '../API-Services/razorpay.service';
import { Product } from '../ProductInterface';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  selectedProduct: any;
  products: Product[] = [];
  quantity: number = 1;
  totalAmount: number = 0;
  selectedProducts: Product | null = null; // Selected product
  loading :boolean =false;
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
      this.loading = true
      if (productId) {
        this.productService.getProductById(productId).subscribe((product: any) => {
          this.products = product; 
          this.selectedProduct=true
          this.selectedProducts = this.products[0]; 

          if (this.selectedProducts) {
            this.quantity = 1;  // Start with quantity 1
            this.totalAmount = this.selectedProducts.productPrice; // Set initial totalAmount based on the price of 1 item
          }
          this.loading = false;
        });
      }
    }
    increaseQuantity() {
      if (this.selectedProducts && this.quantity < this.selectedProducts.noOfItems) {
        this.quantity++;
        this.totalAmount = this.quantity * this.selectedProducts.productPrice;
      }
    }
  
    decreaseQuantity() {
      if (this.selectedProducts && this.quantity > 1) {
        this.quantity--;
        this.totalAmount = this.quantity * this.selectedProducts.productPrice;
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
 

    pay(amount: number, cartItems: any[], userProfile: any) {
      const orderData = {
        amount: amount,
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
    
      this.razorpayService.createOrder(orderData).subscribe(response => {
        if (response && response.razorpayOrderId && response.amount) {
          this.loadRazorpay(response.razorpayOrderId, cartItems, response.amount, userProfile);
        } else {
          console.error('Razorpay order creation failed:', response);
        }
      });
    }
    
          
    loadRazorpay(orderId: string, cartItems: any[], amount: number, userProfile: any) {
      const options = {
        key: 'rzp_test_be4CL02hCvAVmA',
        amount: amount * 100,  // Razorpay expects paise
        currency: 'INR',
        name: 'Your Company',
        description: 'Product Purchase',
        image: 'https://example.com/logo.png',
        order_id: orderId,
        handler: (response: any) => {
          const paymentDetails = {
            userId: userProfile.userId,
            products: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),
            amount: amount,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
    
          this.saveOrderPaymentDetails(paymentDetails);
        },
        prefill: {
          name: userProfile.userName,
          email: userProfile.emailId,
          contact: userProfile.mobileNo
        }
      };
    
      const razorpay = new Razorpay(options);
      razorpay.open();
    }
    
        
        countdown: number = 10; // Default countdown starts at 10
        countdownTimer: any;
      
        saveOrderPaymentDetails(paymentDetails: { 
          userId: any; 
          products: { productId: number, quantity: number }[]; 
          amount: number; 
          razorpay_payment_id: string; 
          razorpay_order_id: string; 
          razorpay_signature: string;
        }) { 
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



