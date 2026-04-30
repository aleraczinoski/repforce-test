import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "../components/ProductCard";
import type { ProductResponse } from "@/types/productResponse";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../services/api";
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
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='selectCategory'
              className='text-sm font-medium text-gray-700'
            >
              Categoria
            </label>
            <select
              id='selectCategory'
              className='w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setPage(1);
              }}
            >
              <option value=''>Selecione a categoria</option>
              {categorias.map((categoria) => {
                return (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Marca */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='selectBrand'
              className='text-sm font-medium text-gray-700'
            >
              Marca
            </label>
            <select
              id='selectBrand'
              className='w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              value={marca}
              onChange={(e) => {
                setMarca(e.target.value);
                setPage(1);
              }}
            >
              <option value=''>Selecione a marca</option>
              {marcas.map((marca) => {
                return (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Faixa de preço */}
          <fieldset className='flex flex-col gap-2'>
            <legend className='text-sm font-medium text-gray-700 mb-2'>
              Faixa de preço
            </legend>

            <div className='relative h-8'>
              <div className='absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-gray-200' />

              <div
                className='absolute top-1/2 h-1 -translate-y-1/2 rounded bg-purple-600'
                style={{
                  left: `${((min - minRange) / (maxRange - minRange)) * 100}%`,
                  width: `${((max - min) / (maxRange - minRange)) * 100}%`,
                }}
              />

              <input
                type='range'
                min={minRange}
                max={maxRange}
                value={min}
                onChange={(e) =>
                  setMin(Math.min(Number(e.target.value), max - 1))
                }
                className='pointer-events-none absolute top-1/2 z-20 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600'
              />

              <input
                type='range'
                min={minRange}
                max={maxRange}
                value={max}
                onChange={(e) =>
                  setMax(Math.max(Number(e.target.value), min + 1))
                }
                className='pointer-events-none absolute top-1/2 z-30 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600'
              />
            </div>

            <div className='mt-1 flex justify-between text-xs font-medium text-gray-500'>
              <span>R$ {min}</span>
              <span>R$ {max}</span>
            </div>
          </fieldset>

          {/* Disponível em estoque */}
          <div className='flex items-center gap-3'>
            <input
              type='checkbox'
              id='stock'
              className='h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500'
              checked={estoque}
              onChange={(e) => {
                setEstoque(e.target.checked);
                setPage(1);
              }}
            />
            <label
              htmlFor='stock'
              className='text-sm font-medium text-gray-700 cursor-pointer'
            >
              Disponível em estoque
            </label>
          </div>

          {/* Buscar */}
          <div className='flex flex-col gap-2'>
            <label
              htmlFor='busca'
              className='text-sm font-medium text-gray-700'
            >
              Buscar
            </label>
            <input
              type='text'
              id='busca'
              placeholder='Busque um produto'
              className='w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          {/* Limpar Filtros */}
          <button
            type='button'
            className='mt-2 w-full rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 active:bg-red-200'
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
          </button>
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
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className='p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
              >
                <ChevronLeft className='w-5 h-5' />
              </button>
              <span className='text-sm font-medium text-gray-700'>
                Página {page} de {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className='p-2 rounded-md border border-gray-300 bg-white text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
              >
                <ChevronRight className='w-5 h-5' />
              </button>
            </div>
          )
        }
      </section>
    </main>
  );
}
