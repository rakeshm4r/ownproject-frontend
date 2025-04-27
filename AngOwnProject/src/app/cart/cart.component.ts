import { Component, OnInit } from '@angular/core';
import { CartService } from '../API-Services/cart.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ProductService } from '../API-Services/product.service';
import { RazorpayService } from '../API-Services/razorpay.service';
import { Product } from '../ProductInterface';
import { CredentailsService } from '../API-Services/credentails.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent  implements OnInit {
    
    constructor(private cartService: CartService,private router: Router,private messageService:MessageService,
      private credentialsService:CredentailsService, private productService: ProductService, private razorpayService: RazorpayService ) {}
    isCartEmpty: boolean = false;
    cartDetails: any[] = [];
    loading :boolean =false;

    ngOnInit(): void {
      this.getCartDetsByUser();this.getUserProfile() 
    }


  getCartDetsByUser(){
    this.loading = true
    this.cartService.getCartDetsByUser().subscribe((cartData: any) => {
      this.cartDetails = cartData.map((item: any) => ({
        ...item,
        quantity: 1, // default quantity
        totalAmount: item.productPrice // default total amount = 1 * price
      }));
     this.loading = false
   
     if (this.cartDetails.length === 0) {
      this.isCartEmpty = true;  // Set the flag if the cart is empty
    } else {
      this.isCartEmpty = false;  // Reset the flag if there are items in the cart
    }
    
    });
  }

  removeProduct(cartId:any){
    this.cartService.removeProductFromCart(cartId).subscribe((cartData: any) => {
      this.getCartDetsByUser()
    });
  }

  // Calculate the total price of items in the cart
// getTotalPrice(): number {
//   return this.cartDetails.reduce((total, product) => total + product.productPrice, 0);
// }

// Calculate the total price of items with quantities
getTotalPrice(): number {
  return this.cartDetails.reduce((total, product) => total + (product.productPrice * product.quantity), 0);
}

selectedProduct: any;
  products: Product[] = [];
  quantity: number = 1;
  totalAmount: number = 0;
  selectedProducts: Product | null = null; // Selected product
 // Fetch product details from your service or data source based on product ID
 

increaseQuantity(product: any) {
  debugger
  if (product.quantity < product.noOfItems) {
    product.quantity++;
    product.totalAmount= product.quantity * product.productPrice;
  }
}

decreaseQuantity(product: any) {
  if (product.quantity > 1) {
    product.quantity--;
    product.totalAmount= product.quantity * product.productPrice;
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
