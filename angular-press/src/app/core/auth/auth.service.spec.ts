import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.interface';

// Helper function to create a valid JWT token for testing
function createMockJWT(payload: any = {}): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({
    sub: 1,
    username: 'testuser',
    requirePasswordChange: false,
    ...payload
  }));
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    httpMock.verify();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should initialize with user from localStorage if available', () => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      const mockUser: User = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'administrator',
        capabilities: ['manage_options'],
        meta: {},
        registeredDate: new Date(),
        status: 'active'
      };

      localStorage.setItem('currentUser', JSON.stringify(mockUser));

      // Create a new TestBed instance to test constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: Router, useValue: routerSpy }
        ]
      });
      const newService = TestBed.inject(AuthService);
      expect(newService.currentUser).toBeTruthy();
      expect(newService.currentUser?.username).toBe('testuser');
    });
  });

  describe('currentUser getter', () => {
    it('should return null when no user is logged in', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should return current user when logged in', (done) => {
      const mockResponse = { access_token: createMockJWT() };

      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('currentUser$ observable', () => {
    it('should be defined', () => {
      expect(service.currentUser$).toBeDefined();
    });

    it('should emit null initially', (done) => {
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should emit user after login', (done) => {
      const mockToken = createMockJWT();
      const mockResponse = { access_token: mockToken };
      let emissionCount = 0;

      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          done();
        }
      });

      service.login('testuser', 'password').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    const mockToken = createMockJWT();
    const mockResponse = { access_token: mockToken };

    it('should make POST request to login endpoint', (done) => {
      service.login('admin', 'password').subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'admin', password: 'password' });
      req.flush(mockResponse);
    });

    it('should store token in localStorage', (done) => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      const mockToken = createMockJWT();
      const mockResponse = { access_token: mockToken };

      service.login('admin', 'password').subscribe(() => {
        const storedToken = localStorage.getItem('access_token');
        expect(storedToken).toBe(mockToken);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should set currentUser after successful login', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should emit user through currentUser$ observable', (done) => {
      let emissionCount = 0;
      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          done();
        }
      });

      service.login('admin', 'password').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    beforeEach((done) => {
      const mockResponse = { access_token: createMockJWT() };
      service.login('admin', 'password').subscribe(() => {
        done();
      });
      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should clear currentUser', () => {
      service.logout();
      expect(service.currentUser).toBeNull();
    });

    it('should remove token from localStorage', () => {
      if (typeof localStorage === 'undefined') {
        pending('localStorage not available in this environment');
        return;
      }

      service.logout();
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('currentUser');
      expect(storedToken).toBeNull();
      expect(storedUser).toBeNull();
    });

    it('should navigate to login page', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/ap-admin/login']);
    });

    it('should emit null through currentUser$ observable', (done) => {
      let emissionCount = 0;
      const subscription = service.currentUser$.subscribe(user => {
        emissionCount++;
        // First emission is the logged-in user from beforeEach
        // Second emission is null from logout
        if (emissionCount === 2) {
          expect(user).toBeNull();
          subscription.unsubscribe();
          done();
        }
      });

      service.logout();
    });
  });

  describe('hasCapability', () => {
    it('should return false when no user is logged in', () => {
      expect(service.hasCapability('manage_options')).toBe(false);
    });

    it('should return true when user has the capability', (done) => {
      const mockToken = createMockJWT({ capabilities: ['manage_options', 'edit_posts'] });
      const mockResponse = { access_token: mockToken };

      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('manage_options')).toBe(true);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });

    it('should return false when user does not have the capability', (done) => {
      const mockToken = createMockJWT({ capabilities: ['edit_posts'] });
      const mockResponse = { access_token: mockToken };

      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('nonexistent_capability')).toBe(false);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register a new user and store token', (done) => {
      const mockToken = createMockJWT();
      const mockResponse = { access_token: mockToken };

      service.register('newuser', 'newuser@example.com', 'password', 'New User').subscribe(user => {
        expect(user).toBeTruthy();
        expect(user.username).toBe('testuser');
        expect(localStorage.getItem('access_token')).toBe(mockToken);
        done();
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/register'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password',
        displayName: 'New User'
      });
      req.flush(mockResponse);
    });

    it('should update currentUser$ after registration', (done) => {
      const mockToken = createMockJWT();
      const mockResponse = { access_token: mockToken };
      let emissionCount = 0;

      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          done();
        }
      });

      service.register('newuser', 'newuser@example.com', 'password', 'New User').subscribe();

      const req = httpMock.expectOne(request => request.url.includes('/auth/register'));
      req.flush(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should throw error when no token is found', () => {
      localStorage.removeItem('access_token');
      expect(() => service.getCurrentUser()).toThrowError('No token found');
    });

    it('should decode token and return user', () => {
      const mockToken = createMockJWT({ sub: '123', username: 'testuser', email: 'test@example.com' });
      localStorage.setItem('access_token', mockToken);

      const user = service.getCurrentUser();
      expect(user.id).toBe('123');
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('administrator');
    });
  });

  describe('Error Handling', () => {
    it('should handle login error with invalid credentials', (done) => {
      service.login('admin', 'wrongpassword').subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle login error with server error', (done) => {
      service.login('admin', 'password').subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/login'));
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle register error', (done) => {
      service.register('newuser', 'newuser@example.com', 'password', 'New User').subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
          done();
        }
      });

      const req = httpMock.expectOne(request => request.url.includes('/auth/register'));
      req.flush('Username already exists', { status: 400, statusText: 'Bad Request' });
    });
  });
});

