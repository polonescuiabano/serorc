import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InsumosService } from '../../../services/insumos';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import {Sidebar} from '../../sidebar/sidebar';
import {TopbarListacomp} from '../../topbar-listacomp/topbar-listacomp';

@Component({
  selector: 'app-create-insumos',
  standalone: true,
  templateUrl: './create-insumos.html',
  imports: [CommonModule, ReactiveFormsModule, Sidebar, TopbarListacomp],
  styleUrls: ['./create-insumos.css']
})
export class CreateInsumos {
  insumoForm: FormGroup;
  mensagem: string | null = null;
  erro: string | null = null;

  constructor(
    private fb: FormBuilder,
    private insumosService: InsumosService,
    private authService: AuthService
  ) {
    this.insumoForm = this.fb.group({
      codigo: ['', Validators.required],
      nome: ['', Validators.required],
      // tipo fixo, não aparece no form
      unidadeMedida: [''],
      valorDesonerado: ['', Validators.required],
      valorOnerado: ['', Validators.required],
      data: ['', Validators.required]
    });
  }

  onSubmit() {
    this.mensagem = null;
    this.erro = null;

    if (this.insumoForm.invalid) {
      this.erro = 'Preencha todos os campos obrigatórios.';
      return;
    }

    const empresa = this.authService.getEmpresa();
    if (!empresa) {
      this.erro = 'Empresa do usuário não encontrada.';
      return;
    }

    const payload = {
      ...this.insumoForm.value,
      tipo: 'PROPRIO',          // tipo fixo
      empresa: empresa,
      valorDesonerado: parseFloat(this.insumoForm.value.valorDesonerado),
      valorNaoDesonerado: parseFloat(this.insumoForm.value.valorNaoDesonerado)
    };

    this.insumosService.salvarInsumo(payload).subscribe({
      next: () => {
        this.mensagem = 'Insumo salvo com sucesso!';
        this.insumoForm.reset();
      },
      error: (err) => {
        this.erro = err?.error || 'Erro ao salvar insumo';
      }
    });
  }
}
