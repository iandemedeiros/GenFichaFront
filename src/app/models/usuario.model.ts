export interface Usuario {
  id: number;
  nome: string;
  email: string;
}


// Interface para a resposta do login da sua API
export interface LoginResponse {
  token: string;
  isAdmin: boolean;
  user: {
    id: number;
    nome: string;
    email: string;
  };
}

// Interface para os dados do usuário que salvaremos
export interface UserData {
  id: number;
  nome: string;
  email: string;
  isAdmin: boolean;
}