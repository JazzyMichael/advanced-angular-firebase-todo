import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  date = Date.now();
  featureList = [
    'UI is 100% Material Design',
    'JS is 100% Angular 8',
    'Backend is 100% Firebase',
    'Theme Slider & Global CSS Variables',
    'Nested Todos with Single Schema & real-time changes',
    'Authentication, Database, Hosting'
  ];

  constructor() { }

  ngOnInit() {
  }

}
