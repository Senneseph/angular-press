import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';

import { AdminLayoutComponent } from '../../admin-layout/admin-layout.component';
import { BlockPaletteComponent } from '../../posts/visual-editor/components/block-palette/block-palette.component';
import { EditorCanvasComponent } from '../../posts/visual-editor/components/editor-canvas/editor-canvas.component';
import { StyleEditorComponent } from '../../posts/visual-editor/components/style-editor/style-editor.component';
import { 
  EditorBlock, 
  BlockType, 
  BLOCK_PALETTE, 
  VisualPostContent,
  BlockPaletteItem 
} from '../../posts/visual-editor/models/editor-block.interface';
import { getApiUrl } from '../../../core/utils/api-url.util';

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    AdminLayoutComponent,
    BlockPaletteComponent,
    EditorCanvasComponent,
    StyleEditorComponent
  ],
  templateUrl: './page-editor.component.html',
  styleUrls: ['./page-editor.component.scss']
})
export class PageEditorComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();
  private apiUrl = getApiUrl();

  // State signals
  blocks = signal<EditorBlock[]>([]);
  selectedBlockId = signal<string | null>(null);
  isEditorMode = signal<'visual' | 'code'>('visual');
  isDirty = signal(false);
  isSaving = signal(false);

  // Computed
  selectedBlock = computed(() => {
    const id = this.selectedBlockId();
    return this.blocks().find(b => b.id === id) || null;
  });

  // Form
  pageForm: FormGroup;
  pageId: number | null = null;
  isEditMode = false;

  // Palette items - filter out post-specific blocks for pages
  paletteItems = BLOCK_PALETTE.filter(item => 
    !['date', 'author', 'signature', 'comments'].includes(item.type)
  );

  constructor() {
    this.pageForm = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      excerpt: [''],
      status: ['draft'],
      parentId: [null]
    });

    // Auto-generate slug from title
    this.pageForm.get('title')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(title => {
      if (!this.isEditMode) {
        const slug = this.generateSlug(title);
        this.pageForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pageId = parseInt(id, 10);
      this.isEditMode = true;
      this.loadPage(this.pageId);
    } else {
      this.initializeDefaultBlocks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDefaultBlocks(): void {
    this.blocks.set([
      this.createBlock('title', 'Page Title'),
      this.createBlock('body', 'Start writing your page content here...')
    ]);
  }

  private loadPage(id: number): void {
    this.http.get<any>(`${this.apiUrl}/pages/${id}`).subscribe({
      next: (page) => {
        this.pageForm.patchValue({
          title: page.title,
          slug: page.slug,
          excerpt: page.excerpt,
          status: page.status,
          parentId: page.parentId
        });

        // Try to parse structured content
        if (page.content) {
          try {
            const parsed = JSON.parse(page.content);
            if (parsed.version && parsed.blocks) {
              this.blocks.set(parsed.blocks);
            } else {
              // Legacy HTML content - wrap in body block
              this.blocks.set([
                this.createBlock('title', page.title),
                this.createBlock('html', page.content)
              ]);
            }
          } catch {
            // Plain HTML content
            this.blocks.set([
              this.createBlock('title', page.title),
              this.createBlock('html', page.content)
            ]);
          }
        } else {
          this.initializeDefaultBlocks();
        }
      },
      error: (err) => {
        console.error('Failed to load page:', err);
        this.router.navigate(['/ap-admin/pages']);
      }
    });
  }

  createBlock(type: BlockType, content: string = ''): EditorBlock {
    return {
      id: crypto.randomUUID(),
      type,
      content,
      cssClasses: [],
      styles: {},
      config: {},
      order: this.blocks().length
    };
  }

  addBlock(item: BlockPaletteItem): void {
    const newBlock = this.createBlock(item.type, item.defaultContent || '');
    this.blocks.update(blocks => [...blocks, newBlock]);
    this.selectedBlockId.set(newBlock.id);
    this.isDirty.set(true);
  }

  selectBlock(id: string | null): void {
    this.selectedBlockId.set(id);
  }

  updateBlock(updatedBlock: EditorBlock): void {
    this.blocks.update(blocks =>
      blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b)
    );
    this.isDirty.set(true);
  }

  deleteBlock(id: string): void {
    this.blocks.update(blocks => blocks.filter(b => b.id !== id));
    if (this.selectedBlockId() === id) {
      this.selectedBlockId.set(null);
    }
    this.isDirty.set(true);
  }

  duplicateBlock(id: string): void {
    const block = this.blocks().find(b => b.id === id);
    if (block) {
      const newBlock: EditorBlock = {
        ...block,
        id: crypto.randomUUID()
      };
      const index = this.blocks().findIndex(b => b.id === id);
      this.blocks.update(blocks => {
        const updated = [...blocks];
        updated.splice(index + 1, 0, newBlock);
        return updated;
      });
      this.selectedBlockId.set(newBlock.id);
      this.isDirty.set(true);
    }
  }

  moveBlockUp(id: string): void {
    const index = this.blocks().findIndex(b => b.id === id);
    if (index > 0) {
      this.blocks.update(blocks => {
        const updated = [...blocks];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        return updated;
      });
      this.isDirty.set(true);
    }
  }

  moveBlockDown(id: string): void {
    const index = this.blocks().findIndex(b => b.id === id);
    if (index < this.blocks().length - 1) {
      this.blocks.update(blocks => {
        const updated = [...blocks];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        return updated;
      });
      this.isDirty.set(true);
    }
  }

  onBlocksReordered(blocks: EditorBlock[]): void {
    this.blocks.set(blocks);
    this.isDirty.set(true);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  save(publish: boolean = false): void {
    if (this.pageForm.invalid) {
      return;
    }

    this.isSaving.set(true);

    const structuredContent: VisualPostContent = {
      version: '1.0',
      blocks: this.blocks()
    };

    const pageData = {
      title: this.pageForm.value.title,
      content: JSON.stringify(structuredContent),
      excerpt: this.pageForm.value.excerpt || '',
      status: publish ? 'publish' : this.pageForm.value.status,
      slug: this.pageForm.value.slug,
      parentId: this.pageForm.value.parentId
    };

    const request$ = this.isEditMode
      ? this.http.patch(`${this.apiUrl}/pages/${this.pageId}`, pageData)
      : this.http.post(`${this.apiUrl}/pages`, pageData);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.isDirty.set(false);
        this.router.navigate(['/ap-admin/pages']);
      },
      error: (err) => {
        console.error('Failed to save page:', err);
        this.isSaving.set(false);
      }
    });
  }

  generateHtmlFromBlocks(blocks: EditorBlock[]): string {
    return blocks.map(block => {
      const classes = block.cssClasses.join(' ');
      const style = Object.entries(block.styles)
        .map(([k, v]) => `${this.camelToKebab(k)}: ${v}`)
        .join('; ');
      const attrs = `class="${classes}" style="${style}"`.trim();

      switch (block.type) {
        case 'title':
          return `<h1 ${attrs}>${block.content}</h1>`;
        case 'heading':
          const level = block.config['level'] || 2;
          return `<h${level} ${attrs}>${block.content}</h${level}>`;
        case 'lede':
          return `<p class="lede ${classes}" style="${style}">${block.content}</p>`;
        case 'body':
          return `<div class="body-content ${classes}" style="${style}">${block.content}</div>`;
        case 'quote':
          return `<blockquote ${attrs}>${block.content}<cite>${block.config['citation'] || ''}</cite></blockquote>`;
        case 'image':
          return `<figure ${attrs}><img src="${block.content}" alt="${block.config['alt'] || ''}"><figcaption>${block.config['caption'] || ''}</figcaption></figure>`;
        case 'divider':
          return `<hr ${attrs}>`;
        case 'spacer':
          return `<div class="spacer ${classes}" style="height: ${block.config['height'] || 32}px; ${style}"></div>`;
        case 'html':
          return block.content;
        default:
          return `<div ${attrs}>${block.content}</div>`;
      }
    }).join('\n');
  }

  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  cancel(): void {
    if (this.isDirty() && !confirm('You have unsaved changes. Are you sure you want to leave?')) {
      return;
    }
    this.router.navigate(['/ap-admin/pages']);
  }
}

