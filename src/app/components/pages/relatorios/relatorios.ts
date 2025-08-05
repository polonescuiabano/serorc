import { Component } from '@angular/core';
import { Sidebar } from '../../sidebar/sidebar';
import { FormsModule } from '@angular/forms';
import { InsumosService, Insumo } from '../../../services/insumos';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import autoTable from 'jspdf-autotable';


declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js';


@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [ Sidebar, FormsModule, CommonModule ],
  templateUrl: './relatorios.html',
  styleUrls: ['./relatorios.css']
})
export class Relatorios {
  searchBy = 'codigo';
  tipo = 'PROPRIO';
  query = '';
  periodo = '';
  resultados: Insumo[] = [];
  insumosSelecionados: Insumo[] = [];
  metodoCalculo = '';

  constructor(private insumosService: InsumosService) {}

  buscar(): void {
    if (!this.query.trim()) {
      alert('Por favor, insira um termo para busca.');
      return;
    }
    const obs = (this.searchBy === 'codigo')
      ? this.insumosService.buscarPorCodigo(this.query, this.tipo, this.periodo)
      : this.insumosService.buscarPorNome(this.query, this.tipo, this.periodo);

    obs.subscribe({
      next: res => this.resultados = res,
      error: err => { console.error(err); alert('Erro ao buscar.'); }
    });
  }

  limpar(): void {
    this.query = '';
    this.resultados = [];
    this.insumosSelecionados = [];
  }

  selecionar(insumo: Insumo): void {
    if (!this.isSelecionado(insumo)) {
      this.insumosSelecionados.push(insumo);
    }
  }

  removerSelecionado(insumo: Insumo): void {
    this.insumosSelecionados = this.insumosSelecionados.filter(i => i.codigo !== insumo.codigo);
  }

  isSelecionado(insumo: Insumo): boolean {
    return this.insumosSelecionados.some(i => i.codigo === insumo.codigo);
  }

  async gerarRelatorio(): Promise<void> {
    if (this.insumosSelecionados.length === 0 || !this.metodoCalculo) {
      alert('Selecione insumos e método de cálculo.');
      return;
    }

    const doc = new jsPDF();
    let posY = 20;

    // Gera as tabelas com os insumos (igual seu código anterior)
    this.insumosSelecionados.forEach((insumo, idx) => {
      if (idx !== 0) posY = (doc as any).lastAutoTable?.finalY + 15 || 20;

      doc.setFontSize(14);
      doc.text(`${insumo.codigo} - ${insumo.nome}`, 10, posY);

      const precos = (insumo.precosCotacao || [])
        .sort((a, b) => new Date(b.dataCotacao).getTime() - new Date(a.dataCotacao).getTime())
        .slice(0, 3);

      const rows = precos.map(p => [
        this.formatarData(p.dataCotacao),
        p.empresa || '',
        p.telefone || '',
        p.cnpj || '',
        p.vendedor || '',
        `R$ ${(p.precoDesonerado || 0).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: posY + 5,
        head: [['Data', 'Empresa', 'Telefone', 'CNPJ', 'Vendedor', 'V.Total (R$)']],
        body: rows,
        theme: 'grid',
        styles: { fontSize: 10 }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || (posY + 5);

      const valores = precos.map(p => p.precoDesonerado || 0);
      const valorFinal = this.metodoCalculo === 'media'
        ? this.calcularMedia(valores)
        : this.calcularMediana(valores);

      doc.setFontSize(12);
      doc.text(`Valor Adotado: R$ ${valorFinal.toFixed(2)}`, 10, finalY + 5);

      posY = finalY + 20;
    });

    // Depois das tabelas, adiciona página nova e lista os arquivos
    doc.addPage();
    doc.setFontSize(14);
    doc.text('Arquivos relacionados:', 10, 20);
    posY = 30;

    for (const insumo of this.insumosSelecionados) {
      for (const p of insumo.precosCotacao || []) {
        if (!p.arquivoNome || !p.arquivoCaminho) continue;

        const ext = p.arquivoNome.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
          // Insere imagem no PDF
          try {
            const img = await this.loadImageAsDataURL(p.arquivoCaminho);
            const imgProps = doc.getImageProperties(img);
            const pdfWidth = doc.internal.pageSize.getWidth() - 20;
            const ratio = imgProps.width / imgProps.height;
            const imgHeight = pdfWidth / ratio;

            if (posY + imgHeight > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              posY = 20;
            }

            doc.text(p.arquivoNome, 10, posY);
            posY += 6;

            doc.addImage(img, 'JPEG', 10, posY, pdfWidth, imgHeight);
            posY += imgHeight + 10;

          } catch {
            doc.text(`Erro ao carregar imagem: ${p.arquivoNome}`, 10, posY);
            posY += 10;
          }

        } else {
          // Para PDF, Excel, Word e outros, apenas lista para baixar (não é link clicável)
          if (posY + 10 > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            posY = 20;
          }
          doc.setTextColor(0, 0, 255);
          doc.textWithLink(p.arquivoNome, 10, posY, { url: p.arquivoCaminho });
          doc.setTextColor(0, 0, 0);
          posY += 10;
        }
      }
    }

    doc.save('relatorio-insumos.pdf');
  }


  loadImageAsDataURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = (e) => {
        console.error('Erro carregando imagem:', url, e);
        reject(e);
      };
      img.src = url;
    });
  }


  formatarData(d: string | Date): string {
    if (typeof d === 'string') {
      const datePart = d.split('T')[0]; // pega só a data 'yyyy-mm-dd'
      const [ano, mes, dia] = datePart.split('-');
      return `${dia}/${mes}/${ano}`;
    } else {
      const ano = d.getFullYear();
      const mes = d.getMonth() + 1;
      const dia = d.getDate();
      return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${ano}`;
    }
  }


  calcularMedia(vals: number[]): number {
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  calcularMediana(vals: number[]): number {
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }
}
