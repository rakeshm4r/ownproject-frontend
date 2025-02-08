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
    Razorpay: any;

  pay(amount: number,productId:any) {
    const orderData ={
      amount: amount,
      productId: productId
    }

    this.razorpayService.createOrder(orderData).subscribe(response => {
              if (response && response.id) {
                this.loadRazorpay(response.id, amount);
              }
            });
          }
        
          loadRazorpay(orderId: string, amount: number) {
            const options = {
              key: 'your_key_id',  // Your Razorpay Key ID
              amount: amount * 100,  // Convert to paise
              currency: 'INR',
              name: 'Your Company',
              description: 'Product Purchase',
              image: 'https://example.com/logo.png',
              order_id: orderId,
              handler: function (response: any) {
                console.log(response);
                // Send payment details to the server
              },
              prefill: {
                name: 'User Name',
                email: 'user@example.com',
                contact: '9876543210'
              }
            };
            const razorpay = new this.Razorpay(options);
            razorpay.open();
          }
}
