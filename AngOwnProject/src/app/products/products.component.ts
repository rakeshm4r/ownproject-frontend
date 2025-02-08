import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ProductService } from '../API-Services/product.service';
import { Product } from '../ProductInterface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  @Output() productClicked = new EventEmitter<any>();
  
   constructor(private fb: FormBuilder, private http: HttpClient, private messageService: MessageService,
     private router: Router, private productService:ProductService) {}

    products: any[] = [];
    filteredProducts: any[] = [];
    searchQuery: string = '';

  ngOnInit(): void {
    this.loadProducts()
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe((data: any) => {
      this.products = data;
      this.filteredProducts = data;
    });
  }

  filterProducts() {
    if (this.searchQuery.trim() === '') {
      this.filteredProducts = this.products;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.products.filter(product => 
        product.productName.toLowerCase().includes(query) || 
        product.categoryName.toLowerCase().includes(query)
      );
    }
  }
 

  onProductClick(product: any) {
    this.productClicked.emit(product);
    this.router.navigate(['/show-products', product.productName]); 
  }


 

}
