import { Sistema } from "./sistema.model";

export interface Habilidade {
  id: number;
  nome: string;
  descricao: string;
  sistemas?: Sistema[];
}