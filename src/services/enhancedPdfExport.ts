import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { Story, StorySlide } from '../types';

interface PdfExportOptions {
  includeImages?: boolean;
  includeMetadata?: boolean;
  password?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
}

export class EnhancedPdfExportService {
  private readonly WATERMARK_TEXT = 'Felearn AI';
  private readonly WATERMARK_OPACITY = 0.3;
  private readonly PAGE_MARGIN = 50;
  private readonly FONT_SIZE_TITLE = 24;
  private readonly FONT_SIZE_SUBTITLE = 14;
  private readonly FONT_SIZE_BODY = 12;
  private readonly FONT_SIZE_CAPTION = 10;
  private readonly LINE_HEIGHT = 1.4;

  /**
   * Export story to PDF with real images, captions, and watermarks
   */
  async exportStoryToPDF(
    story: Story,
    slides: StorySlide[] = [],
    options: PdfExportOptions = {}
  ): Promise<void> {
    const {
      includeImages = true,
      includeMetadata = true,
      password = 'felearn2024',
      watermarkText = this.WATERMARK_TEXT,
      watermarkOpacity = this.WATERMARK_OPACITY
    } = options;

    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Register fontkit for custom font support
      pdfDoc.registerFontkit(fontkit);
      
      // Set document metadata
      pdfDoc.setTitle(story.title);
      pdfDoc.setAuthor('Felearn AI');
      pdfDoc.setSubject('AI Generated Story');
      pdfDoc.setCreator('Felearn AI Platform');
      pdfDoc.setProducer('Felearn AI PDF Export');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // Embed fonts
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const captionFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      let currentPage = pdfDoc.addPage(PageSizes.A4);
      let yPosition = currentPage.getHeight() - this.PAGE_MARGIN;

      // Add title
      yPosition = await this.addTitle(currentPage, story.title, titleFont, yPosition);

      // Add metadata
      if (includeMetadata) {
        yPosition = await this.addMetadata(currentPage, story, bodyFont, yPosition);
      }

      // Add story content
      if (story.content) {
        yPosition = await this.addContent(currentPage, pdfDoc, story.content, bodyFont, yPosition);
      }

      // Add images with captions and watermarks
      if (includeImages && slides.length > 0) {
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          if (slide.image) {
            const result = await this.addImageWithCaptionAndWatermark(
              currentPage,
              pdfDoc,
              slide.image,
              slide.text || '',
              captionFont,
              bodyFont,
              yPosition,
              watermarkText,
              watermarkOpacity
            );
            
            currentPage = result.page;
            yPosition = result.yPosition;
          }
        }
      }

      // Encrypt the PDF with password protection
      if (password) {
        pdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password + '_owner',
          permissions: {
            printing: 'lowResolution',
            modifying: false,
            copying: false,
            annotating: false,
            fillingForms: false,
            contentAccessibility: true,
            documentAssembly: false
          }
        });
      }

      // Save and download the PDF
      const pdfBytes = await pdfDoc.save();
      const fileName = this.sanitizeFileName(story.title) + '_felearn.pdf';
      
      this.downloadPDF(pdfBytes, fileName);
      
      console.log('Enhanced PDF export completed successfully');
    } catch (error) {
      console.error('Enhanced PDF export error:', error);
      throw new Error('Failed to export PDF with enhanced features');
    }
  }

  /**
   * Add title to PDF page
   */
  private async addTitle(
    page: any,
    title: string,
    font: any,
    yPosition: number
  ): Promise<number> {
    const pageWidth = page.getWidth();
    const maxWidth = pageWidth - (this.PAGE_MARGIN * 2);
    
    // Split title if too long
    const titleLines = this.splitTextToFitWidth(title, font, this.FONT_SIZE_TITLE, maxWidth);
    
    titleLines.forEach((line, index) => {
      page.drawText(line, {
        x: this.PAGE_MARGIN,
        y: yPosition,
        size: this.FONT_SIZE_TITLE,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });
      yPosition -= this.FONT_SIZE_TITLE * this.LINE_HEIGHT;
    });

    // Add underline
    page.drawLine({
      start: { x: this.PAGE_MARGIN, y: yPosition + 10 },
      end: { x: pageWidth - this.PAGE_MARGIN, y: yPosition + 10 },
      thickness: 2,
      color: rgb(0.4, 0.4, 0.8)
    });

    return yPosition - 20;
  }

  /**
   * Add metadata to PDF page
   */
  private async addMetadata(
    page: any,
    story: Story,
    font: any,
    yPosition: number
  ): Promise<number> {
    const createdDate = new Date(story.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const metadata = [
      `Created: ${createdDate}`,
      `Generated by: Felearn AI`,
      story.isPinned ? 'Status: Pinned' : '',
      story.tags?.length ? `Tags: ${story.tags.join(', ')}` : ''
    ].filter(Boolean);

    metadata.forEach(line => {
      page.drawText(line, {
        x: this.PAGE_MARGIN,
        y: yPosition,
        size: this.FONT_SIZE_SUBTITLE,
        font: font,
        color: rgb(0.5, 0.5, 0.5)
      });
      yPosition -= this.FONT_SIZE_SUBTITLE * this.LINE_HEIGHT;
    });

    return yPosition - 20;
  }

  /**
   * Add content to PDF with page breaks
   */
  private async addContent(
    page: any,
    pdfDoc: any,
    content: string,
    font: any,
    yPosition: number
  ): Promise<number> {
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const maxWidth = pageWidth - (this.PAGE_MARGIN * 2);
    
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') continue;
      
      const lines = this.splitTextToFitWidth(paragraph, font, this.FONT_SIZE_BODY, maxWidth);
      
      // Check if we need a new page
      const requiredHeight = lines.length * this.FONT_SIZE_BODY * this.LINE_HEIGHT;
      if (yPosition - requiredHeight < this.PAGE_MARGIN) {
        page = pdfDoc.addPage(PageSizes.A4);
        yPosition = pageHeight - this.PAGE_MARGIN;
      }
      
      lines.forEach(line => {
        page.drawText(line, {
          x: this.PAGE_MARGIN,
          y: yPosition,
          size: this.FONT_SIZE_BODY,
          font: font,
          color: rgb(0, 0, 0)
        });
        yPosition -= this.FONT_SIZE_BODY * this.LINE_HEIGHT;
      });
      
      yPosition -= 10; // Paragraph spacing
    }

    return yPosition;
  }

  /**
   * Add image with caption and watermark
   */
  private async addImageWithCaptionAndWatermark(
    page: any,
    pdfDoc: any,
    imageUrl: string,
    caption: string,
    captionFont: any,
    bodyFont: any,
    yPosition: number,
    watermarkText: string,
    watermarkOpacity: number
  ): Promise<{ page: any; yPosition: number }> {
    try {
      // Load image from URL
      const imageBytes = await this.loadImageFromUrl(imageUrl);
      if (!imageBytes) {
        console.warn('Could not load image:', imageUrl);
        return { page, yPosition };
      }

      // Embed image in PDF
      let image;
      try {
        if (imageUrl.toLowerCase().includes('.png') || imageBytes[1] === 0x50) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
      } catch (error) {
        console.warn('Could not embed image:', error);
        return { page, yPosition };
      }

      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      const maxImageWidth = pageWidth - (this.PAGE_MARGIN * 2);
      const maxImageHeight = 300;

      // Calculate image dimensions
      const { width: originalWidth, height: originalHeight } = image.scale(1);
      const aspectRatio = originalWidth / originalHeight;
      
      let imageWidth = Math.min(maxImageWidth, originalWidth);
      let imageHeight = imageWidth / aspectRatio;
      
      if (imageHeight > maxImageHeight) {
        imageHeight = maxImageHeight;
        imageWidth = imageHeight * aspectRatio;
      }

      // Check if we need a new page
      const requiredHeight = imageHeight + 60; // Image + caption space
      if (yPosition - requiredHeight < this.PAGE_MARGIN) {
        page = pdfDoc.addPage(PageSizes.A4);
        yPosition = pageHeight - this.PAGE_MARGIN;
      }

      // Draw image
      const imageX = this.PAGE_MARGIN + (maxImageWidth - imageWidth) / 2;
      const imageY = yPosition - imageHeight;
      
      page.drawImage(image, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight
      });

      // Add watermark to bottom right of image
      const watermarkX = imageX + imageWidth - 80;
      const watermarkY = imageY + 10;
      
      page.drawText(watermarkText, {
        x: watermarkX,
        y: watermarkY,
        size: 10,
        font: bodyFont,
        color: rgb(1, 1, 1),
        opacity: watermarkOpacity
      });

      // Add semi-transparent background for watermark
      page.drawRectangle({
        x: watermarkX - 5,
        y: watermarkY - 3,
        width: 75,
        height: 16,
        color: rgb(0, 0, 0),
        opacity: 0.3
      });

      // Redraw watermark text on top
      page.drawText(watermarkText, {
        x: watermarkX,
        y: watermarkY,
        size: 10,
        font: bodyFont,
        color: rgb(1, 1, 1),
        opacity: 0.8
      });

      yPosition = imageY - 20;

      // Add caption if provided
      if (caption) {
        const cleanCaption = this.cleanCaption(caption);
        if (cleanCaption) {
          const captionLines = this.splitTextToFitWidth(
            cleanCaption,
            captionFont,
            this.FONT_SIZE_CAPTION,
            maxImageWidth
          );

          captionLines.forEach(line => {
            page.drawText(line, {
              x: this.PAGE_MARGIN,
              y: yPosition,
              size: this.FONT_SIZE_CAPTION,
              font: captionFont,
              color: rgb(0.3, 0.3, 0.3)
            });
            yPosition -= this.FONT_SIZE_CAPTION * this.LINE_HEIGHT;
          });
        }
      }

      return { page, yPosition: yPosition - 30 };
    } catch (error) {
      console.error('Error adding image to PDF:', error);
      return { page, yPosition };
    }
  }

  /**
   * Load image from URL as bytes
   */
  private async loadImageFromUrl(url: string): Promise<Uint8Array | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error loading image from URL:', error);
      return null;
    }
  }



  /**
   * Clean caption text
   */
  private cleanCaption(caption: string): string {
    return caption
      .replace(/\*\*Image \d+:\*\*/g, '')
      .replace(/Caption:/g, '')
      .replace(/\*\*/g, '')
      .replace(/^["']|["']$/g, '')
      .trim();
  }

  /**
   * Split text to fit within specified width
   */
  private splitTextToFitWidth(
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is too long, break it
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Download PDF file
   */
  private downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  /**
   * Sanitize filename
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-z0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .toLowerCase()
      .substring(0, 50);
  }
}

// Export singleton instance
export const enhancedPdfExportService = new EnhancedPdfExportService();