import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/auth/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;
  let currentUserSubject: BehaviorSubject<any>;

  const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'administrator'
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject(mockUser);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ DashboardComponent, HttpClientTestingModule ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
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

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load current user on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('/posts'));
    req.flush({ data: [] });

    expect(component.currentUser).toEqual(mockUser);
  });

  it('should load stats on init', () => {
    const mockPosts = [
      { status: 'publish' },
      { status: 'publish' },
      { status: 'draft' }
    ];

    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('/posts'));
    req.flush({ data: mockPosts });

    expect(component.stats.posts.total).toBe(3);
    expect(component.stats.posts.published).toBe(2);
    expect(component.stats.posts.draft).toBe(1);
  });

  it('should handle error when loading stats', () => {
    spyOn(console, 'error');
    fixture.detectChanges();

    const req = httpMock.expectOne(request => request.url.includes('/posts'));
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(console.error).toHaveBeenCalled();
  });

  it('should toggle sidebar', () => {
    expect(component.sidebarCollapsed).toBe(false);

    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBe(true);

    component.toggleSidebar();
    expect(component.sidebarCollapsed).toBe(false);
  });

  it('should call authService.logout when logout is called', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });
});

