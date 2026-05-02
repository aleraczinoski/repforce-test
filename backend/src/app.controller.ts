import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  NotFoundException, //404
  BadRequestException, //400
} from '@nestjs/common';
import { products } from './data/products';
import { z } from 'zod';

const createQuoteSchema = z.object({
  productId: z.string().min(1, 'ID do produto é obrigatório'),
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail com formato inválido'),
  phone: z
    .string()
    .min(10, 'Mínimo de 10 dígitos')
    .regex(/^\d+$/, 'Apenas números'),
  company: z.string().min(1, 'O nome da empresa é obrigatório'),
  quantity: z
    .number()
    .int('A quantidade deve ser um número inteiro')
    .min(1, 'A quantidade mínima é 1'),
  observations: z.string().max(500, 'Máximo de 500 caracteres').optional(),
});

// Cria um tipo TypeScript baseado no schema do Zod
type Quote = z.infer<typeof createQuoteSchema> & {
  id: string; // id da cotação
  createdAt: string;
};

// Emulando um banco de dados em memória para as cotações
const quotes: Quote[] = [];

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

  // Cria a rota GET /products/:id
  @Get('products/:id')
  getProductById(@Param('id') id: string) {
    const produto = products.find((p) => p.id === id);

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    return produto;
  }

  // Cria a rota POST /quotes
  @Post('quotes')
  createQuote(@Body() body: any) {
    // Validação dos dados que chegam
    const result = createQuoteSchema.safeParse(body); //Valida o body (success é um boolean)

    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos dados',
        errors: result.error.format(),
      });
    }

    const produto = products.find((p) => p.id === result.data.productId);

    // Verifica se o produto existe
    if (!produto) {
      throw new NotFoundException('Produto referenciado não encontrado');
    }

    // Verifica se existe estoque suficiente
    if (result.data.quantity > produto.stock) {
      throw new BadRequestException(
        `A quantidade solicitada supera o estoque disponível (${produto.stock})`,
      );
    }

    // Cria a cotação e coloca no array de quotes
    const novaCotacao = {
      id: `quote-${Date.now()}`, //Cria um ID com base na data atual em milissegundos para não possuir um id de cotação igual
      ...result.data,
      createdAt: new Date().toISOString(),
    };

    quotes.push(novaCotacao);

    return novaCotacao;
  }
}
