import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.resetTestingModule(); // Reset to ensure fresh service instance
    TestBed.configureTestingModule({
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should return an observable of users', (done) => {
      service.getUsers().subscribe(users => {
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should return users with correct structure', (done) => {
      service.getUsers().subscribe(users => {
        const user = users[0];
        expect(user.id).toBeDefined();
        expect(user.username).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        done();
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user when valid id is provided', () => {
      const user = service.getUserById(1);
      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.username).toBe('admin');
    });

    it('should return undefined when invalid id is provided', () => {
      const user = service.getUserById(999);
      expect(user).toBeUndefined();
    });

    it('should return the correct user for id 2', () => {
      const user = service.getUserById(2);
      expect(user).toBeDefined();
      expect(user?.id).toBe(2);
      expect(user?.username).toBe('editor');
    });
  });

  describe('getUserByUsername', () => {
    it('should return a user when valid username is provided', () => {
      const user = service.getUserByUsername('admin');
      expect(user).toBeDefined();
      expect(user?.username).toBe('admin');
      expect(user?.role).toBe('administrator');
    });

    it('should return undefined when invalid username is provided', () => {
      const user = service.getUserByUsername('nonexistent');
      expect(user).toBeUndefined();
    });

    it('should return the correct user for username "editor"', () => {
      const user = service.getUserByUsername('editor');
      expect(user).toBeDefined();
      expect(user?.username).toBe('editor');
      expect(user?.role).toBe('editor');
    });
  });

  describe('createUser', () => {
    it('should create a new user', (done) => {
      const newUser: User = {
        id: 0,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'subscriber',
        dateCreated: new Date(),
        isActive: true
      };

      service.createUser(newUser).subscribe(createdUser => {
        expect(createdUser).toBeDefined();
        expect(createdUser.id).toBeGreaterThan(0);
        expect(createdUser.username).toBe('testuser');
        done();
      });
    });

    it('should add the new user to the users list', (done) => {
      const newUser: User = {
        id: 0,
        username: 'anotheruser',
        email: 'another@example.com',
        firstName: 'Another',
        lastName: 'User',
        role: 'author',
        dateCreated: new Date(),
        isActive: true
      };

      let initialCount = 0;
      service.getUsers().subscribe(users => {
        initialCount = users.length;
      });

      service.createUser(newUser).subscribe(() => {
        service.getUsers().subscribe(users => {
          expect(users.length).toBe(initialCount + 1);
          done();
        });
      });
    });

    it('should generate unique ids for new users', (done) => {
      const user1: User = {
        id: 0,
        username: 'user1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        role: 'subscriber',
        dateCreated: new Date(),
        isActive: true
      };

      const user2: User = {
        id: 0,
        username: 'user2',
        email: 'user2@example.com',
        firstName: 'User',
        lastName: 'Two',
        role: 'subscriber',
        dateCreated: new Date(),
        isActive: true
      };

      service.createUser(user1).subscribe(created1 => {
        service.createUser(user2).subscribe(created2 => {
          expect(created1.id).not.toBe(created2.id);
          expect(Number(created2.id)).toBeGreaterThan(Number(created1.id));
          done();
        });
      });
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', (done) => {
      const existingUser = service.getUserById(1);
      expect(existingUser).toBeDefined();

      const updatedUser: User = {
        ...existingUser!,
        firstName: 'Updated',
        lastName: 'Name'
      };

      service.updateUser(updatedUser).subscribe(result => {
        expect(result.firstName).toBe('Updated');
        expect(result.lastName).toBe('Name');
        
        const retrievedUser = service.getUserById(1);
        expect(retrievedUser?.firstName).toBe('Updated');
        done();
      });
    });

    it('should emit updated users list', (done) => {
      const existingUser = service.getUserById(1);
      const updatedUser: User = {
        ...existingUser!,
        email: 'newemail@example.com'
      };

      service.updateUser(updatedUser).subscribe(() => {
        service.getUsers().subscribe(users => {
          const user = users.find(u => u.id === 1);
          expect(user?.email).toBe('newemail@example.com');
          done();
        });
      });
    });

    it('should handle updating non-existent user', (done) => {
      const nonExistentUser: User = {
        id: 999,
        username: 'nonexistent',
        email: 'nonexistent@example.com',
        firstName: 'Non',
        lastName: 'Existent',
        role: 'subscriber',
        dateCreated: new Date(),
        isActive: true
      };

      service.updateUser(nonExistentUser).subscribe(result => {
        expect(result).toBeDefined();
        expect(result.id).toBe(999);
        done();
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user by id', (done) => {
      let initialCount = 0;
      service.getUsers().subscribe(users => {
        initialCount = users.length;
      });

      service.deleteUser(1).subscribe(() => {
        service.getUsers().subscribe(users => {
          expect(users.length).toBe(initialCount - 1);
          const deletedUser = users.find(u => u.id === 1);
          expect(deletedUser).toBeUndefined();
          done();
        });
      });
    });

    it('should emit updated users list after deletion', (done) => {
      service.deleteUser(2).subscribe(() => {
        service.getUsers().subscribe(users => {
          const user = users.find(u => u.id === 2);
          expect(user).toBeUndefined();
          done();
        });
      });
    });

    it('should handle deleting non-existent user', (done) => {
      let initialCount = 0;
      service.getUsers().subscribe(users => {
        initialCount = users.length;
      });

      service.deleteUser(999).subscribe(() => {
        service.getUsers().subscribe(users => {
          expect(users.length).toBe(initialCount);
          done();
        });
      });
    });
  });

  describe('users$ observable', () => {
    it('should be defined', () => {
      expect(service.users$).toBeDefined();
    });

    it('should emit current users', (done) => {
      service.users$.subscribe(users => {
        expect(users).toBeDefined();
        expect(Array.isArray(users)).toBe(true);
        done();
      });
    });
  });
});

