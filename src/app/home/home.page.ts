import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TarefasService, Tarefa } from '../services/tarefas.service';
import { AuthService, Usuario } from '../services/auth.service';
import { UsuariosService, UsuarioResumo } from '../services/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class HomePage implements OnInit {
  tarefas: Tarefa[] = [];

  titulo: string = '';
  descricao: string = '';

  editando = false;
  idEditando: number | null = null;

  carregando = false;
  mostrarToast = false;
  mensagemToast = '';

  usuarioLogado: Usuario | null = null;

  // Admin: lista de usuários e usuário selecionado
  usuarios: UsuarioResumo[] = [];
  usuarioSelecionado: UsuarioResumo | null = null;

  constructor(
    private tarefasService: TarefasService,
    private authService: AuthService,
    private usuariosService: UsuariosService,
    private router: Router
  ) {}

  ngOnInit() {
    const usuario = this.authService.obterUsuarioLogado();
    if (!usuario) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    this.usuarioLogado = usuario;

    if (this.usuarioLogado.tipo === 'admin') {
      this.carregarUsuarios();
      this.tarefas = [];
    } else {
      this.carregarTarefas();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  private exibirToast(mensagem: string) {
    this.mensagemToast = mensagem;
    this.mostrarToast = true;
  }

  // Carrega lista de usuários (apenas admin)
  private carregarUsuarios() {
    this.usuariosService.listarTodos().subscribe({
      next: (dados) => {
        this.usuarios = dados;
      },
      error: (err) => {
        console.error('Erro ao listar usuários:', err);
        this.exibirToast('Erro ao carregar usuários.');
      },
    });
  }

  // Admin escolhe um usuário para ver tarefas
  selecionarUsuario(usuario: UsuarioResumo) {
    this.usuarioSelecionado = usuario;
    this.carregarTarefas();
  }

  // Admin exclui um usuário (e suas tarefas)
  excluirUsuario(usuario: UsuarioResumo) {
    if (!confirm(`Deseja realmente excluir o usuário "${usuario.nome}" e todas as suas tarefas?`)) {
      return;
    }

    this.carregando = true;
    this.usuariosService.excluir(usuario.id).subscribe({
      next: () => {
        this.carregando = false;
        this.exibirToast('Usuário excluído com sucesso.');

        // Se o usuário selecionado foi excluído, limpa seleção e lista
        if (this.usuarioSelecionado?.id === usuario.id) {
          this.usuarioSelecionado = null;
          this.tarefas = [];
        }

        this.carregarUsuarios();
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.carregando = false;
        this.exibirToast('Erro ao excluir usuário.');
      },
    });
  }

  private carregarTarefas() {
    if (!this.usuarioLogado) return;

    this.carregando = true;

    if (this.usuarioLogado.tipo === 'admin') {
      if (!this.usuarioSelecionado) {
        this.tarefas = [];
        this.carregando = false;
        return;
      }

      this.tarefasService.listarPorUsuario(this.usuarioSelecionado.id).subscribe({
        next: (dados) => {
          this.tarefas = dados;
          this.carregando = false;
        },
        error: (err) => {
          console.error('Erro ao listar tarefas:', err);
          this.carregando = false;
          this.exibirToast('Erro ao carregar tarefas.');
        },
      });
    } else {
      this.tarefasService.listarPorUsuario(this.usuarioLogado.id).subscribe({
        next: (dados) => {
          this.tarefas = dados;
          this.carregando = false;
        },
        error: (err) => {
          console.error('Erro ao listar tarefas:', err);
          this.carregando = false;
          this.exibirToast('Erro ao carregar tarefas.');
        },
      });
    }
  }

  novaTarefa() {
    this.cancelarEdicao();
  }

  adicionarOuAtualizarTarefa() {
    const tituloLimpo = this.titulo.trim();
    if (!tituloLimpo || !this.usuarioLogado) return;

    const usuarioIdParaTarefa =
      this.usuarioLogado.tipo === 'admin'
        ? (this.usuarioSelecionado?.id ?? this.usuarioLogado.id)
        : this.usuarioLogado.id;

    const tarefa: Tarefa = {
      titulo: tituloLimpo,
      descricao: this.descricao.trim(),
      status: 'pendente',
    };

    this.carregando = true;

    if (this.editando && this.idEditando !== null) {
      this.tarefasService.atualizar(this.idEditando, tarefa).subscribe({
        next: () => {
          this.carregarTarefas();
          this.cancelarEdicao();
          this.carregando = false;
          this.exibirToast('Tarefa atualizada com sucesso!');
        },
        error: (err: any) => {
          console.error('Erro ao atualizar tarefa:', err);
          this.carregando = false;
          this.exibirToast('Erro ao atualizar tarefa');
        },
      });
    } else {
      this.tarefasService.criar(tarefa, usuarioIdParaTarefa).subscribe({
        next: () => {
          this.carregarTarefas();
          this.cancelarEdicao();
          this.carregando = false;
          this.exibirToast('Tarefa criada com sucesso!');
        },
        error: (err: any) => {
          console.error('Erro ao criar tarefa:', err);
          this.carregando = false;
          this.exibirToast('Erro ao criar tarefa');
        },
      });
    }
  }

  editarTarefa(tarefa: Tarefa) {
    this.editando = true;
    this.idEditando = tarefa.id!;
    this.titulo = tarefa.titulo;
    this.descricao = tarefa.descricao ?? '';
  }

  cancelarEdicao() {
    this.editando = false;
    this.idEditando = null;
    this.titulo = '';
    this.descricao = '';
  }

  excluirTarefa(tarefa: Tarefa) {
    if (!tarefa.id) return;

    this.carregando = true;
    this.tarefasService.excluir(tarefa.id).subscribe({
      next: () => {
        this.carregarTarefas();
        this.carregando = false;
        this.exibirToast('Tarefa excluída');
      },
      error: (err: any) => {
        console.error('Erro ao excluir tarefa:', err);
        this.carregando = false;
        this.exibirToast('Erro ao excluir tarefa');
      },
    });
  }

  alternarStatus(tarefa: Tarefa) {
    if (!tarefa.id) return;

    const novoStatus = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
    const tarefaAtualizada: Tarefa = { ...tarefa, status: novoStatus };

    this.carregando = true;
    this.tarefasService.atualizar(tarefa.id, tarefaAtualizada).subscribe({
      next: () => {
        this.carregarTarefas();
        this.carregando = false;
        this.exibirToast(
          novoStatus === 'concluida'
            ? 'Tarefa marcada como concluída'
            : 'Tarefa marcada como pendente'
        );
      },
      error: (err: any) => {
        console.error('Erro ao alterar status:', err);
        this.carregando = false;
        this.exibirToast('Erro ao alterar status');
      },
    });
  }
}
