import { Functions } from 'appwrite';
import { appwriteService } from './appwrite';
import { enhancedPdfExportService } from './enhancedPdfExport';
import { Story, StorySlide } from '../types';

export type ExportFormat = 'pdf';

interface ExportOptions {
  includeImages?: boolean;
  includeMetadata?: boolean;
  fontSize?: number;
  pageMargin?: number;
}

export class ExportService {
  private functions: Functions;

  constructor() {
    // Initialize Appwrite Functions client
    // this.functions = new Functions(appwriteService.client); // Removed - client property doesn't exist
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
      
      if (response.status !== 'completed') {
        throw new Error(`Server export failed: ${response.errors || 'Unknown error'}`);
      }
      
      // The server function returns the file directly
      // In a real implementation, you might get a download URL or the file content
      console.log('Server-side export completed successfully');
      
    } catch (error) {
      console.error('Server-side export error:', error);
      // Fallback to client-side export
      console.log('Falling back to client-side export...');
      await this.exportStory(story, format as ExportFormat);
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
      
      // Only support PDF format
      if (format === 'pdf') {
        await enhancedPdfExportService.exportStoryToPDF(story, slides, {
          includeImages: options.includeImages !== false,
          includeMetadata: options.includeMetadata !== false,
          watermarkText: 'Felearn AI',
          watermarkOpacity: 0.3
        });
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
      
      console.log('Story exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      throw error;
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
      // Exporting stories
      
      switch (format) {
        case 'pdf':
          await this.exportMultipleToPDF(stories, options);
          break;
        // case 'json':
        //   this.exportMultipleToJSON(stories, options);
        //   break;
        // case 'txt':
        //   this.exportMultipleToTXT(stories, options);
        //   break;
        // case 'html':
        //   this.exportMultipleToHTML(stories, options);
        //   break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      console.log('Multiple stories exported successfully');
    } catch (error) {
      console.error('Multiple export error:', error);
      throw error;
    }
  }

  /**
   * Export story to PDF
   */
  // private async exportToPDF(story: Story, options: ExportOptions): Promise<void> {
  //   const {
  //     includeImages = true,
  //     includeMetadata = true,
  //     fontSize = 12,
  //     pageMargin = 20
  //   } = options;

  //   const pdf = new jsPDF();
  //   let yPosition = pageMargin;

  //   // Helper function to check if we need a page break
  //   const checkPageBreak = (requiredHeight: number) => {
  //     if (yPosition + requiredHeight > pdf.internal.pageSize.height - pageMargin) {
  //       pdf.addPage();
  //       yPosition = pageMargin;
  //     }
  //   };

  //   // Add title
  //   checkPageBreak(20);
  //   pdf.setFontSize(18);
  //   pdf.setFont('helvetica', 'bold');
  //   pdf.text(story.title, pageMargin, yPosition);
  //   yPosition += 20;

  //   // Add metadata if requested
  //   if (includeMetadata) {
  //     checkPageBreak(30);
  //     pdf.setFontSize(10);
  //     pdf.setFont('helvetica', 'normal');
  //     pdf.text(`Created: ${new Date(story.createdAt).toLocaleDateString()}`, pageMargin, yPosition);
  //     yPosition += 10;
  //     pdf.text(`User: ${story.userId}`, pageMargin, yPosition);
  //     yPosition += 10;
  //     pdf.text(`Story ID: ${story.$id}`, pageMargin, yPosition);
  //     yPosition += 15;
  //   }

  //   // Add content
  //   checkPageBreak(20);
  //   pdf.setFontSize(fontSize);
  //   pdf.setFont('helvetica', 'normal');
  
  //   // Split content into lines that fit the page width
  //   const maxWidth = pdf.internal.pageSize.width - (pageMargin * 2);
  //   const lines = pdf.splitTextToSize(story.content, maxWidth);
  
  //   for (const line of lines) {
  //     checkPageBreak(10);
  //     pdf.text(line, pageMargin, yPosition);
  //     yPosition += 10;
  //   }

  //   // Add images if requested and available
  //   if (includeImages && story.images && story.images.length > 0) {
  //     yPosition += 10;
  //     
  //     for (let i = 0; i < story.images.length; i++) {
  //       const imageUrl = story.images[i];
  //       
  //       try {
  //         // Load image
  //         const img = new Image();
  //         img.crossOrigin = 'anonymous';
  //         
  //         await new Promise((resolve, reject) => {
  //           img.onload = resolve;
  //           img.onerror = reject;
  //           img.src = imageUrl;
  //         });
  //         
  //         // Check if we need a page break for the image
  //         const imgHeight = (img.height * maxWidth) / img.width;
  //         checkPageBreak(imgHeight + 10);
  //         
  //         // Add image caption
  //         pdf.setFontSize(10);
  //         pdf.text(`Image ${i + 1}:`, pageMargin, yPosition);
  //         yPosition += 5;
  //         
  //         // Add image
  //         pdf.addImage(img, 'JPEG', pageMargin, yPosition, maxWidth, imgHeight);
  //         yPosition += imgHeight + 10;
  //       } catch (error) {
  //         console.error(`Failed to add image ${i + 1}:`, error);
  //         // Continue with next image
  //       }
  //     }
  //   }

  //   // Save the PDF
  //   const fileName = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  //   pdf.save(fileName);
  // }

  /**
   * Export multiple stories to PDF
   */
  private async exportMultipleToPDF(stories: Story[], options: ExportOptions): Promise<void> {
    // TODO: Implement multiple PDF export
    // For now, export each story individually
    for (const story of stories) {
      await this.exportStory(story, 'pdf', options);
    }
  }

  /**
   * Export story to JSON
   */
  // private exportToJSON(story: Story, options: ExportOptions): void {
  //   const { includeMetadata = true } = options;
  
  //   let exportData: any = {
  //     title: story.title,
  //     content: story.content,
  //     images: story.images || [],
  //     slides: story.slides || []
  //   };
  
  //   if (includeMetadata) {
  //     exportData = {
  //       ...exportData,
  //       metadata: {
  //         id: story.$id,
  //         userId: story.userId,
  //         createdAt: story.createdAt,
  //         updatedAt: story.updatedAt,
  //         isPinned: story.isPinned,
  //         exportDate: new Date().toISOString(),
  //         exportFormat: 'json'
  //       }
  //     };
  //   }
  
  //   const jsonString = JSON.stringify(exportData, null, 2);
  //   const fileName = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  //   this.downloadFile(jsonString, fileName, 'application/json');
  // }

  /**
   * Export multiple stories to JSON
   */
  // private exportMultipleToJSON(stories: Story[], _options: ExportOptions): void {
  //   const { includeMetadata = true } = options;
  
  //   const exportData = {
  //     stories: stories.map(story => {
  //       let storyData: any = {
  //         title: story.title,
  //         content: story.content,
  //         images: story.images || [],
  //         slides: story.slides || []
  //       };
  
  //       if (includeMetadata) {
  //         storyData = {
  //           ...storyData,
  //           metadata: {
  //             id: story.$id,
  //             userId: story.userId,
  //             createdAt: story.createdAt,
  //             updatedAt: story.updatedAt,
  //             isPinned: story.isPinned
  //           }
  //         };
  //       }
  
  //       return storyData;
  //     }),
  //     exportMetadata: {
  //       exportDate: new Date().toISOString(),
  //       totalStories: stories.length,
  //       exportFormat: 'json'
  //     }
  //   };
  
  //   const jsonString = JSON.stringify(exportData, null, 2);
  //   const fileName = `stories-collection-${new Date().toISOString().split('T')[0]}.json`;
  //   this.downloadFile(jsonString, fileName, 'application/json');
  // }

  /**
   * Export story to plain text
   */
  // private exportToTXT(story: Story, options: ExportOptions): void {
  //   const { includeMetadata = true } = options;
  
  //   let content = story.title + '\n';
  //   content += '='.repeat(story.title.length) + '\n\n';
  
  //   if (includeMetadata) {
  //     content += `Created: ${new Date(story.createdAt).toLocaleDateString()}\n`;
  //     content += `User ID: ${story.userId}\n`;
  //     content += `Story ID: ${story.$id}\n\n`;
  //   }
  
  //   content += story.content + '\n\n';
  
  //   if (story.images && story.images.length > 0) {
  //     content += 'Images:\n';
  //     story.images.forEach((image, index) => {
  //       content += `${index + 1}. ${image}\n`;
  //     });
  //   }
  
  //   const fileName = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
  //   this.downloadFile(content, fileName, 'text/plain');
  // }

  /**
   * Export multiple stories to plain text
   */
  // private exportMultipleToTXT(stories: Story[], options: ExportOptions): void {
  //   let content = 'Story Collection\n';
  //   content += '================\n\n';
  //   content += `Exported on: ${new Date().toLocaleDateString()}\n`;
  //   content += `Total stories: ${stories.length}\n\n`;
  
  //   stories.forEach((story, index) => {
  //     content += `${index + 1}. ${story.title}\n`;
  //     content += '-'.repeat(story.title.length + 4) + '\n';
  //     content += `Created: ${new Date(story.createdAt).toLocaleDateString()}\n`;
  //     content += story.content + '\n\n';
  //   });
  
  //   const fileName = `stories-collection-${new Date().toISOString().split('T')[0]}.txt`;
  //   this.downloadFile(content, fileName, 'text/plain');
  // }

  /**
   * Export story to HTML
   */
  // private exportToHTML(story: Story, options: ExportOptions): void {
  //   const { includeMetadata = true, includeImages = true } = options;
  
  //   let html = `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  //   <meta charset="UTF-8">
  //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //   <title>${story.title}</title>
  //   <style>
  //     body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  //     h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  //     .metadata { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
  //     .content { line-height: 1.6; }
  //     .image { max-width: 100%; height: auto; margin: 20px 0; border-radius: 5px; }
  //     .image-caption { text-align: center; color: #666; font-style: italic; }
  //   </style>
  // </head>
  // <body>
  //   <h1>${this.escapeHtml(story.title)}</h1>`;
  
  //   if (includeMetadata) {
  //     html += `
  //   <div class="metadata">
  //     <p><strong>Created:</strong> ${new Date(story.createdAt).toLocaleDateString()}</p>
  //     <p><strong>User ID:</strong> ${story.userId}</p>
  //     <p><strong>Story ID:</strong> ${story.$id}</p>
  //   </div>`;
  //   }
  
  //   html += `
  //   <div class="content">
  //     ${story.content.split('\n').map(line => `<p>${this.escapeHtml(line)}</p>`).join('')}
  //   </div>`;
  
  //   if (includeImages && story.images && story.images.length > 0) {
  //     html += `
  //   <h2>Images</h2>`;
  //     story.images.forEach((image, index) => {
  //       html += `
  //     <div>
  //       <img src="${image}" alt="Story image ${index + 1}" class="image">
  //       <p class="image-caption">Image ${index + 1}</p>
  //     </div>`;
  //     });
  //   }
  
  //   html += `
  // </body>
  // </html>`;
  
  //   const fileName = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
  //   this.downloadFile(html, fileName, 'text/html');
  // }

  /**
   * Export multiple stories to HTML
   */
  // private exportMultipleToHTML(stories: Story[], _options: ExportOptions): void {
  //   let html = `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  //   <meta charset="UTF-8">
  //   <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //   <title>Story Collection</title>
  //   <style>
  //     body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  //     h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
  //     .story { margin: 40px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px; }
  //     .story h2 { color: #555; margin-top: 0; }
  //     .metadata { background: #f9f9f9; padding: 10px; border-radius: 3px; margin: 10px 0; font-size: 0.9em; }
  //     .content { line-height: 1.6; }
  //   </style>
  // </head>
  // <body>
  //   <h1>Story Collection</h1>
  //   <p><strong>Exported on:</strong> ${new Date().toLocaleDateString()}</p>
  //   <p><strong>Total stories:</strong> ${stories.length}</p>`;
  
  //   stories.forEach((story, index) => {
  //     html += `
  //   <div class="story">
  //     <h2>${index + 1}. ${this.escapeHtml(story.title)}</h2>
  //     <div class="metadata">
  //       <p><strong>Created:</strong> ${new Date(story.createdAt).toLocaleDateString()}</p>
  //       <p><strong>User ID:</strong> ${story.userId}</p>
  //     </div>
  //     <div class="content">
  //       ${story.content.split('\n').map(line => `<p>${this.escapeHtml(line)}</p>`).join('')}
  //     </div>
  //   </div>`;
  //   });
  
  //   html += `
  // </body>
  // </html>`;
  
  //   const fileName = `stories-collection-${new Date().toISOString().split('T')[0]}.html`;
  //   this.downloadFile(html, fileName, 'text/html');
  // }

  /**
   * Download a file to the user's device
   */
  private downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = this.sanitizeFileName(fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Sanitize filename for safe download
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9.-]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Escape HTML special characters
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
      {
        value: 'pdf',
        label: 'PDF',
        description: 'Portable Document Format - best for printing and sharing'
      }
    ];
  }
}

// Create and export a singleton instance
export const exportService = new ExportService();