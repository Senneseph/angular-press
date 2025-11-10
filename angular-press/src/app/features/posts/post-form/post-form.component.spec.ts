import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { PostFormComponent } from './post-form.component';
import { PostActions } from '../../../store/posts/posts.state';

describe('PostFormComponent', () => {
  let component: PostFormComponent;
  let fixture: ComponentFixture<PostFormComponent>;
  let storeSpy: jasmine.SpyObj<Store>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: any;

  beforeEach(async () => {
    const storeSpyObj = jasmine.createSpyObj('Store', ['dispatch']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteSpyObj = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [ PostFormComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: Store, useValue: storeSpyObj },
        { provide: Router, useValue: routerSpyObj },
        { provide: ActivatedRoute, useValue: activatedRouteSpyObj }
      ]
    })
    .compileComponents();

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute);
    
    fixture = TestBed.createComponent(PostFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize postForm with correct controls', () => {
      expect(component.postForm.contains('title')).toBe(true);
      expect(component.postForm.contains('content')).toBe(true);
      expect(component.postForm.contains('excerpt')).toBe(true);
      expect(component.postForm.contains('status')).toBe(true);
      expect(component.postForm.contains('tags')).toBe(true);
      expect(component.postForm.contains('categories')).toBe(true);
    });

    it('should set title as required', () => {
      const titleControl = component.postForm.get('title');
      titleControl?.setValue('');
      expect(titleControl?.valid).toBe(false);
      titleControl?.setValue('Test Title');
      expect(titleControl?.valid).toBe(true);
    });

    it('should set content as required', () => {
      const contentControl = component.postForm.get('content');
      contentControl?.setValue('');
      expect(contentControl?.valid).toBe(false);
      contentControl?.setValue('Test Content');
      expect(contentControl?.valid).toBe(true);
    });

    it('should set default status to draft', () => {
      expect(component.postForm.get('status')?.value).toBe('draft');
    });

    it('should have editor config defined', () => {
      expect(component.editorConfig).toBeDefined();
      expect(component.editorConfig.height).toBe('400px');
      expect(component.editorConfig.menubar).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should set isEditMode to false when no id in route', () => {
      component.ngOnInit();
      expect(component.isEditMode).toBe(false);
    });

    it('should set isEditMode to true when id exists in route', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue('123');
      component.ngOnInit();
      expect(component.isEditMode).toBe(true);
      expect(component.postId).toBe('123');
    });

    it('should get postId from route params', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue('456');
      component.ngOnInit();
      expect(component.postId).toBe('456');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.postForm.patchValue({
        title: 'Test Title',
        content: 'Test Content',
        excerpt: 'Test Excerpt',
        status: 'published',
        tags: 'tag1,tag2',
        categories: 'cat1'
      });
    });

    it('should not submit if form is invalid', () => {
      component.postForm.patchValue({ title: '' });
      component.onSubmit();
      expect(storeSpy.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch CreatePost action when not in edit mode', () => {
      component.isEditMode = false;
      component.onSubmit();
      
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(PostActions.CreatePost));
    });

    it('should dispatch UpdatePost action when in edit mode', () => {
      component.isEditMode = true;
      component.postId = '123';
      component.onSubmit();
      
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(PostActions.UpdatePost));
    });

    it('should navigate to /posts after successful submission', () => {
      component.onSubmit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/posts']);
    });

    it('should include form values in post data', () => {
      component.onSubmit();
      
      const dispatchCall = storeSpy.dispatch.calls.mostRecent();
      const action = dispatchCall.args[0] as any;
      
      expect(action.payload.title).toBe('Test Title');
      expect(action.payload.content).toBe('Test Content');
      expect(action.payload.excerpt).toBe('Test Excerpt');
      expect(action.payload.status).toBe('published');
    });

    it('should set publishDate when creating post', () => {
      component.onSubmit();
      
      const dispatchCall = storeSpy.dispatch.calls.mostRecent();
      const action = dispatchCall.args[0] as any;
      
      expect(action.payload.publishDate).toBeDefined();
      expect(action.payload.publishDate instanceof Date).toBe(true);
    });

    it('should set modified date when creating post', () => {
      component.onSubmit();
      
      const dispatchCall = storeSpy.dispatch.calls.mostRecent();
      const action = dispatchCall.args[0] as any;
      
      expect(action.payload.modified).toBeDefined();
      expect(action.payload.modified instanceof Date).toBe(true);
    });
  });

  it('should have correct selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-post-form')).toBeDefined();
  });
});

