import { Component } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  theme: number;

  constructor(private themeService: ThemeService) {
    this.themeService.darkTheme$.subscribe(theme => this.theme = theme);
  }

  get themeClass() {
    const className = `theme-${this.theme}`;
    const obj = {};
    obj[className] = true;

    return obj;
  }
}
