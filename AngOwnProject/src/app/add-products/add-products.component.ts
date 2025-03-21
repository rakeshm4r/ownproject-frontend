import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ProductService } from '../API-Services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-products',
  templateUrl: './add-products.component.html',
  styleUrls: ['./add-products.component.css']
})
export class AddProductsComponent implements OnInit {

  productForm: FormGroup;
  productCategory: FormGroup;
  categories: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  originalProduct: any = {}; // To store the original values
  searchQuery: string = '';
  categoryName: string = '';
  productNameExists: boolean = false;
  imageBase64: string = '';
  showCategory: boolean = false;
  showPrdsForm: boolean = false;
  isEditing: boolean = false; 

  constructor(private fb: FormBuilder, private http: HttpClient, private messageService: MessageService,
    private router: Router,private productService:ProductService) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]],
      productPrice: ['', Validators.required],
      noOfItems: ['', Validators.required],
      productImage: ['', Validators.required],
      category: ['', Validators.required],
    });
    this.productCategory = this.fb.group({
      productCategoryName: ['', [Validators.required]]
    })

  }

  ngOnInit(): void {
   this.loadProducts()
  }

  loadCategories() {
    this.productService.getAllProductCategorys().subscribe((data: any) => {
      this.categories = data;
      
    });
  }
  loadProducts() {
    this.productService.getAllProducts().subscribe((data: any) => {
      this.products = data;
      this.filteredProducts = data;
      this.products.forEach(product => product.isEditing = false);
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


  showPopupCategory() {
    this.showCategory = true
  }
  showProductsForm() {
    this.showPrdsForm = true
    this.loadCategories()
  }

  addCategory() {
    this.productService.saveCategory(this.productCategory.value).subscribe({
      next: (response) => {
        if (response) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Category Name Successfully saved' });
          this.resetCategoryForm()
          this.showCategory = false          
        }
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Category name already exists' });
      }
    });

  }
  closeCategroy() {
    this.showCategory = false
  }
  selectedFile: File | null = null;
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.convertFileToBase64(file);
    }
  }

  // Convert file to base64
  private convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imageBase64 = reader.result as string; // Base64 string
      this.productForm.patchValue({
        productImage: this.imageBase64  // Store the base64 string in the form
      });
    };
    reader.readAsDataURL(file); // Convert file to base64
  }



  onSubmit() {
    const formData = new FormData();
    const productFormData = this.productForm.value;

    // Append the form data fields
    formData.append('productName', productFormData.productName);
    formData.append('productPrice', productFormData.productPrice);
    formData.append('noOfItems', productFormData.noOfItems);
    formData.append('categoryId', productFormData.category.categoryId);

    // Ensure the file is selected before appending
    if (this.selectedFile) {
      formData.append('productImage', productFormData.productImage);  // Append the selected file
    } else {
      console.log('No image file selected');
      return;
    }

    // Make the HTTP POST request
    this.productService.saveProducts(formData).subscribe({
      next: (response: any) => {
        // Check if the response is a success message from the backend
        if ( response.message  ) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail:  response.message }); // Show the success message received from the server
          this.resetProductForm()
        } 
      },
      error: (error) => {
        // Handle different error statuses appropriately
        if (error.status === 400) {
          // Handle the case when the product name already exists
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Product name already exists' });
        } else if (error.status === 401) {
          // Unauthorized error
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unauthorized request' });
        } else if (error.status === 409) {
          // Conflict error, could be for a duplicate product or something else
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Conflict occurred' });
        } else {
          // General error message for other cases
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving the product' });
        }
      }
    });

  }

  resetProductForm() {
    // Reset the form controls and their values
    this.productForm.reset();
    this.imageBase64 = '';
    // Optionally, reset the categories dropdown (if needed)
    this.productForm.patchValue({
      category: ''
    });
    this.showPrdsForm = false
  }
  resetCategoryForm() {
    // Reset the form controls and their values
    this.productCategory.reset();
    this.showCategory = false
  }
  handleProductClicked(product: any) {
     this.router.navigate(['/show-products', product.productName]); 
  }

  
  // Method to save changes and log only the changed properties
  saveChanges(product: any) {   
    // Check if required fields are valid (i.e., productPrice and noOfItems)
    if (!product.productPrice || product.productPrice < 0) {
      return;
    }
    
    if (!product.noOfItems || product.noOfItems < 0) {
      return;
    }
    // Compare current product with the original product to find changes
    const changedFields = this.getChangedFields(product, product.originalProduct);
   // Check if the categoryId has changed
   if (this.selectedCategory && this.selectedCategory !== product.originalProduct.categoryId) {
    changedFields['categoryId'] = this.selectedCategory; // Use categoryId for update

    const selectedCategory = this.categories.find(c => c.categoryId === this.selectedCategory);
      if (selectedCategory) {
        product.categoryName = selectedCategory.productCategoryName;  // Update the categoryName field
      }
  }
    if (Object.keys(changedFields).length > 0) {   
  
      // Send the updated product data to the backend     

      this.productService.updateProduct(product.productId, changedFields).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: response.message });
                 product.isEditing = false; // Exit edit mode after save
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error });
        }
      });
    } else {
      product.isEditing = false;
    }
  }
  

// Method to compare the current and original product values and return the changed fields
getChangedFields(currentProduct: any, originalProduct: any) {
  // If originalProduct is not defined, return an empty object to avoid errors
  if (!originalProduct) {
    console.error('Original product data is missing');
    return {};
  }

  const changedFields = {} as { [key: string]: any };

  // Compare fields and track changes 
  // dissable the productName dont comapre....
  // if (currentProduct.productName !== originalProduct.productName) {
  //   changedFields['productName'] = currentProduct.productName;
  // }
  if (currentProduct.productPrice !== originalProduct.productPrice) {
    changedFields['productPrice'] = currentProduct.productPrice;
  }
  if (currentProduct.noOfItems !== originalProduct.noOfItems) {
    changedFields['noOfItems'] = currentProduct.noOfItems;
  }
 if (this.selectedCategory !== originalProduct.categoryId) {
    changedFields['categoryId'] = this.selectedCategory; // Use categoryId for update
  }

  return changedFields;
}

selectedCategory: any;

editProduct(product: any) {
  // Fetch categories and populate them
  this.productService.getAllProductCategorys().subscribe((data: any) => {
    this.categories = data; // Populate categories

    // Find the categoryId that matches the product's categoryName
    const category = this.categories.find(c => c.productCategoryName === product.categoryName);
    
    if (category) {
      this.selectedCategory = category.categoryId; // Set the selectedCategory to the matching categoryId
    } else {
      console.error("Category not found for product:", product.categoryName);
    }

    console.log(this.selectedCategory); // This will print the categoryId of the selected category
  });

  // Backup logic for original product data
  if (!product.originalProduct) {
    product.originalProduct = { ...product }; // Create a deep copy
  }

  // Close any previously opened edit form
  this.products.forEach(p => {
    if (p.isEditing && p !== product) {
      this.cancelEdit(p); // Cancel previous edits if any
    }
  });

  // Enable edit mode for the current product
  product.isEditing = true;
}




// Cancel the changes and revert to the original state
cancelEdit(product: any) {
  // Revert the product back to its original state
  Object.assign(product, product.originalData);
  product.isEditing = false;
}
}
