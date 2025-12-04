import { Sistema } from "./sistema.model";

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  sistemas?: Sistema[];
}