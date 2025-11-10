import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '../../shared/shared.module';
import { MediaState } from '../../store/media/media.state';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./media-list/media-list.component').then(m => m.MediaListComponent)
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxsModule.forFeature([MediaState]),
    SharedModule
  ]
})
export class MediaModule { }