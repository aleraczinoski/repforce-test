<h1 align="center">Teste Técnico Repforce </h1>

<p align="center">
  Aplicação fullstack de um <strong>Catálogo de Produtos</strong> desenvolvido para o desafio técnico da Repforce.
</p>

---

## 🌐 Acesso Online

Você pode testar a aplicação completa em tempo real acessando o link abaixo:

🔗 **[Acessar o Catálogo de Produtos](https://repforce-test.netlify.app/)**

---

## 📌 Sobre o Projeto

O projeto consiste em uma plataforma onde o usuário pode visualizar uma lista de produtos, aplicar diversos filtros de busca (preço, categoria, marca, estoque), favoritar itens e visualizar os detalhes de um produto específico para solicitar uma cotação informando a quantidade desejada.

## ✨ Funcionalidades

### 🖥️ Frontend

- **Catálogo de Produtos:** Exibição em grid com paginação e responsividade 
- **Filtros Avançados:** Filtros reativos sincronizados com a URL (Categoria, Marca, Faixa de Preço, Disponibilidade e Busca em texto)
- **Detalhes do Produto:** Galeria de imagens interativa (thumbnails clicáveis)
- **Cotação:** Formulário de cotação com validações robustas
- **Favoritos (Bônus):** Sistema de favoritos persistido localmente, visualizado em um _Drawer_ lateral
- **UX/UI:** Estado de carregamento com _Skeleton Loaders_, feedbacks de sucesso/erro e componentes acessíveis

### ⚙️ Backend

- **Listagem e Busca:** Retorno paginado dos produtos emulados em memória
- **Validação Estrita:** Tratamento de erros e validação de _Query Params_ e _Body_ usando **Zod**
- **Regras de Negócio:** Bloqueio de cotações com quantidades inválidas ou IDs inexistentes
- **Respostas Padronizadas:** Uso correto dos Status Codes HTTP (200, 201, 400, 404)

---

## 🛠️ Tecnologias Utilizadas

### Frontend

- **React(Vite)** 
- **TypeScript** 
- **Tailwind CSS** (Estilização e Responsividade)
- **TanStack Router** (Gerenciamento das rotas e URLs)
- **TanStack Query** (Comunicação com o backend)
- **React Hook Form + Zod** (Construção e validação do formulário de cotação)
- **Lucide React** (Ícones)
- **shadcn/ui** (Componentes visuais base)

### Backend

- **NestJS**
- **TypeScript**
- **Zod** (Validação de schemas e dados de entrada)

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter as seguintes ferramentas no seu ambiente:

- **[Node.js](https://nodejs.org/)** (versão 18 ou superior)
- Um gerenciador de pacotes da sua preferência (**npm**, **yarn** ou **pnpm**)

### 1. Clonando o Repositório

```bash
git clone https://github.com/aleraczinoski/repforce-test.git
cd repforce-test
```

### 2. Rodando o Backend

Abra um terminal e navegue até a pasta do backend:

```bash
cd backend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run start:dev
```

> A API estará rodando em: `http://localhost:3000`

### 3. Rodando o Frontend

Abra um **novo terminal** e navegue até a pasta do frontend:

```bash
cd frontend

# Instale as dependências
npm install

# Inicie a aplicação web
npm run dev
```

> O Frontend estará rodando em: `http://localhost:5173` 

---

## 📡 Endpoints da API

| Método | Rota            | Descrição                                                   |
| ------ | --------------- | ----------------------------------------------------------- |
| `GET`  | `/products`     | Retorna a lista paginada e filtrada de produtos.            |
| `GET`  | `/products/:id` | Retorna os detalhes de um produto específico.               |
| `POST` | `/quotes`       | Cria uma nova solicitação de cotação.                       |
| `GET`  | `/quotes`       | Lista todas as cotações criadas (Apenas para visualização). |

**Parâmetros suportados no `GET /products`:**
`category`, `brand`, `minPrice`, `maxPrice`, `inStock` (boolean), `search`, `page`, `pageSize`.

---

## 🤖 Uso de IA

Durante o desenvolvimento do projeto, eu utilizei duas ferramentas de IA (Gemini Code Assist e ChatGPT) com o objetivo de agilizar o trabalho e acelerar meu aprendizado com novas tecnologias
Gemini Code Assist (Apoio no desenvolvimento)
- Geração de base: Auxílio na criação de blocos de código iniciais para ferramentas cuja sintaxe eu ainda não tinha conhecimento.
- Arquitetura: Suporte na compreensão e estruturação da base do projeto (organização de pastas e arquivos).
- Estilização UI: Agilização na estilização da interface gráfica, permitindo focar no aprendizado e no desenvolvimento das tecnologias que eram novidade para mim.

ChatGPT (Suporte ao Aprendizado):
- Aprofundamento técnico: Todo trecho de código gerado em que eu não dominava completamente a ferramenta ou a sintaxe era analisado com o ChatGPT. Utilizei a ferramenta para dissecar os códigos, criar comentários explicativos e garantir que eu estava de fato aprendendo os conceitos implementados, e não apenas copiando e colando.

Em resumo, todo o uso de IA durante o projeto visou garantir agilidade no desenvolvimento e trazer mais facilidade para o meu processo de aprendizado.
