import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  Body,
  NotFoundException, //404
  BadRequestException, //400
  HttpCode,
} from '@nestjs/common';
import { products } from './data/products';
import { z } from 'zod';
import { get } from 'http';

const getProductsSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z
    .string()
    .optional()
    .transform((val) => val === 'true'), //Converte para boolean
  search: z.string().optional(),
  page: z.coerce.number().default(1), //coerce.number(): String -> Number
  pageSize: z.coerce.number().default(12),
});

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
  getProducts(@Query() query: any) {
    const result = getProductsSchema.safeParse(query);

    if (!result.success) {
      throw new BadRequestException({
        message: 'Falha na validação dos filtros',
        errors: result.error.format(),
      });
    }

    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      search,
      page,
      pageSize,
    } = result.data;

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
    if (minPrice !== undefined) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.price >= minPrice,
      );
    }
    if (maxPrice !== undefined) {
      produtosFiltrados = produtosFiltrados.filter(
        (produto) => produto.price <= maxPrice,
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

    const total = produtosFiltrados.length;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const items = produtosFiltrados.slice(start, end);

    return {
      items,
      total,
      page,
      pageSize,
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
  @HttpCode(201)
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

  // Cria a rota GET /quotes
  @Get('quotes')
  getQuotes() {
    return quotes;
  }
}
