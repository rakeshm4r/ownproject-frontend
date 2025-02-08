import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../API-Services/product.service';
import { CartService } from '../API-Services/cart.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-show-product-dtls',
  templateUrl: './show-product-dtls.component.html',
  styleUrls: ['./show-product-dtls.component.css']
})
export class ShowProductDtlsComponent implements OnInit {
  selectedProduct: any;
  products: any[] = [];
  constructor(
    private route: ActivatedRoute, private router: Router,private messageService:MessageService,
    private productService: ProductService  ,private cartService:CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const productId = params.get('productName')!;
      this.getProductDetails(productId);
    });
    
  }

  // Fetch product details from your service or data source based on product ID
  getProductDetails(productId: string | null) {
    if (productId) {
      this.productService.getProductById(productId).subscribe((product: any) => {
        this.products = product; // Assign the fetched product data
        this.selectedProduct=true
      });
    }
  }
  handleProductClicked(product: any) {
    this.router.navigate([`/path/${product.productName}`]); 
     
  }

  showBuyNow:boolean=false
  onProductClick(product: any): void {
    const productName = product.productName; 

    // Call the cart service to save the cart details
    this.cartService.saveCartDetails(productName).subscribe({
      next: (response) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail:  response.message +" "+ response.value });
        this.showBuyNow=true
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err });
      }
    });
  }

 
  buyNow(product:any){
  //  this.router.navigate(['/showCart'])
    this.router.navigate(['/order-products', product.productName]); 
  }

}
