import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../../core/models/post.interface';
import { PostActions } from '../../../store/posts/posts.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  postId: string | null = null;
  editorConfig = {
    height: '400px',
    menubar: true,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar:
      'undo redo | formatselect | bold italic backcolor | \
      alignleft aligncenter alignright alignjustify | \
      bullist numlist outdent indent | removeformat | help'
  };

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      excerpt: [''],
      status: ['draft'],
      tags: [''],
      categories: ['']
    });
  }

  ngOnInit() {
    this.postId = this.route.snapshot.paramMap.get('id');
    if (this.postId) {
      this.isEditMode = true;
      // TODO: Load post data and populate form
    }
  }

  onSubmit() {
    if (this.postForm.valid) {
      const postData: Post = {
        ...this.postForm.value,
        id: this.postId || undefined,
        author: 'Current User', // TODO: Get from auth service
        publishDate: new Date(),
        featured_image: '',
        modified: new Date()
      };

      if (this.isEditMode) {
        this.store.dispatch(new PostActions.UpdatePost(postData));
      } else {
        this.store.dispatch(new PostActions.CreatePost(postData));
      }

      this.router.navigate(['/posts']);
    }
  }
}