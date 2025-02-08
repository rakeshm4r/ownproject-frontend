import { Component, OnInit } from '@angular/core';
import { CartService } from '../API-Services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent  implements OnInit {
    
    constructor(private cartService: CartService) {}
    isCartEmpty: boolean = false;
    cartDetails: any[] = [];
    ngOnInit(): void {
      this.getCartDetsByUser()
    }


  getCartDetsByUser(){
    this.cartService.getCartDetsByUser().subscribe((cartData: any) => {
     this.cartDetails=cartData
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
getTotalPrice(): number {
  return this.cartDetails.reduce((total, product) => total + product.productPrice, 0);
}

// Calculate the total price of items with quantities
// getTotalPrice(): number {
//   return this.cartDetails.reduce((total, product) => total + (product.productPrice * product.quantity), 0);
// }


}
