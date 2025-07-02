import { Component } from '@angular/core';
import {NavigationEnd, Router, RouterLink} from '@angular/router';
import {filter} from 'rxjs';

@Component({
  selector: 'app-topbar-listacomp',
  imports: [

  ],
  templateUrl: './topbar-listacomp.html',
  styleUrl: './topbar-listacomp.css'
})
export class TopbarListacomp {
  currentPath='';
  constructor(private router:Router) {
    this.currentPath=this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPath = event.urlAfterRedirects;
      });
  }

  create(){
    if (this.currentPath.includes('insumos')){
      this.router.navigate(['/create-insumos'])
    }

    if (this.currentPath.includes('composicoes')){
      this.router.navigate(['/create-comp'])
    }
  }
  search() {
      if (this.currentPath.includes('composicoes')) {
        this.router.navigate(['/composicoes']);
      }

    if (this.currentPath.includes('insumos')){
      this.router.navigate(['/insumos'])
    }
  }
}
