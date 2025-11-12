import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<{ usuario: Usuario }> {
    return this.http.post<{ usuario: Usuario }>(`${this.apiUrl}/login`, {
      email,
      senha,
    });
  }

  registrar(
    nome: string,
    email: string,
    senha: string
  ): Observable<{ mensagem: string; usuario?: Usuario }> {
    return this.http.post<{ mensagem: string; usuario?: Usuario }>(
      `${this.apiUrl}/register`,
      { nome, email, senha }
    );
  }

  salvarUsuario(usuario: Usuario) {
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
  }

  obterUsuarioLogado(): Usuario | null {
    const dados = localStorage.getItem('usuarioLogado');
    if (!dados) return null;
    try {
      return JSON.parse(dados) as Usuario;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.removeItem('usuarioLogado');
  }
}
