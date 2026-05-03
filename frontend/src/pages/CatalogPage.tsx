import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import type { Product } from "@/types/product";
import ProductCard from "../components/ProductCard";
import type { ProductResponse } from "@/types/productResponse";
import type { CatalogSearch } from "@/types/catalogSearch";
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
import { useFavorites } from "../hooks/useFavorites";
import { Heart } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";

export default function CatalogPage() {
  const searchParams: CatalogSearch = useSearch({ strict: false }); // Lê a URL e transforma em um objeto JavaScript
  const navigate = useNavigate(); // Permite mudar a URL

  // Acessa os elementos de filtro na URL
  const categoria = searchParams.categoria || "";
  const marca = searchParams.marca || "";
  const estoque = searchParams.estoque === true;
  const buscaFiltro = searchParams.busca || "";
  const page = Number(searchParams.page) || 1;
  const minFiltro = searchParams.min ? Number(searchParams.min) : undefined;
  const maxFiltro = searchParams.max ? Number(searchParams.max) : undefined;

  const [busca, setBusca] = useState(buscaFiltro);
  const [min, setMin] = useState(minFiltro ?? 0);
  const [max, setMax] = useState(maxFiltro ?? 10000);
  const { favorites } = useFavorites();

  // Atualiza a URL com os novos filtros
  const updateFilters = (newFilters: Partial<CatalogSearch>) => {
    navigate({
      to: ".", // Mantem na mesma página/rota atual
      search: (prev: CatalogSearch) => {
        const updated: CatalogSearch = { ...prev, ...newFilters }; // Monta a nova URL
        Object.keys(updated).forEach((key) => {
          // Verifica se o valor deve ser removido da URL
          if (
            updated[key as keyof CatalogSearch] === "" ||
            updated[key as keyof CatalogSearch] === undefined ||
            updated[key as keyof CatalogSearch] === false
          ) {
            delete updated[key as keyof CatalogSearch];
          }
        });
        return updated;
      },
    });
  };

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
          minPrice: minFiltro,
          maxPrice: maxFiltro,
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

  // Filtra a lista total para pegar apenas os produtos favoritados
  const produtosFavoritos = allProducts.filter((p) => favorites.includes(p.id));

  // Preço máximo e mínimo
  const prices = allProducts.map((p) => p.price);

  const minRange = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0;
  const maxRange = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 10000;

  useEffect(() => {
    if (allProducts.length > 0) {
      if (minFiltro === undefined) setMin(minRange);
      if (maxFiltro === undefined) setMax(maxRange);
    }
  }, [allProducts.length, minRange, maxRange, minFiltro, maxFiltro]);

  const isFirstRender = useRef(true);
  // Alteração da URL para o range e a busca
  useEffect(() => {
    // Primeira vez que a página carrega, a mudança de URL seria alterada à toa,
    // por isso o isFirstRender é alterado para false após o carregamento da página
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      updateFilters({
        busca: busca || undefined,
        min: min !== minRange ? min : undefined,
        max: max !== maxRange ? max : undefined,
        page: 1,
      });
    }, 500);

    return () => clearTimeout(timeout); // Cancela o useEffect se ocorrer alguma mudança no range ou busca antes dos 500ms
  }, [busca, min, max, minRange, maxRange]);

  // Lista de marcas e categorias
  const marcas = [...new Set(allProducts.map((produto) => produto.brand))];
  const categorias = [
    ...new Set(allProducts.map((produto) => produto.category)),
  ];

  const pages = Math.ceil(data ? data?.total / data?.pageSize : 0);

  // Página do catálogo
  return (
    <main className='flex min-h-screen flex-col gap-6 bg-gray-50 p-4 sm:p-6 lg:flex-row'>
      {/* Painel lateral de Filtros */}
      <aside className='w-full h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:max-w-xs'>
        <h2 className='mb-6 text-lg font-semibold text-gray-800'>Filtros</h2>

        <form className='flex flex-col gap-6'>
          {/* Categoria */}
          <div className='grid gap-2'>
            <Label htmlFor='selectCategory'>Categoria</Label>
            <Select
              value={categoria}
              onValueChange={(value) => {
                updateFilters({
                  categoria: value === "all" ? undefined : value,
                  page: 1,
                });
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
                updateFilters({
                  marca: value === "all" ? undefined : value,
                  page: 1,
                });
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
                updateFilters({ estoque: checked ? true : undefined, page: 1 });
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

          {/* Meus Favoritos (Drawer) */}
          <Sheet>
            <SheetTrigger asChild>
              {/*asChild = Botão é o próprio gatilho para disparar o drawer*/}
              <Button
                type='button'
                variant='outline'
                className='w-full justify-center gap-2 cursor-pointer border-gray-300'
              >
                <Heart className='w-4 h-4 text-red-500 fill-red-500' />
                Meus Favoritos ({produtosFavoritos.length})
              </Button>
            </SheetTrigger>

            <SheetContent className='overflow-y-auto'>
              <SheetHeader>
                <SheetTitle className='text-lg font-bold'>
                  Meus Favoritos
                </SheetTitle>
              </SheetHeader>
              <div className='mt-6 flex flex-col gap-4'>
                {produtosFavoritos.length === 0 ? (
                  <p className='text-sm text-gray-500 text-center'>
                    Nenhum favorito salvo.
                  </p>
                ) : (
                  produtosFavoritos.map((produto) => (
                    <div
                      key={produto.id}
                      className='flex gap-4 items-center border-b pb-4 pl-4'
                    >
                      <img
                        src={produto.thumbnail}
                        alt={produto.title}
                        className='w-16 h-16 object-cover rounded-md border'
                      />
                      <div className='flex flex-col'>
                        <span className='font-semibold text-sm line-clamp-2'>
                          {produto.title}
                        </span>
                        <span className='text-purple-700 font-bold text-sm'>
                          R${" "}
                          {produto.price.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <Link
                          to='/produtos/$id'
                          params={{ id: produto.id }}
                          className='text-xs text-blue-600 hover:underline mt-1'
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Limpar Filtros */}
          <Button
            type='button'
            variant='ghost'
            className='w-full justify-center text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer'
            onClick={() => {
              navigate({ to: ".", search: {} }); // Limpa a URL
              setMin(minRange);
              setMax(maxRange);
              setBusca("");
            }}
          >
            Limpar Filtros
          </Button>
        </form>
      </aside>

      {/* Lista de Produtos */}
      <section
        className={`grid w-full grid-cols-1 gap-6 content-start transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-4 ${
          isFetching && !isLoading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {isLoading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'
            >
              <div className='aspect-square w-full animate-pulse bg-gray-200' />
              <div className='space-y-3 p-4'>
                <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-gray-200' />
                <div className='h-3 w-2/3 animate-pulse rounded bg-gray-200' />
                <div className='h-5 w-1/3 animate-pulse rounded bg-gray-200' />
                <div className='h-8 w-full animate-pulse rounded bg-gray-200' />
              </div>
            </div>
          ))
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
                className='cursor-pointer'
                onClick={() => updateFilters({ page: Math.max(1, page - 1) })}
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
                className='cursor-pointer'
                onClick={() =>
                  updateFilters({ page: Math.min(pages, page + 1) })
                }
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
