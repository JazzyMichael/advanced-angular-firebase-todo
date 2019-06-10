import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent implements OnInit {
  theme: Observable<number>;

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.theme = this.themeService.darkTheme$;
  }

  themeChange(event: any) {
    if (!event) return;

    this.themeService.setTheme(event.value);
  }

}
