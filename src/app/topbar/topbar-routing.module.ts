import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopbarComponent } from './topbar.component';

const routes: Routes = [
  { path: '', component: TopbarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopbarRoutingModule { }
