import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ComposicoesService } from '../../../services/composicoes';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import {Router} from '@angular/router';
import { Sidebar } from '../../sidebar/sidebar';
import { TopbarListacomp } from '../../topbar-listacomp/topbar-listacomp';

@Component({
  selector: 'app-create-comp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Sidebar, TopbarListacomp],
  templateUrl: './create-comp.html',
  styleUrls: ['./create-comp.css']
})
export class CreateComp {
  composicaoForm: FormGroup;
  sucesso = false;
  erro: string | null = null;

  constructor(
    private fb: FormBuilder,
    private composicaoService: ComposicoesService,
    private authService: AuthService,
    private router: Router
  ) {
    this.composicaoForm = this.fb.group({
      codigo: ['', Validators.required],
      descricao: ['', Validators.required],
      unidadeMedida: ['', Validators.required],
      precoDesonerado: [0],
      precoNaoDesonerado: [0],
      dataCotacao: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.composicaoForm.invalid) return;

    const empresa = this.authService.getEmpresa();
    if (!empresa) {
      this.erro = 'Empresa do usuário não encontrada.';
      this.sucesso = false;
      return;
    }

    const dto = {
      ...this.composicaoForm.value,
      tipo: 'PROPRIO',
      empresa: empresa,
      precoDesonerado: parseFloat(this.composicaoForm.value.precoDesonerado),
      precoNaoDesonerado: parseFloat(this.composicaoForm.value.precoNaoDesonerado)
    };

    this.composicaoService.salvarComposicao(dto).subscribe({
      next: (response) => {
        this.sucesso = true;
        this.erro = null;
        this.composicaoForm.reset();

        const newId = response.id;

        if (newId) {
          this.router.navigate(['/detalhes-composicao', newId], {
            queryParams: { dataCotacao: dto.dataCotacao }
          });
        } else {
          this.erro = 'ID da composição não retornado pelo servidor.';
        }
      },
      error: err => {
        this.erro = err.error || 'Erro ao salvar composição';
        this.sucesso = false;
      }
    });

  }
}
