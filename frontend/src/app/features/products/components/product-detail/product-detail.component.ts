import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})

export class ProductDetailComponent implements OnInit {
  product: any;
  slug: String = "";

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(params['slug']) {
        this.slug = params['slug'];
      }
    });

    this.getProduct();
  }

  getProduct() {
    console.log("Fetching product with the slug: ", this.slug);
    this.productService.getProduct(this.slug).subscribe({
      next: (response) => {
        console.log("Here are the product: ", response);
        this.product = response.product;
        console.log("This.product: ", this.product);
      },
      error: (error) => {
        console.error("Error fetching product: ", error);
      }
    });
  }
}
