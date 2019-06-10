import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';

import { TopbarRoutingModule } from './topbar-routing.module';
import { TopbarComponent } from './topbar.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  declarations: [
    TopbarComponent,
    MenuComponent
  ],
  imports: [
    CommonModule,
    TopbarRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatButtonModule,
    MatSliderModule
  ],
  exports: [
    TopbarComponent
  ]
})
export class TopbarModule { }
