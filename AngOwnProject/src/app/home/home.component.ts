import { Component, OnDestroy, OnInit } from '@angular/core';
import { CarouselService } from '../UI-Services/carousel.service';
import { ProductService } from '../API-Services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(public carouselService: CarouselService,private router: Router,
    private productService:ProductService) {}

  ngOnInit(): void {
    // Start auto sliding when component is initialized
    this.carouselService.startAutoSlide(5000);  // Change image every 3 seconds
    
  }
  
  ngOnDestroy(): void {
    // Clean up if necessary (not required here, but a good practice)
  }

  prev() {
    this.carouselService.prevImage();
  }

  next() {
    this.carouselService.nextImage();
  }

  userId = sessionStorage.getItem('userId');

  logOut(){
    sessionStorage.removeItem('userId');
    window.location.reload();
  }
  handleProductClicked(product: any) {
    this.router.navigate(['/show-products', product.productName]);   
  }

  selectedProduct: any;  // This will store the selected product details

  selectProduct(product: any) {
    this.selectedProduct = product;  // Set the selected product
  }
}
