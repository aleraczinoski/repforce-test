import { Controller, Get, Query } from '@nestjs/common';
import { products } from './data/products';

@Controller()
export class AppController {
  @Get('products') // Cria a rota GET /products
  getProducts(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('inStock') inStock?: boolean,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '12',
  ) {
    let produtosFiltrados = products;

    if (category) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.category === category,
      );
    }
    if (brand) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.brand === brand,
      );
    }
    if (minPrice) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.price >= Number(minPrice),
      );
    }
    if (maxPrice) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.price <= Number(maxPrice),
      );
    }
    if (inStock) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.stock > 0,
      );
    }
    if (search) {
      produtosFiltrados = produtosFiltrados.filter((produto) =>
        produto.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    const paginaAtual = Number(page);
    const itensPorPagina = Number(pageSize);

    const total = produtosFiltrados.length;

    const start = (paginaAtual - 1) * itensPorPagina;
    const end = start + itensPorPagina;

    const items = produtosFiltrados.slice(start, end);

    return {
      items,
      total,
      page: paginaAtual,
      pageSize: itensPorPagina,
    };
  }
}
