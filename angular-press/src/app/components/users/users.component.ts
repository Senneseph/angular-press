import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, AdminLayoutComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent {
  constructor() { }
}