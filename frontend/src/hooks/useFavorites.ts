import { useState, useEffect } from "react";

export function useFavorites() {
  // Inicializa o estado com os favoritos salvos no localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : []; //String JSON -> Array
  });

  // Escuta o evento customizado e o evento de storage para manter todos os componentes sincronizados
  useEffect(() => {
    const syncFavorites = () => {
      const saved = localStorage.getItem("favorites");
      setFavorites(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener("favoritesUpdated", syncFavorites);
    window.addEventListener("storage", syncFavorites); // storage é disparado quando o localStorage muda em outra aba -> Sincroniza as mudanças em outra aba também

    return () => {
      window.removeEventListener("favoritesUpdated", syncFavorites); // Evita acumular listeners ao desmontar o componente
      window.removeEventListener("storage", syncFavorites);
    };
  }, []); // Roda apenas uma vez, quando o componente monta

  // Função para adicionar ou remover um favorito
  const toggleFavorite = (productId: string) => {
    const saved = localStorage.getItem("favorites");
    const currentFavorites: string[] = saved ? JSON.parse(saved) : [];

    const newFavorites = currentFavorites.includes(productId)
      ? currentFavorites.filter((id) => id !== productId) // Se já tem, remove
      : [...currentFavorites, productId]; // Se não tem, adiciona

    // Salva a nova lista de favoritos no localStorage
    localStorage.setItem("favorites", JSON.stringify(newFavorites)); // Array -> String JSON
    setFavorites(newFavorites);

    // Dispara um evento para outros componentes atualizarem os favoritos
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  return { favorites, toggleFavorite }; //Lista de favoritos e Função para favoritar/desfavoritar
}
