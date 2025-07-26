import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {Sidebar} from '../../sidebar/sidebar';
import {Orcamentos} from '../orcamentos/orcamentos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, RouterOutlet, RouterLink, Sidebar, Orcamentos],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  isDarkMode = false;
  isSidebarClosed = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
  }
}
