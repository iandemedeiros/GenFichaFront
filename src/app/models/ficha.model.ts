import { Sistema } from "./sistema.model";

export interface Ficha {
  id: number;
  nome: string;
  idUsuario: number;
  idSistema: number;
  dataCriacao: string; // Usar string para datas da API é mais simples
}


// Interface para representar a ficha com os dados do sistema aninhados
export interface FichaComSistema extends Ficha {
  sistema?: Sistema;
}

// Definindo um tipo para o payload de criação para maior clareza
export interface UpdateFichaPayload {
  nome?: string;
  // Adicione outros campos que podem ser atualizados aqui
}

export interface CreateFichaPayload {
  idSistema: number;
  nome: string;
}

