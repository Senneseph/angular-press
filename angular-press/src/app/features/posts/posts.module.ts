import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { PostListComponent } from './post-list/post-list.component';
import { PostFormComponent } from './post-form/post-form.component';
import { PostDetailComponent } from './post-detail/post-detail.component';

const routes: Routes = [
  {
    path: '',
    component: PostListComponent
  },
  {
    path: 'new',
    component: PostFormComponent
  },
  {
    path: ':id',
    component: PostDetailComponent
  },
  {
    path: ':id/edit',
    component: PostFormComponent
  }
];

@NgModule({
  declarations: [
    PostListComponent,
    PostFormComponent,
    PostDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PostsModule { }