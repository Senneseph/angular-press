import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { PostService } from '../../services/post.service';
import * as PostActions from './post.actions';

@Injectable()
export class PostEffects {
  loadPosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostActions.loadPosts),
      mergeMap(() =>
        this.postService.getPosts().pipe(
          map(posts => PostActions.loadPostsSuccess({ posts })),
          catchError(error => of(PostActions.loadPostsFailure({ error: error.message })))
        )
      )
    )
  );

  createPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostActions.createPost),
      mergeMap(({ post }) =>
        this.postService.createPost(post).pipe(
          map(createdPost => PostActions.createPostSuccess({ post: createdPost })),
          catchError(error => of(PostActions.createPostFailure({ error: error.message })))
        )
      )
    )
  );

  updatePost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostActions.updatePost),
      mergeMap(({ post }) =>
        this.postService.updatePost(post).pipe(
          map(updatedPost => PostActions.updatePostSuccess({ post: updatedPost })),
          catchError(error => of(PostActions.updatePostFailure({ error: error.message })))
        )
      )
    )
  );

  deletePost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostActions.deletePost),
      mergeMap(({ id }) =>
        this.postService.deletePost(id).pipe(
          map(() => PostActions.deletePostSuccess({ id })),
          catchError(error => of(PostActions.deletePostFailure({ error: error.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private postService: PostService
  ) {}