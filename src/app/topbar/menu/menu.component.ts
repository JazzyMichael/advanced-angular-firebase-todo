import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @ViewChild(MatMenuTrigger, { static: false }) menu: MatMenuTrigger;
  user: any;

  constructor(public auth: AuthService) {
    this.auth.user$.subscribe(user => this.user = user);
  }

  ngOnInit() { }

  get menuIsOpen() {
    return this.menu ? this.menu.menuOpen : false;
  }

  async login() {
    await this.auth.googleSignIn();
    this.menu.closeMenu();
  }

  async logout() {
    await this.auth.signOut();
    this.menu.closeMenu();
  }

}
