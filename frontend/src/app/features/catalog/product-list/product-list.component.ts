import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductService } from '../../products/services/product.service';
import { ProductComponent } from '../../products/components/product/product.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit{
  products: any = [];

  constructor(
    private productService: ProductService,
  ){}

  ngOnInit(): void {
    this.getProducts();
    console.log(this.products);
  }

  getProducts() {
    this.productService.getProducts().subscribe({
      next: (response) => {
        console.log("Here are the products: ", response);
        this.products = response.products;
        console.log(this.products);
      },
      error: (error) => {
        console.error("Error fetching products: ", error);
      },
    });
  }
}

