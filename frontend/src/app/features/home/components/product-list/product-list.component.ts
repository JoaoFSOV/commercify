import { Component, OnInit } from '@angular/core';

import { ProductService } from '../../../products/services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [],
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
      },
      error: (error) => {
        console.error("Error fetching products: ", error);
      },
    });
  }
}
