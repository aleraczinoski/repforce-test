import { Controller, Get } from '@nestjs/common';
import { products } from './data/products';

@Controller()
export class AppController {
  @Get('products') // Cria a rota GET /products
  getProducts() {
    return products; // Capta os produtos
  }
}
