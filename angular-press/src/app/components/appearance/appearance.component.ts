import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent],
  templateUrl: './appearance.component.html',
  styleUrls: ['./appearance.component.scss']
})
export class AppearanceComponent {
  constructor() { }
}

