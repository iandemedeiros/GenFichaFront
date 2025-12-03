export interface Ficha {
  id: number;
  nome: string;
  idUsuario: number;
  idSistema: number;
  dataCriacao: string; // Usar string para datas da API é mais simples
}