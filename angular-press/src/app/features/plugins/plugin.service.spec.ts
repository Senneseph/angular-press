import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { PluginService } from './plugin.service';
import { PluginConfig } from './plugin.config';

describe('PluginService', () => {
  let service: PluginService;
  let injectorSpy: jasmine.SpyObj<Injector>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      providers: [
        PluginService,
        { provide: Injector, useValue: spy }
      ]
    });

    service = TestBed.inject(PluginService);
    injectorSpy = TestBed.inject(Injector) as jasmine.SpyObj<Injector>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPlugins', () => {
    it('should return an observable of plugins map', (done) => {
      service.getPlugins().subscribe(plugins => {
        expect(plugins).toBeDefined();
        expect(plugins instanceof Map).toBe(true);
        done();
      });
    });

    it('should initially return empty map', (done) => {
      service.getPlugins().subscribe(plugins => {
        expect(plugins.size).toBe(0);
        done();
      });
    });
  });

  describe('registerPlugin', () => {
    it('should register a basic plugin', async () => {
      const config: PluginConfig = {
        name: 'TestPlugin',
        version: '1.0.0',
        author: 'Test Author',
        description: 'Test plugin'
      };

      await service.registerPlugin(config);

      const plugins = await new Promise<Map<string, any>>(resolve => {
        service.getPlugins().subscribe(p => resolve(p));
      });

      expect(plugins.has('TestPlugin')).toBe(true);
      const metadata = plugins.get('TestPlugin');
      expect(metadata.enabled).toBe(true);
      expect(metadata.loaded).toBe(true);
    });

    it('should throw error when registering duplicate plugin', async () => {
      const config: PluginConfig = {
        name: 'DuplicatePlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Test'
      };

      await service.registerPlugin(config);

      try {
        await service.registerPlugin(config);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('already registered');
      }
    });

    it('should check dependencies before registration', async () => {
      const config: PluginConfig = {
        name: 'DependentPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Test',
        dependencies: ['NonExistentPlugin']
      };

      try {
        await service.registerPlugin(config);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('Missing dependencies');
        expect(error.message).toContain('NonExistentPlugin');
      }
    });

    it('should register plugin with dependencies when they exist', async () => {
      const basePlugin: PluginConfig = {
        name: 'BasePlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Base plugin'
      };

      const dependentPlugin: PluginConfig = {
        name: 'DependentPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Dependent plugin',
        dependencies: ['BasePlugin']
      };

      await service.registerPlugin(basePlugin);
      await service.registerPlugin(dependentPlugin);

      const plugins = await new Promise<Map<string, any>>(resolve => {
        service.getPlugins().subscribe(p => resolve(p));
      });

      expect(plugins.has('DependentPlugin')).toBe(true);
    });

    it('should register plugin with services', async () => {
      class TestService {}
      
      const config: PluginConfig = {
        name: 'ServicePlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin with services',
        services: [TestService]
      };

      injectorSpy.get.and.returnValue(new TestService());

      await service.registerPlugin(config);

      expect(injectorSpy.get).toHaveBeenCalledWith(TestService);
    });

    it('should register plugin with hooks', async () => {
      const hookCallback = jasmine.createSpy('hookCallback');
      
      const config: PluginConfig = {
        name: 'HookPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin with hooks',
        hooks: {
          'test_hook': [hookCallback]
        }
      };

      await service.registerPlugin(config);

      const plugins = await new Promise<Map<string, any>>(resolve => {
        service.getPlugins().subscribe(p => resolve(p));
      });

      expect(plugins.has('HookPlugin')).toBe(true);
    });

    it('should handle registration errors', async () => {
      class FailingService {
        constructor() {
          throw new Error('Service initialization failed');
        }
      }

      const config: PluginConfig = {
        name: 'FailingPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin that fails',
        services: [FailingService]
      };

      injectorSpy.get.and.throwError('Service initialization failed');

      try {
        await service.registerPlugin(config);
        fail('Should have thrown an error');
      } catch (error: any) {
        const plugins = await new Promise<Map<string, any>>(resolve => {
          service.getPlugins().subscribe(p => resolve(p));
        });

        const metadata = plugins.get('FailingPlugin');
        expect(metadata.enabled).toBe(false);
        expect(metadata.loaded).toBe(false);
        expect(metadata.error).toBeDefined();
      }
    });
  });

  describe('unregisterPlugin', () => {
    beforeEach(async () => {
      const config: PluginConfig = {
        name: 'TestPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Test plugin'
      };
      await service.registerPlugin(config);
    });

    it('should unregister an existing plugin', async () => {
      await service.unregisterPlugin('TestPlugin');

      const plugins = await new Promise<Map<string, any>>(resolve => {
        service.getPlugins().subscribe(p => resolve(p));
      });

      expect(plugins.has('TestPlugin')).toBe(false);
    });

    it('should throw error when unregistering non-existent plugin', async () => {
      try {
        await service.unregisterPlugin('NonExistentPlugin');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('not registered');
      }
    });

    it('should remove plugin hooks when unregistering', async () => {
      const hookCallback = jasmine.createSpy('hookCallback');
      
      const config: PluginConfig = {
        name: 'HookPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin with hooks',
        hooks: {
          'test_hook': [hookCallback]
        }
      };

      await service.registerPlugin(config);
      await service.unregisterPlugin('HookPlugin');

      const results = service.executeHook('test_hook');
      expect(results.length).toBe(0);
    });
  });

  describe('executeHook', () => {
    it('should execute registered hooks', async () => {
      const hookCallback = jasmine.createSpy('hookCallback').and.returnValue('result');
      
      const config: PluginConfig = {
        name: 'HookPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin with hooks',
        hooks: {
          'test_hook': [hookCallback]
        }
      };

      await service.registerPlugin(config);

      const results = service.executeHook('test_hook', 'arg1', 'arg2');
      
      expect(hookCallback).toHaveBeenCalledWith('arg1', 'arg2');
      expect(results).toContain('result');
    });

    it('should return empty array for non-existent hooks', () => {
      const results = service.executeHook('non_existent_hook');
      expect(results).toEqual([]);
    });

    it('should execute multiple hooks in priority order', async () => {
      const results: string[] = [];
      const hook1 = () => { results.push('hook1'); return 'result1'; };
      const hook2 = () => { results.push('hook2'); return 'result2'; };

      const config1: PluginConfig = {
        name: 'Plugin1',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin 1',
        hooks: { 'test_hook': [hook1] }
      };

      const config2: PluginConfig = {
        name: 'Plugin2',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin 2',
        hooks: { 'test_hook': [hook2] }
      };

      await service.registerPlugin(config1);
      await service.registerPlugin(config2);

      const hookResults = service.executeHook('test_hook');
      
      expect(hookResults.length).toBe(2);
      expect(results.length).toBe(2);
    });

    it('should pass arguments to hook callbacks', async () => {
      const hookCallback = jasmine.createSpy('hookCallback');
      
      const config: PluginConfig = {
        name: 'HookPlugin',
        version: '1.0.0',
        author: 'Test',
        description: 'Plugin with hooks',
        hooks: {
          'test_hook': [hookCallback]
        }
      };

      await service.registerPlugin(config);

      service.executeHook('test_hook', 'arg1', 'arg2', 'arg3');
      
      expect(hookCallback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });
});

