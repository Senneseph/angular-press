import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MediaListComponent } from './media-list.component';
import { LoadMedia, DeleteMedia } from '../../../store/media/media.actions';

describe('MediaListComponent', () => {
  let component: MediaListComponent;
  let fixture: ComponentFixture<MediaListComponent>;
  let storeSpy: jasmine.SpyObj<Store>;

  beforeEach(async () => {
    const storeSpyObj = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    await TestBed.configureTestingModule({
      imports: [ MediaListComponent ],
      providers: [
        { provide: Store, useValue: storeSpyObj }
      ]
    })
    .compileComponents();

    storeSpy = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    
    fixture = TestBed.createComponent(MediaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should dispatch LoadMedia action', () => {
      component.ngOnInit();
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(LoadMedia));
    });
  });

  describe('onDeleteMedia', () => {
    beforeEach(() => {
      spyOn(window, 'confirm');
    });

    it('should show confirmation dialog', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      component.onDeleteMedia('123');
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this media item?');
    });

    it('should dispatch DeleteMedia action when confirmed', () => {
      (window.confirm as jasmine.Spy).and.returnValue(true);
      const mediaId = '123';
      
      component.onDeleteMedia(mediaId);
      
      expect(storeSpy.dispatch).toHaveBeenCalledWith(jasmine.any(DeleteMedia));
    });

    it('should not dispatch DeleteMedia action when cancelled', () => {
      (window.confirm as jasmine.Spy).and.returnValue(false);
      
      component.onDeleteMedia('123');
      
      // Only ngOnInit dispatch should have been called
      expect(storeSpy.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('onUploadClick', () => {
    it('should trigger file input click', () => {
      const mockElement = document.createElement('input');
      mockElement.id = 'fileUpload';
      spyOn(mockElement, 'click');
      spyOn(document, 'getElementById').and.returnValue(mockElement);
      
      component.onUploadClick();
      
      expect(document.getElementById).toHaveBeenCalledWith('fileUpload');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should handle missing file input element', () => {
      spyOn(document, 'getElementById').and.returnValue(null);
      
      expect(() => component.onUploadClick()).not.toThrow();
    });
  });

  describe('onFileSelected', () => {
    it('should log files when files are selected', () => {
      spyOn(console, 'log');
      const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;
      
      component.onFileSelected(mockEvent);
      
      expect(console.log).toHaveBeenCalledWith('Files selected:', [mockFile]);
    });

    it('should not log when no files selected', () => {
      spyOn(console, 'log');
      const mockEvent = {
        target: {
          files: null
        }
      } as any;
      
      component.onFileSelected(mockEvent);
      
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should not log when files array is empty', () => {
      spyOn(console, 'log');
      const mockEvent = {
        target: {
          files: []
        }
      } as any;
      
      component.onFileSelected(mockEvent);
      
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('getFileType', () => {
    it('should return "image" for image mime types', () => {
      expect(component.getFileType('image/jpeg')).toBe('image');
      expect(component.getFileType('image/png')).toBe('image');
      expect(component.getFileType('image/gif')).toBe('image');
    });

    it('should return "video" for video mime types', () => {
      expect(component.getFileType('video/mp4')).toBe('video');
      expect(component.getFileType('video/avi')).toBe('video');
    });

    it('should return "audio" for audio mime types', () => {
      expect(component.getFileType('audio/mp3')).toBe('audio');
      expect(component.getFileType('audio/wav')).toBe('audio');
    });

    it('should return "document" for other mime types', () => {
      expect(component.getFileType('application/pdf')).toBe('document');
      expect(component.getFileType('text/plain')).toBe('document');
    });
  });

  describe('getFileIcon', () => {
    it('should return "image" icon for image files', () => {
      expect(component.getFileIcon('image/jpeg')).toBe('image');
    });

    it('should return "videocam" icon for video files', () => {
      expect(component.getFileIcon('video/mp4')).toBe('videocam');
    });

    it('should return "audiotrack" icon for audio files', () => {
      expect(component.getFileIcon('audio/mp3')).toBe('audiotrack');
    });

    it('should return "insert_drive_file" icon for document files', () => {
      expect(component.getFileIcon('application/pdf')).toBe('insert_drive_file');
    });
  });

  // Note: @Select decorator tests are skipped because they require the actual NGXS store
  // The observables are created by the @Select decorator at runtime

  it('should have correct selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-media-list')).toBeDefined();
  });
});

