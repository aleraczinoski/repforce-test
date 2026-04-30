import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "../components/ProductCard";
import type { ProductResponse } from "@/types/productResponse";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CatalogPage() {
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [estoque, setEstoque] = useState(false);
  const [busca, setBusca] = useState("");
  const [buscaFiltro, setBuscaFiltro] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10000);
  const [minFiltro, setMinFiltro] = useState(0);
  const [maxFiltro, setMaxFiltro] = useState(10000);
  const [page, setPage] = useState(1);

  /*
   * Busca produtos da API com filtros e paginação usando React Query.
   *
   * @returns
   * - data: objeto contendo:
   *    - items: lista de produtos
   *    - total: total de produtos encontrados
   *    - page: página atual
   *    - pageSize: quantidade por página
   * - isLoading: indica se a requisição está em andamento
   */
  const { data, isLoading, isFetching } = useQuery<ProductResponse>({
    queryKey: [
      "products",
      categoria,
      marca,
      minFiltro,
      maxFiltro,
      estoque,
      buscaFiltro,
      page,
    ],
    queryFn: async () => {
      const response = await api.get<ProductResponse>("/products", {
        params: {
          category: categoria,
          brand: marca,
          minPrice: minFiltro !== minRange ? minFiltro : undefined,
          maxPrice: maxFiltro !== maxRange ? maxFiltro : undefined,
          inStock: estoque ? true : false,
          search: buscaFiltro || undefined,
          page: page,
          pageSize: 12,
        },
      });
      return response.data;
    },
    placeholderData: keepPreviousData,
  });

  // Armazenar informações de todos os produtos para não atualizar as opções durante a filtragem
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["allProducts"],
    queryFn: async () => {
      const response = await api.get<ProductResponse>("/products", {
        params: {
          pageSize: 1000,
        },
      });
      return response.data.items;
    },
  });

  const produtos = data?.items ?? [];

  // Preço máximo e mínimo
  const prices = allProducts.map((p) => p.price);

  const minRange = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  const maxRange = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000;

  // Range duplo alterado
  useEffect(() => {
    if (allProducts.length > 0) {
      setMin(minRange);
      setMax(maxRange);
    }
  }, [allProducts.length, minRange, maxRange]); //Array de dependências -> Usa o useEffect quando o minRange, maxRange ou o tamanho do array mudar

  // Debounce da busca e do range -> Controla para não fazer diversas requisições
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBuscaFiltro(busca);
      setMinFiltro(min);
      setMaxFiltro(max);
      setPage(1); // Retorna para a página 1 ao terminar de digitar/ajustar preço
    }, 500);

    return () => clearTimeout(timeout);
  }, [busca, min, max]); // Array de dependências -> Usa o useEffect quando o minRange, maxRange ou a busca mudar

  // Lista de marcas e categorias
  const marcas = [...new Set(allProducts.map((produto) => produto.brand))];
  const categorias = [
    ...new Set(allProducts.map((produto) => produto.category)),
  ];

  const pages = Math.ceil(data ? data?.total / data?.pageSize : 0);

  return (
    <main className='flex min-h-screen bg-gray-50 p-6 gap-6'>
      {/* Painel lateral de Filtros */}
      <aside className='w-full max-w-xs h-fit rounded-xl bg-white p-6 shadow-sm border border-gray-200'>
        <h2 className='mb-6 text-lg font-semibold text-gray-800'>Filtros</h2>

        <form className='flex flex-col gap-6'>
          {/* Categoria */}
          <div className='grid gap-2'>
            <Label htmlFor='selectCategory'>Categoria</Label>
            <Select
              value={categoria}
              onValueChange={(value) => {
                setCategoria(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger id='selectCategory'>
                <SelectValue placeholder='Selecione a categoria' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas as categorias</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Marca */}
          <div className='grid gap-2'>
            <Label htmlFor='selectBrand'>Marca</Label>
            <Select
              value={marca}
              onValueChange={(value) => {
                setMarca(value === "all" ? "" : value);
                setPage(1);
              }}
            >
              <SelectTrigger id='selectBrand'>
                <SelectValue placeholder='Selecione a marca' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todas as marcas</SelectItem>
                {marcas.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Faixa de preço */}
          <div className='grid gap-4'>
            <Label>Faixa de preço</Label>
            <Slider
              value={[min, max]}
              min={minRange}
              max={maxRange}
              step={1}
              onValueChange={([newMin, newMax]) => {
                setMin(newMin);
                setMax(newMax);
              }}
              disabled={allProducts.length === 0}
            />
            <div className='flex justify-between text-xs font-medium text-muted-foreground'>
              <span>R$ {min}</span>
              <span>R$ {max}</span>
            </div>
          </div>

          {/* Disponível em estoque */}
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='stock'
              checked={estoque}
              onCheckedChange={(checked) => {
                setEstoque(Boolean(checked));
                setPage(1);
              }}
            />
            <Label
              htmlFor='stock'
              className='cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              Disponível em estoque
            </Label>
          </div>

          {/* Buscar */}
          <div className='grid gap-2'>
            <Label htmlFor='busca'>Buscar</Label>
            <Input
              type='text'
              id='busca'
              placeholder='Busque um produto'
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Limpar Filtros */}
          <Button
            type='button'
            variant='ghost'
            className='w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700'
            onClick={() => {
              setCategoria("");
              setMarca("");
              setMin(minRange);
              setMax(maxRange);
              setEstoque(false);
              setBusca("");
              setPage(1);
            }}
          >
            Limpar Filtros
          </Button>
        </form>
      </aside>

      {/* Lista de Produtos */}
      <section
        className={`grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 content-start transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        {isLoading ? (
          <p className='text-center col-span-full mt-4'>
            Carregando produtos...
          </p>
        ) : produtos.length > 0 ? (
          produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))
        ) : (
          <p className='text-center col-span-full mt-4'>
            Nenhum produto encontrado
          </p>
        )}
        {
          // Paginação
          pages > 1 && (
            <div className='col-span-full flex justify-center items-center gap-4 mt-8'>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant='outline'
                size='icon'
              >
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <span className='text-sm font-medium text-gray-700'>
                Página {page} de {pages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                variant='outline'
                size='icon'
              >
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )
        }
      </section>
    </main>
  );
}
