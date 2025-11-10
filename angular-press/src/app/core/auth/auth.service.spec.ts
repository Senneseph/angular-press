import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { User } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('constructor', () => {
    it('should initialize with null user when localStorage is empty', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should initialize with user from localStorage if available', () => {
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
      
      // Create a new instance to test constructor
      const newService = new AuthService(routerSpy);
      expect(newService.currentUser).toBeTruthy();
      expect(newService.currentUser?.username).toBe('testuser');
    });
  });

  describe('currentUser getter', () => {
    it('should return null when no user is logged in', () => {
      expect(service.currentUser).toBeNull();
    });

    it('should return current user when logged in', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        expect(service.currentUser?.username).toBe('admin');
        done();
      });
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
      let emissionCount = 0;
      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(user).toBeTruthy();
          expect(user?.username).toBe('testuser');
          done();
        }
      });

      service.login('testuser', 'password').subscribe();
    });
  });

  describe('login', () => {
    it('should return an observable of user', (done) => {
      service.login('admin', 'password').subscribe(user => {
        expect(user).toBeDefined();
        expect(user.username).toBe('admin');
        done();
      });
    });

    it('should set currentUser', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.currentUser).toBeTruthy();
        expect(service.currentUser?.username).toBe('admin');
        done();
      });
    });

    it('should store user in localStorage', (done) => {
      service.login('admin', 'password').subscribe(() => {
        const storedUser = localStorage.getItem('currentUser');
        expect(storedUser).toBeTruthy();
        const user = JSON.parse(storedUser!);
        expect(user.username).toBe('admin');
        done();
      });
    });

    it('should create user with correct properties', (done) => {
      service.login('testuser', 'password').subscribe(user => {
        expect(user.id).toBeDefined();
        expect(user.username).toBe('testuser');
        expect(user.email).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.role).toBe('administrator');
        expect(user.capabilities).toBeDefined();
        expect(Array.isArray(user.capabilities)).toBe(true);
        done();
      });
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
    });
  });

  describe('logout', () => {
    beforeEach((done) => {
      service.login('admin', 'password').subscribe(() => {
        done();
      });
    });

    it('should clear currentUser', () => {
      service.logout();
      expect(service.currentUser).toBeNull();
    });

    it('should remove user from localStorage', () => {
      service.logout();
      const storedUser = localStorage.getItem('currentUser');
      expect(storedUser).toBeNull();
    });

    it('should navigate to login page', () => {
      service.logout();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should emit null through currentUser$ observable', (done) => {
      let emissionCount = 0;
      service.currentUser$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 3) {
          expect(user).toBeNull();
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
      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('manage_options')).toBe(true);
        done();
      });
    });

    it('should return false when user does not have the capability', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('nonexistent_capability')).toBe(false);
        done();
      });
    });

    it('should check for edit_posts capability', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('edit_posts')).toBe(true);
        done();
      });
    });

    it('should check for publish_posts capability', (done) => {
      service.login('admin', 'password').subscribe(() => {
        expect(service.hasCapability('publish_posts')).toBe(true);
        done();
      });
    });
  });
});

