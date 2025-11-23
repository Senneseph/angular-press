import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostsComponent } from './posts.component';

describe('PostsComponent', () => {
  let component: PostsComponent;
  let fixture: ComponentFixture<PostsComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockPosts = [
    {
      ID: 1,
      post_title: 'Test Post 1',
      post_name: 'test-post-1',
      post_status: 'published',
      post_date: '2025-01-01',
      post_author: 1,
      post_content: 'Content 1',
      post_excerpt: 'Excerpt 1',
      author: { display_name: 'Admin' }
    },
    {
      ID: 2,
      post_title: 'Draft Post',
      post_name: 'draft-post',
      post_status: 'draft',
      post_date: '2025-01-02',
      post_author: 1,
      post_content: 'Draft content',
      post_excerpt: 'Draft excerpt',
      author: { display_name: 'Admin' }
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PostsComponent, HttpClientTestingModule ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Don't call detectChanges here to prevent automatic ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load posts on init', () => {
    fixture.detectChanges(); // Triggers ngOnInit

    const req = httpMock.expectOne(request => request.url.includes('/posts'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockPosts });

    expect(component.posts).toEqual(mockPosts);
    expect(component.filteredPosts).toEqual(mockPosts);
    expect(component.loading).toBe(false);
  });

  it('should handle error when loading posts', () => {
    spyOn(console, 'error');
    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('/posts'));
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.loading).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('should filter posts by status', () => {
    component.posts = mockPosts;
    component.selectedFilter = 'published';
    component.applyFilters();

    expect(component.filteredPosts.length).toBe(1);
    expect(component.filteredPosts[0].post_status).toBe('published');
  });

  it('should filter posts by search query', () => {
    component.posts = mockPosts;
    component.searchQuery = 'Draft';
    component.applyFilters();

    expect(component.filteredPosts.length).toBe(1);
    expect(component.filteredPosts[0].post_title).toBe('Draft Post');
  });

  it('should filter posts by both status and search', () => {
    component.posts = mockPosts;
    component.selectedFilter = 'published';
    component.searchQuery = 'Test';
    component.applyFilters();

    expect(component.filteredPosts.length).toBe(1);
    expect(component.filteredPosts[0].ID).toBe(1);
  });

  it('should call applyFilters when filter changes', () => {
    spyOn(component, 'applyFilters');
    component.onFilterChange('draft');

    expect(component.selectedFilter).toBe('draft');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should call applyFilters when search is triggered', () => {
    spyOn(component, 'applyFilters');
    component.onSearch();

    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should get correct status count', () => {
    component.posts = mockPosts;

    expect(component.getStatusCount('all')).toBe(2);
    expect(component.getStatusCount('published')).toBe(1);
    expect(component.getStatusCount('draft')).toBe(1);
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2025-01-15');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2025');
  });

  it('should navigate to edit page', () => {
    spyOn(router, 'navigate');
    component.editPost(1);

    expect(router.navigate).toHaveBeenCalledWith(['/ap-admin/posts', 1, 'edit']);
  });

  it('should delete post when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(component, 'loadPosts');

    component.deletePost(mockPosts[0]);

    const req = httpMock.expectOne(request => request.url.includes('/posts/1') && request.method === 'DELETE');
    req.flush({});

    expect(component.loadPosts).toHaveBeenCalled();
  });

  it('should not delete post when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.deletePost(mockPosts[0]);

    httpMock.expectNone(request => request.url.includes('/posts/1'));
  });

  it('should handle delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    spyOn(console, 'error');

    component.deletePost(mockPosts[0]);

    const req = httpMock.expectOne(request => request.url.includes('/posts/1') && request.method === 'DELETE');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Failed to delete post');
  });

  it('should trash post', () => {
    spyOn(component, 'loadPosts');

    component.trashPost(mockPosts[0]);

    const req = httpMock.expectOne(request => request.url.includes('/posts/1') && request.method === 'PATCH');
    expect(req.request.body).toEqual({ status: 'trash' });
    req.flush({});

    expect(component.loadPosts).toHaveBeenCalled();
  });

  it('should handle trash error', () => {
    spyOn(console, 'error');

    component.trashPost(mockPosts[0]);

    const req = httpMock.expectOne(request => request.url.includes('/posts/1') && request.method === 'PATCH');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should open post in new window', () => {
    spyOn(window, 'open');

    component.viewPost(mockPosts[0]);

    expect(window.open).toHaveBeenCalledWith('/post/test-post-1', '_blank');
  });
});

