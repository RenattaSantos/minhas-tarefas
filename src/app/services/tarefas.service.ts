import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tarefa {
  id?: number;
  titulo: string;
  descricao?: string;
  status: 'pendente' | 'concluida';
}

@Injectable({
  providedIn: 'root',
})
export class TarefasService {
  private apiUrl = 'http://localhost:3000/tarefas';

  constructor(private http: HttpClient) {}

  // Lista todas as tarefas (para admin, se quiser)
  listarTodas(): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(this.apiUrl);
  }

  // Lista tarefas de um usuário específico
  listarPorUsuario(usuarioId: number): Observable<Tarefa[]> {
    return this.http.get<Tarefa[]>(`${this.apiUrl}?usuarioId=${usuarioId}`);
  }

  // Cria tarefa para um usuário
  criar(tarefa: Tarefa, usuarioId: number): Observable<any> {
    return this.http.post(this.apiUrl, {
      ...tarefa,
      usuarioId,
    });
  }

  atualizar(id: number, tarefa: Tarefa): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, tarefa);
  }

  excluir(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
