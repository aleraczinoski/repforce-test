import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import type { Product } from "@/types/product";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";

// Validação com zod
const getQuoteSchema = (maxStock: number) =>
  z.object({
    name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório")
      .email("E-mail com formato inválido"),
    phone: z
      .string()
      .min(10, "Mínimo de 10 dígitos")
      .regex(/^\d+$/, "Apenas números"),
    company: z.string().min(1, "O nome da empresa é obrigatório"),
    quantity: z
      .any()
      .refine(
        (val) => val !== "" && val !== undefined && val !== null,
        "A quantidade é obrigatória",
      )
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), "Digite um número válido")
      .refine(
        (val) => Number.isInteger(val),
        "A quantidade deve ser um número inteiro",
      )
      .refine((val) => val >= 1, "A quantidade mínima é 1")
      .refine(
        (val) => val <= maxStock,
        `Máximo disponível no estoque: ${maxStock}`,
      ),
    observations: z.string().max(500, "Máximo de 500 caracteres").optional(),
  });

type QuoteFormData = z.infer<ReturnType<typeof getQuoteSchema>>; // Cria o tipo dos dados do formulário com base no schema

export default function ProductDetailsPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mainImage, setMainImage] = useState<string | null>(null); // Estado com tipo string ou null iniciado como null

  // Busca o produto pelo ID na API
  const {
    data: produto,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    },
    enabled: !!id, // Só faz a busca se o ID existir na URL
  });

  // Inicializa o react-hook-form conectando com a validação do Zod
  const {
    register, // Conecta inputs ao formulário
    handleSubmit, // Controla o envio
    reset, // Limpa os campos do formulário
    formState: { errors, isSubmitting }, // Erros de validação e se está enviando
  } = useForm<QuoteFormData>({
    resolver: produto ? zodResolver(getQuoteSchema(produto.stock)) : undefined, // Se o produto carregou, usa o schema do Zod com o estoque dele
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      quantity: "" as unknown as number,
      observations: "",
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await api.post("/quotes", {
        productId: id,
        ...data,
      });
      setSuccessMsg("Cotação solicitada com sucesso!");
      reset();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setErrorMsg("Erro ao solicitar cotação. Tente novamente.");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  // Tratamentos de interface (Loading e Erro)
  if (isLoading) {
    return (
      <div className='p-8 text-center text-lg text-gray-600'>
        Carregando detalhes do produto...
      </div>
    );
  }

  if (isError || !produto) {
    return (
      <div className='p-8 flex flex-col items-center gap-4'>
        <h2 className='text-2xl font-bold text-red-600'>
          Produto não encontrado
        </h2>
        <Button
          className='cursor-pointer'
          onClick={() => navigate({ to: "/" })}
        >
          Voltar ao catálogo
        </Button>
      </div>
    );
  }

  // Formatação da Data de Cadastro
  const dataCadastro = new Date(produto.createdAt);
  const dia = dataCadastro.getDate();
  const mes = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(
    dataCadastro,
  );
  const ano = dataCadastro.getFullYear();
  const dataFormatada = `${dia} de ${mes}. de ${ano}`;

  // Formatação do Preço
  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(produto.price);

  return (
    <main className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Botão de Voltar */}
        <Button
          variant='ghost'
          className='mb-4 text-gray-600 cursor-pointer'
          onClick={() => navigate({ to: "/" })}
        >
          <ChevronLeft className='w-4 h-4 mr-2' />
          Voltar ao catálogo
        </Button>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Coluna Esquerda: Informações do Produto */}
          <div className='lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Galeria de Imagens */}
              <div className='w-full md:w-1/2 flex flex-col gap-4'>
                <img
                  src={mainImage || produto.thumbnail}
                  alt={`Capa do ${produto.title}`}
                  className='w-full h-auto rounded-lg object-cover border'
                />
                <div className='grid grid-cols-4 gap-2'>
                  {[produto.thumbnail, ...produto.images].map(
                    (image: string, idx: number) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Galeria ${idx + 1}`}
                        onClick={() => setMainImage(image)}
                        className={`w-full h-24 object-cover rounded-md cursor-pointer transition-all hover:opacity-80 ${
                          (mainImage || produto.thumbnail) === image
                            ? "ring-2 ring-purple-600 border-transparent shadow-sm"
                            : "border border-gray-200"
                        }`}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Textos e Specs */}
              <div className='w-full md:w-1/2 space-y-4'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>
                    {produto.title}
                  </h1>
                  <div className='flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500'>
                    <span className='bg-gray-100 px-2 py-1 rounded-md'>
                      {produto.brand}
                    </span>
                    <span className='bg-gray-100 px-2 py-1 rounded-md'>
                      {produto.category}
                    </span>
                    <span>SKU: {produto.sku}</span>
                  </div>
                </div>

                <p className='text-4xl font-extrabold text-gray-900'>
                  {precoFormatado}
                </p>

                <div className='bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm text-gray-700'>
                  <p>
                    <span className='font-semibold block'>Estoque:</span>{" "}
                    {produto.stock} unid.
                  </p>
                  <p>
                    <span className='font-semibold block'>Peso:</span>{" "}
                    {produto.weightKg} kg
                  </p>
                  <p>
                    <span className='font-semibold block'>Garantia:</span>{" "}
                    {produto.warrantyMonths} meses
                  </p>
                  <p>
                    <span className='font-semibold block'>Cadastro:</span>{" "}
                    {dataFormatada}
                  </p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className='pt-4 border-t'>
              <h3 className='text-lg font-semibold mb-2'>
                Descrição do Produto
              </h3>
              <p className='text-gray-600 leading-relaxed whitespace-pre-wrap'>
                {produto.description}
              </p>
            </div>
          </div>

          {/* Coluna Direita: Formulário de Cotação */}
          <aside className='bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit'>
            <h2 className='text-xl font-bold text-gray-800 mb-6'>
              Solicitar Cotação
            </h2>

            {/* Resposta ao usuário da situação do envio do formulário */}
            {successMsg ? (
              <div className='mb-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg font-medium text-sm text-center'>
                {successMsg}
              </div>
            ) : errorMsg ? (
              <div className='mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg font-medium text-sm text-center'>
                {errorMsg}
              </div>
            ) : null}

            <form
              className='flex flex-col gap-0'
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className='space-y-1'>
                <Label htmlFor='name'>
                  Nome Completo <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='name'
                  placeholder='Ex: Maria Souza'
                  {...register("name")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.name?.message as string}
                </p>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='email'>
                  E-mail <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='seu@email.com'
                  {...register("email")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.email?.message as string}
                </p>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='phone'>
                  Telefone <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='phone'
                  placeholder='Apenas números. Ex: 11999999999'
                  {...register("phone")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.phone?.message as string}
                </p>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='company'>
                  Empresa <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='company'
                  placeholder='Sua Empresa LTDA'
                  {...register("company")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.company?.message as string}
                </p>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='quantity'>
                  Quantidade desejada <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='quantity'
                  type='number'
                  placeholder={`Máx. ${produto.stock}`}
                  {...register("quantity")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.quantity?.message as string}
                </p>
              </div>

              <div className='space-y-1'>
                <Label htmlFor='observations'>Observações (Opcional)</Label>
                <textarea
                  id='observations'
                  className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  placeholder='Detalhes da entrega, condições, etc...'
                  {...register("observations")}
                />
                <p className='text-red-500 text-xs font-medium min-h-[20px]'>
                  {errors.observations?.message as string}
                </p>
              </div>

              <Button
                type='submit'
                className='w-full mt-2 cursor-pointer'
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando solicitação..." : "Solicitar Cotação"}
              </Button>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
