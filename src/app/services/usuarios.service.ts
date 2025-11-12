import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'usuario';
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  listarTodos(): Observable<UsuarioResumo[]> {
    return this.http.get<UsuarioResumo[]>(this.apiUrl);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
