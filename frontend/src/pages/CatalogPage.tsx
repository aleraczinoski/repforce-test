import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import ProductCard from "../components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export default function CatalogPage() {
  const [categoria, setCategoria] = useState("");
  const [marca, setMarca] = useState("");
  const [estoque, setEstoque] = useState(false);
  const [busca, setBusca] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10000);

  /*
   * Busca a lista de produtos da API usando React Query.
   *
   * @returns
   * - produtos: array de produtos (ou [] enquanto carrega)
   * - isLoading: indica se a requisição está em andamento
   */
  const { data: produtos = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get<Product[]>("/products");
      return response.data;
    },
  });

  const maxPrice = Math.max(...produtos.map((p) => p.price));
  const minPrice = Math.min(...produtos.map((p) => p.price));
  const maxRange = Math.ceil(maxPrice);
  const minRange = Math.floor(minPrice);

  // Range duplo alterado
  useEffect(() => {
    setMin(minRange);
    setMax(maxRange);
  }, [minRange, maxRange]); //Array de dependências -> Usa o useEffect quando o minRange ou maxRange mudar

  if (isLoading) {
    return <p className='p-6'>Carregando produtos...</p>;
  }

  const marcas = [...new Set(produtos.map((produto) => produto.brand))];
  const categorias = [...new Set(produtos.map((produto) => produto.category))];

  // Filtrar
  const produtosFiltrados = produtos.filter((produto) => {
    const passaCategoria = categoria ? produto.category === categoria : true;
    const passaMarca = marca ? produto.brand === marca : true;
    const passaPreço = produto.price >= min && produto.price <= max;
    const passaEstoque = estoque ? produto.stock > 0 : true;
    const passaBusca = busca
      ? produto.title.toLowerCase().includes(busca.toLowerCase())
      : true;

    return (
      passaCategoria && passaMarca && passaPreço && passaEstoque && passaBusca
    );
  });

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
              onChange={(e) => setCategoria(e.target.value)}
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
              onChange={(e) => setMarca(e.target.value)}
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
              onChange={(e) => setEstoque(e.target.checked)}
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
            }}
          >
            Limpar Filtros
          </button>
        </form>
      </aside>

      {/* Lista de Produtos */}
      <section className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 content-start'>
        {produtosFiltrados.length > 0 ? (
          produtosFiltrados.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))
        ) : (
          <p className='text-center col-span-full mt-4'>
            Nenhum produto encontrado
          </p>
        )}
      </section>
    </main>
  );
}
