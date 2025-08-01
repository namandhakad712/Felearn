import jsPDF from 'jspdf';
import { Story, StorySlide } from '../types';
import { appwriteService } from './appwrite';
import { Functions } from 'appwrite';
import { enhancedPdfExportService } from './enhancedPdfExport';

export type ExportFormat = 'pdf' | 'json' | 'txt' | 'html';

interface ExportOptions {
  includeImages?: boolean;
  includeMetadata?: boolean;
  fontSize?: number;
  pageMargin?: number;
}

/**
 * Export service for handling story exports in various formats
 */
export class ExportService {
  private functions: Functions;

  constructor() {
    // Initialize Appwrite Functions client
    this.functions = new Functions(appwriteService.client);
  }
  /**
   * Export a single story using server-side function (preferred for PDF/JSON)
   */
  async exportStoryServerSide(
    story: Story, 
    format: 'pdf' | 'json',
    userId: string
  ): Promise<void> {
    try {
      console.log('Exporting story server-side:', story.title, 'as', format);
      
      const response = await this.functions.createExecution(
        'export-story',
        JSON.stringify({
          storyId: story.$id,
          format,
          userId
        })
      );
      
      if (response.statusCode !== 200) {
        throw new Error(`Server export failed: ${response.stderr || 'Unknown error'}`);
      }
      
      // The server function returns the file directly
      // In a real implementation, you might get a download URL or the file content
      console.log('Server-side export completed successfully');
      
    } catch (error) {
      console.error('Server-side export error:', error);
      // Fallback to client-side export
      console.log('Falling back to client-side export...');
      await this.exportStory(story, format);
    }
  }

  /**
   * Export a single story (client-side fallback)
   */
  async exportStory(
    story: Story, 
    format: ExportFormat, 
    options: ExportOptions = {},
    slides: StorySlide[] = []
  ): Promise<void> {
    try {
      console.log('Exporting story client-side:', story.title, 'as', format);
      
      switch (format) {
        case 'pdf':
          // Use enhanced PDF export with real images and watermarks
          await enhancedPdfExportService.exportStoryToPDF(story, slides, {
            includeImages: options.includeImages !== false,
            includeMetadata: options.includeMetadata !== false,
            password: 'felearn2024',
            watermarkText: 'Felearn AI',
            watermarkOpacity: 0.3
          });
          break;
        case 'json':
          this.exportToJSON(story, options);
          break;
        case 'txt':
          this.exportToTXT(story, options);
          break;
        case 'html':
          this.exportToHTML(story, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      console.log('Story exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export story as ${format.toUpperCase()}`);
    }
  }

  /**
   * Export multiple stories
   */
  async exportMultipleStories(
    stories: Story[], 
    format: ExportFormat, 
    options: ExportOptions = {}
  ): Promise<void> {
    try {
      console.log('Exporting', stories.length, 'stories as', format);
      
      switch (format) {
        case 'pdf':
          await this.exportMultipleToPDF(stories, options);
          break;
        case 'json':
          this.exportMultipleToJSON(stories, options);
          break;
        case 'txt':
          this.exportMultipleToTXT(stories, options);
          break;
        case 'html':
          this.exportMultipleToHTML(stories, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      console.log('Stories exported successfully');
    } catch (error) {
      console.error('Batch export error:', error);
      throw new Error(`Failed to export stories as ${format.toUpperCase()}`);
    }
  }

  /**
   * Export story to PDF
   */
  private async exportToPDF(story: Story, options: ExportOptions): Promise<void> {
    const {
      includeImages = true,
      includeMetadata = true,
      fontSize = 12,
      pageMargin = 20
    } = options;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const maxWidth = pageWidth - (pageMargin * 2);
    let yPosition = pageMargin;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pageHeight - pageMargin) {
        pdf.addPage();
        yPosition = pageMargin;
      }
    };

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(story.title, maxWidth);
    checkPageBreak(titleLines.length * 8);
    pdf.text(titleLines, pageMargin, yPosition);
    yPosition += titleLines.length * 8 + 10;

    // Metadata
    if (includeMetadata) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      const createdDate = new Date(story.createdAt).toLocaleDateString();
      const metadata = `Created: ${createdDate}${story.isPinned ? ' • Pinned' : ''}${story.tags?.length ? ` • Tags: ${story.tags.join(', ')}` : ''}`;
      
      checkPageBreak(6);
      pdf.text(metadata, pageMargin, yPosition);
      yPosition += 15;
    }

    // Content
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    
    const contentLines = story.content.split('\n');
    
    for (const line of contentLines) {
      if (line.trim() === '') {
        yPosition += fontSize * 0.5;
        continue;
      }
      
      const wrappedLines = pdf.splitTextToSize(line, maxWidth);
      checkPageBreak(wrappedLines.length * (fontSize * 0.4));
      
      pdf.text(wrappedLines, pageMargin, yPosition);
      yPosition += wrappedLines.length * (fontSize * 0.4) + 2;
    }

    // Images (if included and available)
    if (includeImages && story.images && story.images.length > 0) {
      yPosition += 20;
      checkPageBreak(30);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Story Images', pageMargin, yPosition);
      yPosition += 20;
      
      for (let i = 0; i < story.images.length; i++) {
        try {
          checkPageBreak(60);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Image ${i + 1}: ${story.images[i]}`, pageMargin, yPosition);
          yPosition += 15;
        } catch (error) {
          console.warn('Could not add image to PDF:', error);
        }
      }
    }

    // Save the PDF
    const fileName = this.sanitizeFileName(story.title) + '.pdf';
    pdf.save(fileName);
  }

  /**
   * Export multiple stories to PDF
   */
  private async exportMultipleToPDF(stories: Story[], options: ExportOptions): Promise<void> {
    const pdf = new jsPDF();
    const pageMargin = options.pageMargin || 20;
    let isFirstStory = true;

    for (const story of stories) {
      if (!isFirstStory) {
        pdf.addPage();
      }
      
      // Add story to PDF (simplified version)
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(story.title, pageMargin, pageMargin);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const createdDate = new Date(story.createdAt).toLocaleDateString();
      pdf.text(`Created: ${createdDate}`, pageMargin, pageMargin + 15);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const contentLines = pdf.splitTextToSize(story.content, pdf.internal.pageSize.getWidth() - (pageMargin * 2));
      pdf.text(contentLines, pageMargin, pageMargin + 30);
      
      isFirstStory = false;
    }

    const fileName = `stories-export-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Export story to JSON
   */
  private exportToJSON(story: Story, options: ExportOptions): void {
    const { includeMetadata = true } = options;
    
    let exportData: any = {
      title: story.title,
      content: story.content,
    };

    if (includeMetadata) {
      exportData = {
        ...exportData,
        id: story.$id,
        createdAt: story.createdAt,
        isPinned: story.isPinned,
        tags: story.tags || [],
        images: story.images || [],
        metadata: {
          exportedAt: new Date().toISOString(),
          exportFormat: 'json',
          version: '1.0'
        }
      };
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = this.sanitizeFileName(story.title) + '.json';
    this.downloadFile(jsonString, fileName, 'application/json');
  }

  /**
   * Export multiple stories to JSON
   */
  private exportMultipleToJSON(stories: Story[], options: ExportOptions): void {
    const { includeMetadata = true } = options;
    
    const exportData = {
      stories: stories.map(story => ({
        title: story.title,
        content: story.content,
        ...(includeMetadata && {
          id: story.$id,
          createdAt: story.createdAt,
          isPinned: story.isPinned,
          tags: story.tags || [],
          images: story.images || []
        })
      })),
      ...(includeMetadata && {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportFormat: 'json',
          version: '1.0',
          totalStories: stories.length
        }
      })
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `stories-export-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(jsonString, fileName, 'application/json');
  }

  /**
   * Export story to plain text
   */
  private exportToTXT(story: Story, options: ExportOptions): void {
    const { includeMetadata = true } = options;
    
    let content = story.title + '\n';
    content += '='.repeat(story.title.length) + '\n\n';
    
    if (includeMetadata) {
      const createdDate = new Date(story.createdAt).toLocaleDateString();
      content += `Created: ${createdDate}\n`;
      if (story.isPinned) content += 'Status: Pinned\n';
      if (story.tags?.length) content += `Tags: ${story.tags.join(', ')}\n`;
      content += '\n';
    }
    
    content += story.content;
    
    if (story.images?.length) {
      content += '\n\n--- Images ---\n';
      story.images.forEach((image, index) => {
        content += `${index + 1}. ${image}\n`;
      });
    }

    const fileName = this.sanitizeFileName(story.title) + '.txt';
    this.downloadFile(content, fileName, 'text/plain');
  }

  /**
   * Export multiple stories to plain text
   */
  private exportMultipleToTXT(stories: Story[], options: ExportOptions): void {
    let content = 'Story Collection\n';
    content += '================\n\n';
    content += `Exported on: ${new Date().toLocaleDateString()}\n`;
    content += `Total stories: ${stories.length}\n\n`;
    
    stories.forEach((story, index) => {
      content += `\n${'='.repeat(50)}\n`;
      content += `Story ${index + 1}: ${story.title}\n`;
      content += `${'='.repeat(50)}\n\n`;
      content += story.content + '\n';
    });

    const fileName = `stories-export-${new Date().toISOString().split('T')[0]}.txt`;
    this.downloadFile(content, fileName, 'text/plain');
  }

  /**
   * Export story to HTML
   */
  private exportToHTML(story: Story, options: ExportOptions): void {
    const { includeMetadata = true, includeImages = true } = options;
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(story.title)}</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { white-space: pre-wrap; }
        .images { margin-top: 30px; }
        .images img { max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(story.title)}</h1>`;

    if (includeMetadata) {
      const createdDate = new Date(story.createdAt).toLocaleDateString();
      html += `
    <div class="metadata">
        <p>Created: ${createdDate}</p>
        ${story.isPinned ? '<p>Status: Pinned</p>' : ''}
        ${story.tags?.length ? `<p>Tags: ${story.tags.join(', ')}</p>` : ''}
    </div>`;
    }

    html += `
    <div class="content">${this.escapeHtml(story.content)}</div>`;

    if (includeImages && story.images?.length) {
      html += `
    <div class="images">
        <h2>Story Images</h2>`;
      story.images.forEach((image, index) => {
        html += `
        <div>
            <p>Image ${index + 1}:</p>
            <img src="${this.escapeHtml(image)}" alt="Story illustration ${index + 1}" />
        </div>`;
      });
      html += `
    </div>`;
    }

    html += `
</body>
</html>`;

    const fileName = this.sanitizeFileName(story.title) + '.html';
    this.downloadFile(html, fileName, 'text/html');
  }

  /**
   * Export multiple stories to HTML
   */
  private exportMultipleToHTML(stories: Story[], options: ExportOptions): void {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Story Collection</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        h2 { color: #444; margin-top: 40px; }
        .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .content { white-space: pre-wrap; margin-bottom: 30px; }
        .story-separator { border-top: 1px solid #ddd; margin: 40px 0; }
    </style>
</head>
<body>
    <h1>Story Collection</h1>
    <p class="metadata">Exported on: ${new Date().toLocaleDateString()} | Total stories: ${stories.length}</p>`;

    stories.forEach((story, index) => {
      if (index > 0) {
        html += `<div class="story-separator"></div>`;
      }
      
      html += `
    <h2>${this.escapeHtml(story.title)}</h2>
    <div class="metadata">Created: ${new Date(story.createdAt).toLocaleDateString()}</div>
    <div class="content">${this.escapeHtml(story.content)}</div>`;
    });

    html += `
</body>
</html>`;

    const fileName = `stories-export-${new Date().toISOString().split('T')[0]}.html`;
    this.downloadFile(html, fileName, 'text/html');
  }

  /**
   * Download file helper
   */
  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Sanitize filename for safe download
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .toLowerCase()
      .substring(0, 50); // Limit length
  }

  /**
   * Escape HTML characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get available export formats
   */
  getAvailableFormats(): { value: ExportFormat; label: string; description: string }[] {
    return [
      { value: 'pdf', label: 'PDF', description: 'Formatted document with images' },
      { value: 'json', label: 'JSON', description: 'Structured data with metadata' },
      { value: 'txt', label: 'Text', description: 'Plain text format' },
      { value: 'html', label: 'HTML', description: 'Web page with styling' },
    ];
  }
}

// Create and export a singleton instance
export const exportService = new ExportService();