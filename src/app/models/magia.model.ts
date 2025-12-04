import { Sistema } from "./sistema.model";

export interface Magia {
  id: number;
  nome: string;
  descricao: string;
  sistemas?: Sistema[];
}