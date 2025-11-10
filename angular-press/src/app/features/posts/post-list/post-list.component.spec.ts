import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { PostListComponent } from './post-list.component';
import { PostActions } from '../../../store/posts/posts.state';
import { Post } from '../../../core/models/post.interface';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let storeSpy: jasmine.SpyObj<Store>;

  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'Test Post 1',
      content: 'Content 1',
      excerpt: 'Excerpt 1',
      status: 'published',
      author: 'Author 1',
      publishDate: new Date(),
      tags: [],
      categories: [],
      featured_image: '',
      modified: new Date(),
      meta: {},
      slug: 'test-post-1',
      type: 'post'
    },
    {
      id: '2',
      title: 'Test Post 2',
      content: 'Content 2',
      excerpt: 'Excerpt 2',
      status: 'draft',
      author: 'Author 2',
      publishDate: new Date(),
      tags: [],
      categories: [],
      featured_image: '',
      modified: new Date(),
      meta: {},
      slug: 'test-post-2',
      type: 'post'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    await TestBed.configureTestingModule({
      declarations: [ PostListComponent ],
      providers: [
        { provide: Store, useValue: spy }
      ]
    })
    .compileComponents();

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch LoadPosts action', () => {
      component.ngOnInit();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(PostActions.LoadPosts));
    });

    it('should dispatch LoadPosts action only once', () => {
      component.ngOnInit();
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('onDeletePost', () => {
    it('should dispatch DeletePost action with correct id', () => {
      const postId = '123';
      component.onDeletePost(postId);
      
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(PostActions.DeletePost));
    });

    it('should dispatch DeletePost action for different ids', () => {
      component.onDeletePost('1');
      component.onDeletePost('2');
      
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('posts$ observable', () => {
    it('should be defined', () => {
      expect(component.posts$).toBeDefined();
    });
  });

  describe('loading$ observable', () => {
    it('should be defined', () => {
      expect(component.loading$).toBeDefined();
    });
  });

  it('should have correct selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-post-list')).toBeDefined();
  });
});

