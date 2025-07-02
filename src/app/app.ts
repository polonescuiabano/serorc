import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Loginpage} from './components/pages/loginpage/loginpage';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loginpage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontserorc';
}
