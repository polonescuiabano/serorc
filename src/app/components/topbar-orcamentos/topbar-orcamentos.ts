import { Component } from '@angular/core';
import {Sidebar} from '../sidebar/sidebar';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-topbar-orcamentos',
  imports: [
    Sidebar,
    RouterLink
  ],
  templateUrl: './topbar-orcamentos.html',
  styleUrl: './topbar-orcamentos.css'
})
export class TopbarOrcamentos {

}
