import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {
  // login
  email = '';
  senha = '';

  // cadastro
  nomeCompleto = '';
  emailCadastro = '';
  senhaCadastro = '';

  carregando = false;
  modoCadastro = false; // false = login, true = cadastro

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async mostrarToast(mensagem: string) {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  alternarModo() {
    this.modoCadastro = !this.modoCadastro;
    // limpa campos ao trocar
    this.email = '';
    this.senha = '';
    this.nomeCompleto = '';
    this.emailCadastro = '';
    this.senhaCadastro = '';
  }

  login() {
    if (!this.email || !this.senha) {
      this.mostrarToast('Informe e-mail e senha.');
      return;
    }

    this.carregando = true;

    this.authService.login(this.email, this.senha).subscribe({
      next: async (res) => {
        this.carregando = false;
        this.authService.salvarUsuario(res.usuario);
        await this.mostrarToast('Login realizado com sucesso!');
        this.router.navigateByUrl('/home', { replaceUrl: true });
      },
      error: async (err) => {
        this.carregando = false;
        if (err.status === 401) {
          await this.mostrarToast('E-mail ou senha inválidos.');
        } else {
          await this.mostrarToast('Erro ao fazer login.');
        }
      },
    });
  }

  cadastrar() {
    if (!this.nomeCompleto || !this.emailCadastro || !this.senhaCadastro) {
      this.mostrarToast('Preencha nome, e-mail e senha.');
      return;
    }

    this.carregando = true;

    this.authService
      .registrar(this.nomeCompleto, this.emailCadastro, this.senhaCadastro)
      .subscribe({
        next: async (res) => {
          this.carregando = false;
          await this.mostrarToast('Cadastro realizado! Faça login.');
          // volta para o modo login já com o e-mail preenchido
          this.modoCadastro = false;
          this.email = this.emailCadastro;
          this.senha = '';
          this.nomeCompleto = '';
          this.emailCadastro = '';
          this.senhaCadastro = '';
        },
        error: async (err) => {
          this.carregando = false;
          if (err.status === 409) {
            await this.mostrarToast('E-mail já cadastrado.');
          } else {
            await this.mostrarToast('Erro ao cadastrar usuário.');
          }
        },
      });
  }
}
