import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { THEME_CONFIG, ThemeConfig, DEFAULT_THEME_CONFIG } from './theme.config';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockConfig: ThemeConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'Test Theme',
      author: 'Test Author',
      version: '1.0.0',
      description: 'Test theme description',
      templates: {},
      styles: [],
      scripts: [],
      settings: {}
    };

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: THEME_CONFIG, useValue: mockConfig }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should use default config when no config is provided', () => {
    const defaultService = new ThemeService(DEFAULT_THEME_CONFIG);
    expect(defaultService).toBeTruthy();
  });

  describe('getActiveTheme', () => {
    it('should return an observable of theme config', (done) => {
      service.getActiveTheme().subscribe(theme => {
        expect(theme).toBeDefined();
        expect(theme.name).toBe('Test Theme');
        done();
      });
    });

    it('should return initial config', (done) => {
      service.getActiveTheme().subscribe(theme => {
        expect(theme).toEqual(mockConfig);
        done();
      });
    });
  });

  describe('activateTheme', () => {
    let newTheme: ThemeConfig;

    beforeEach(() => {
      newTheme = {
        name: 'New Theme',
        author: 'New Author',
        version: '2.0.0',
        description: 'New theme',
        templates: {},
        styles: ['style1.css', 'style2.css'],
        scripts: ['script1.js', 'script2.js'],
        settings: {}
      };
    });

    it('should update active theme', async () => {
      await service.activateTheme(newTheme);

      service.getActiveTheme().subscribe(theme => {
        expect(theme.name).toBe('New Theme');
        expect(theme.version).toBe('2.0.0');
      });
    });

    it('should emit new theme through observable', (done) => {
      let emissionCount = 0;
      
      service.getActiveTheme().subscribe(theme => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(theme.name).toBe('New Theme');
          done();
        }
      });

      service.activateTheme(newTheme);
    });

    it('should load theme styles', async () => {
      const appendChildSpy = spyOn(document.head, 'appendChild').and.callFake((element: any) => {
        // Simulate successful load
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
        return element;
      });

      await service.activateTheme(newTheme);

      expect(appendChildSpy).toHaveBeenCalled();
      const calls = appendChildSpy.calls.all();
      const linkElements = calls.filter(call => (call.args[0] as any).tagName === 'LINK');
      expect(linkElements.length).toBe(2);
    });

    it('should load theme scripts', async () => {
      const appendChildSpy = spyOn(document.body, 'appendChild').and.callFake((element: any) => {
        // Simulate successful load
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
        return element;
      });

      await service.activateTheme(newTheme);

      expect(appendChildSpy).toHaveBeenCalled();
      const calls = appendChildSpy.calls.all();
      const scriptElements = calls.filter(call => (call.args[0] as any).tagName === 'SCRIPT');
      expect(scriptElements.length).toBe(2);
    });

    it('should handle theme with no styles', async () => {
      const themeNoStyles: ThemeConfig = {
        ...newTheme,
        styles: []
      };

      await service.activateTheme(themeNoStyles);

      service.getActiveTheme().subscribe(theme => {
        expect(theme.styles.length).toBe(0);
      });
    });

    it('should handle theme with no scripts', async () => {
      const themeNoScripts: ThemeConfig = {
        ...newTheme,
        scripts: []
      };

      await service.activateTheme(themeNoScripts);

      service.getActiveTheme().subscribe(theme => {
        expect(theme.scripts.length).toBe(0);
      });
    });

    it('should remove previous theme resources before loading new theme', async () => {
      const removeChildSpy = spyOn(document.head, 'removeChild');
      const appendChildSpy = spyOn(document.head, 'appendChild').and.callFake((element: any) => {
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
        return element;
      });

      // First activation
      await service.activateTheme(newTheme);

      // Second activation
      const anotherTheme: ThemeConfig = {
        ...newTheme,
        name: 'Another Theme',
        styles: ['another-style.css']
      };

      await service.activateTheme(anotherTheme);

      // Should have removed previous styles
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('should handle style loading errors', async () => {
      spyOn(document.head, 'appendChild').and.callFake((element: any) => {
        setTimeout(() => {
          if (element.onerror) {
            element.onerror();
          }
        }, 0);
        return element;
      });

      try {
        await service.activateTheme(newTheme);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Failed to load style');
      }
    });

    it('should handle script loading errors', async () => {
      const themeWithScripts: ThemeConfig = {
        ...mockConfig,
        styles: [],
        scripts: ['failing-script.js']
      };

      spyOn(document.body, 'appendChild').and.callFake((element: any) => {
        setTimeout(() => {
          if (element.onerror) {
            element.onerror();
          }
        }, 0);
        return element;
      });

      try {
        await service.activateTheme(themeWithScripts);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Failed to load script');
      }
    });

    it('should set correct attributes on link elements', async () => {
      let linkElement: any = null;

      spyOn(document.head, 'appendChild').and.callFake((element: any) => {
        if (element.tagName === 'LINK') {
          linkElement = element;
        }
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
        return element;
      });

      const themeWithStyle: ThemeConfig = {
        ...mockConfig,
        styles: ['test-style.css']
      };

      await service.activateTheme(themeWithStyle);

      expect(linkElement).toBeTruthy();
      expect(linkElement?.rel).toBe('stylesheet');
      expect(linkElement?.href).toContain('test-style.css');
    });

    it('should set correct attributes on script elements', async () => {
      let scriptElement: any = null;

      spyOn(document.body, 'appendChild').and.callFake((element: any) => {
        if (element.tagName === 'SCRIPT') {
          scriptElement = element;
        }
        setTimeout(() => {
          if (element.onload) {
            element.onload();
          }
        }, 0);
        return element;
      });

      const themeWithScript: ThemeConfig = {
        ...mockConfig,
        scripts: ['test-script.js']
      };

      await service.activateTheme(themeWithScript);

      expect(scriptElement).toBeTruthy();
      expect(scriptElement?.src).toContain('test-script.js');
      expect(scriptElement?.async).toBe(true);
    });

    it('should handle theme with templates', async () => {
      const themeWithTemplates: ThemeConfig = {
        ...mockConfig,
        templates: {
          'home': {
            component: null,
            meta: {
              name: 'Home Template',
              description: 'Home page template'
            }
          }
        }
      };

      await service.activateTheme(themeWithTemplates);

      service.getActiveTheme().subscribe(theme => {
        expect(theme.templates['home']).toBeDefined();
        expect(theme.templates['home'].meta.name).toBe('Home Template');
      });
    });

    it('should handle theme with settings', async () => {
      const themeWithSettings: ThemeConfig = {
        ...mockConfig,
        settings: {
          primaryColor: '#007bff',
          fontSize: '16px'
        }
      };

      await service.activateTheme(themeWithSettings);

      service.getActiveTheme().subscribe(theme => {
        expect(theme.settings?.['primaryColor']).toBe('#007bff');
        expect(theme.settings?.['fontSize']).toBe('16px');
      });
    });
  });
});

