import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-loginpage',
  imports: [CommonModule, FormsModule],
  templateUrl: './loginpage.html',
  styleUrl: './loginpage.css'
})
export class Loginpage {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.successMessage = 'Sucesso! Agora você está sendo redirecionado para o dashboard...';

        this.authService.setSession(res.token);

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erro ao fazer login';
      }
    });
  }
}
