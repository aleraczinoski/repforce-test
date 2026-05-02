import type { Product } from "@/types/product";
import { Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

interface ProductCardProps {
  produto: Product;
}

// Componente responsável por exibir um card de produto
// Recebe o produto via props (destructuring direto)
export default function ProductCard({ produto }: ProductCardProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorite = favorites.includes(produto.id);

  return (
    <div className='group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm '>
      {/* Imagem do Produto com Badge de Estoque e Favorito*/}
      <div className='relative flex aspect-square w-full items-center justify-center overflow-hidden bg-gray-50 p-6'>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(produto.id);
          }}
          className='absolute left-2 top-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>
        <span
          className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
            produto.stock === 0
              ? "bg-red-100 text-red-700"
              : produto.stock < 5
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {produto.stock === 0
            ? "Sem estoque"
            : produto.stock < 5
              ? "Pouco estoque"
              : "Em estoque"}
        </span>
        <img
          src={produto.thumbnail}
          alt={produto.title}
          className='h-full w-full absolute'
        />
      </div>

      {/* Informações do Produto */}
      <div className='flex flex-1 flex-col p-5'>
        <div className='mb-2 flex items-center justify-between text-xs font-medium text-gray-500'>
          <span className='uppercase tracking-wider'>{produto.category}</span>
          <span className='text-gray-400'>{produto.brand}</span>
        </div>

        <h3
          className='mb-4 text-base font-bold leading-snug text-gray-900 line-clamp-2'
          title={produto.title}
        >
          {produto.title}
        </h3>

        <div className='mt-auto flex flex-col gap-4'>
          <div>
            <span className='block text-xs font-medium text-gray-500'>
              Preço
            </span>
            <p className='text-2xl font-extrabold text-purple-700'>
              R${" "}
              {produto.price.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <Link to='/produtos/$id' params={{ id: produto.id }}>
            <Button className='w-full cursor-pointer hover:-translate-y-0.5 hover:shadow-md'>
              Ver detalhes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
