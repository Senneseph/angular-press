import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminLayoutComponent } from '../admin-layout/admin-layout.component';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss']
})
export class MediaComponent {
  constructor() { }
}

