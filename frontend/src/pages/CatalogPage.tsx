import { useState } from "react";

export type Product = {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  images: string[];
  price: number;
  stock: number;
  sku: string;
  brand: string;
  weightKg: number;
  warrantyMonths: number;
  createdAt: string;
  description: string;
};

export default function CatalogPage() {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);

  const produtos: Product[] = [];

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
            >
              <option value=''>Selecione...</option>
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
            >
              <option value=''>Selecione...</option>
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
                  left: `${min}%`,
                  width: `${max - min}%`,
                }}
              />

              <input
                type='range'
                min='0'
                max='100'
                value={min}
                onChange={(e) =>
                  setMin(Math.min(Number(e.target.value), max - 1))
                }
                className='pointer-events-none absolute top-1/2 z-20 w-full -translate-y-1/2 appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600'
              />

              <input
                type='range'
                min='0'
                max='100'
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
              placeholder='Busque um produto...'
              className='w-full rounded-md border border-gray-300 p-2.5 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
            />
          </div>

          {/* Limpar Filtros */}
          <button
            type='button'
            className='mt-2 w-full rounded-md bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 active:bg-red-200'
          >
            Limpar Filtros
          </button>
        </form>
      </aside>

      {/* Lista de Produtos */}
      <section className='grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 content-start'>
        {produtos.map((produto) => (
          <div
            key={produto.id}
            className='group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
          >
            <div className='relative flex aspect-square w-full items-center justify-center bg-gray-100'>
              <img
                src={produto.thumbnail}
                alt={produto.title}
                className='absolute inset-0 h-full w-full object-cover'
              />
            </div>

            <div className='flex flex-1 flex-col p-4'>
              <div className='mb-1 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                <span>{produto.category}</span>
                <span>{produto.brand}</span>
              </div>

              <h3 className='mb-2 text-base font-semibold leading-tight text-gray-800 line-clamp-2'>
                {produto.title}
              </h3>

              <div className='mt-auto flex items-end justify-between pt-4'>
                <div className='flex flex-col'>
                  <span className='text-xs text-gray-500'>Preço</span>
                  <p className='text-lg font-bold text-purple-600'>
                    R$ {produto.price}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    produto.stock === 0
                      ? "border-red-200 bg-red-50 text-red-700"
                      : produto.stock < 5
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                        : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {produto.stock === 0
                    ? "Sem estoque"
                    : produto.stock < 5
                      ? "Pouco estoque"
                      : "Em estoque"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
