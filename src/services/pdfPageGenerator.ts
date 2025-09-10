import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import { Story, StorySlide } from '../types';

interface PdfExportOptions {
  includeImages?: boolean;
  includeMetadata?: boolean;
  password?: string;
  watermarkText?: string;
  watermarkOpacity?: number;
}

export class PdfPageGenerator {
  private readonly PAGE_MARGIN = 50;
  private readonly LINE_HEIGHT = 1.4;

  /**
   * Embed image based on its format
   */
  private async embedImage(pdfDoc: any, imageBytes: Uint8Array): Promise<any> {
    try {
      // Try to detect image format from the bytes
      if (this.isJpeg(imageBytes)) {
        return await pdfDoc.embedJpg(imageBytes);
      } else {
        // For PNG, WEBP or other formats, use embedPng
        return await pdfDoc.embedPng(imageBytes);
      }
    } catch (error) {
      console.warn('Failed to embed image as JPEG, trying PNG:', error);
      try {
        return await pdfDoc.embedPng(imageBytes);
      } catch (pngError) {
        console.error('Failed to embed image as PNG:', pngError);
        throw error;
      }
    }
  }

  /**
   * Check if image bytes represent a JPEG image
   */
  private isJpeg(bytes: Uint8Array): boolean {
    // JPEG magic number: FF D8 FF
    return bytes.length >= 3 && 
           bytes[0] === 0xFF && 
           bytes[1] === 0xD8 && 
           bytes[2] === 0xFF;
  }

  /**
   * Load image from URL as bytes
   */
  private async loadImageFromUrl(url: string): Promise<Uint8Array | null> {
    try {
      // Handle relative URLs by making them absolute
      let imageUrl = url;
      if (url.startsWith('/')) {
        // For relative URLs, make them absolute
        const baseUrl = window.location.origin;
        imageUrl = baseUrl + url;
      }
      
      console.log('Loading image from URL:', imageUrl);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error loading image from URL:', url, error);
      return null;
    }
  }

  /**
   * Generate the acknowledgment page content
   */
  async generateAcknowledgmentPage(
    pdfDoc: any,
    bodyFont: any,
    dosisFont: any,
    consolasFont: any,
    ubuntuLightFont: any
  ): Promise<void> {
    const page = pdfDoc.addPage(PageSizes.A4);
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();

    // Start from top of page
    let currentY = pageHeight - this.PAGE_MARGIN;

    // ACKNOWLEDGEMENT {TITLE} - Bold, large, top-center, simple font
    const titleFontSize = 36;
    const titleText = 'ACKNOWLEDGEMENT';
    const titleWidth = bodyFont.widthOfTextAtSize(titleText, titleFontSize);
    const titleX = (pageWidth - titleWidth) / 2;

    page.drawText(titleText, {
      x: titleX,
      y: currentY,
      size: titleFontSize,
      font: bodyFont,
      color: rgb(0.1, 0.1, 0.1)
    });
    currentY -= titleFontSize * this.LINE_HEIGHT + 40;

    // A Note on Your AI-Generated Story {sub-title} - Dosis font
    const subtitleFontSize = 24;
    const subtitleText = 'A Note on Your AI-Generated Story';
    const subtitleWidth = dosisFont.widthOfTextAtSize(subtitleText, subtitleFontSize);
    const subtitleX = (pageWidth - subtitleWidth) / 2;

    page.drawText(subtitleText, {
      x: subtitleX,
      y: currentY,
      size: subtitleFontSize,
      font: dosisFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    currentY -= subtitleFontSize * this.LINE_HEIGHT + 30;

    // Happy Learning text - Ubuntu font, centered
    const happyLearningFontSize = 28;
    const happyLearningText = "Happy Learning";
    const happyLearningWidth = ubuntuLightFont.widthOfTextAtSize(happyLearningText, happyLearningFontSize);
    const happyLearningX = (pageWidth - happyLearningWidth) / 2;

    page.drawText(happyLearningText, {
      x: happyLearningX,
      y: currentY,
      size: happyLearningFontSize,
      font: ubuntuLightFont,
      color: rgb(0.2, 0.2, 0.6)
    });
    currentY -= happyLearningFontSize * this.LINE_HEIGHT + 30;

    // Small logo (same as front page but smaller)
    const smallLogoWidth = 139;
    const smallLogoHeight = 41;

    try {
      const imageBytes = await this.loadImageFromUrl('/assets/felearn-logo.webp');
      if (imageBytes) {
        const image = await this.embedImage(pdfDoc, imageBytes);
        const logoX = (pageWidth - smallLogoWidth) / 2;
        const logoY = currentY - smallLogoHeight;

        page.drawImage(image, {
          x: logoX,
          y: logoY,
          width: smallLogoWidth,
          height: smallLogoHeight
        });
        currentY = logoY - 20;
      }
    } catch (error) {
      console.warn('Failed to load small logo for acknowledgment page:', error);
    }

    // Creation Metadata - Consolas font
    const metadataFontSize = 10;
    const currentTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const metadataText = `Creation Metadata: PDF generated on ${currentTime}`;
    page.drawText(metadataText, {
      x: this.PAGE_MARGIN,
      y: currentY,
      size: metadataFontSize,
      font: consolasFont,
      color: rgb(0.5, 0.5, 0.5)
    });
    currentY -= metadataFontSize * this.LINE_HEIGHT + 10;
    
    // Additional text at the bottom with clickable links
    const additionalText = "This document was created with the assistance of Felearn AI. For ";
    const linkText1 = "acknowledgment";
    const middleText = " details, please refer to the ";
    const linkText2 = "website";
    const endText = ".";
    
    // Calculate positions for the text with clickable links
    const fontSize = 8;
    const totalWidth = 
      consolasFont.widthOfTextAtSize(additionalText, fontSize) +
      consolasFont.widthOfTextAtSize(linkText1, fontSize) +
      consolasFont.widthOfTextAtSize(middleText, fontSize) +
      consolasFont.widthOfTextAtSize(linkText2, fontSize) +
      consolasFont.widthOfTextAtSize(endText, fontSize);
    
    let currentX = (pageWidth - totalWidth) / 2;
    
    // Draw the first part of the text
    page.drawText(additionalText, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font: consolasFont,
      color: rgb(0.4, 0.4, 0.4)
    });
    currentX += consolasFont.widthOfTextAtSize(additionalText, fontSize);
    
    // Draw the first link (acknowledgment) with underline to indicate it's clickable
    page.drawText(linkText1, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font: consolasFont,
      color: rgb(0, 0, 1) // Blue color for links
    });
    
    // Add underline for the first link
    const link1Width = consolasFont.widthOfTextAtSize(linkText1, fontSize);
    page.drawLine({
      start: { x: currentX, y: currentY - 1 },
      end: { x: currentX + link1Width, y: currentY - 1 },
      thickness: 0.5,
      color: rgb(0, 0, 1)
    });
    
    // Add link annotation for the first link
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [currentX, currentY - 5, currentX + link1Width, currentY + fontSize],
      Border: [0, 0, 0],
      A: {
        S: 'URI',
        URI: 'https://felearn.vercel.app/acknowledgment'
      }
    });
    
    currentX += link1Width;
    
    // Draw the middle text
    page.drawText(middleText, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font: consolasFont,
      color: rgb(0.4, 0.4, 0.4)
    });
    currentX += consolasFont.widthOfTextAtSize(middleText, fontSize);
    
    // Draw the second link (website) with underline to indicate it's clickable
    page.drawText(linkText2, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font: consolasFont,
      color: rgb(0, 0, 1) // Blue color for links
    });
    
    // Add underline for the second link
    const link2Width = consolasFont.widthOfTextAtSize(linkText2, fontSize);
    page.drawLine({
      start: { x: currentX, y: currentY - 1 },
      end: { x: currentX + link2Width, y: currentY - 1 },
      thickness: 0.5,
      color: rgb(0, 0, 1)
    });
    
    // Add link annotation for the second link
    page.doc.context.obj({
      Type: 'Annot',
      Subtype: 'Link',
      Rect: [currentX, currentY - 5, currentX + link2Width, currentY + fontSize],
      Border: [0, 0, 0],
      A: {
        S: 'URI',
        URI: 'https://felearn.vercel.app/acknowledgment'
      }
    });
    
    currentX += link2Width;
    
    // Draw the end text
    page.drawText(endText, {
      x: currentX,
      y: currentY,
      size: fontSize,
      font: consolasFont,
      color: rgb(0.4, 0.4, 0.4)
    });
  }

  /**
   * Embed image based on its format
   */
  private async embedImage(pdfDoc: any, imageBytes: Uint8Array): Promise<any> {
    try {
      // Try to detect image format from the bytes
      if (this.isJpeg(imageBytes)) {
        return await pdfDoc.embedJpg(imageBytes);
      } else {
        // For PNG, WEBP or other formats, use embedPng
        return await pdfDoc.embedPng(imageBytes);
      }
    } catch (error) {
      console.warn('Failed to embed image as JPEG, trying PNG:', error);
      try {
        return await pdfDoc.embedPng(imageBytes);
      } catch (pngError) {
        console.error('Failed to embed image as PNG:', pngError);
        throw error;
      }
    }
  }

  /**
   * Check if image bytes represent a JPEG image
   */
  private isJpeg(bytes: Uint8Array): boolean {
    // JPEG magic number: FF D8 FF
    return bytes.length >= 3 && 
           bytes[0] === 0xFF && 
           bytes[1] === 0xD8 && 
           bytes[2] === 0xFF;
  }

  /**
   * Load image from URL as bytes
   */
  private async loadImageFromUrl(url: string): Promise<Uint8Array | null> {
    try {
      // Handle relative URLs by making them absolute
      let imageUrl = url;
      if (url.startsWith('/')) {
        // For relative URLs, make them absolute
        const baseUrl = window.location.origin;
        imageUrl = baseUrl + url;
      }
      
      console.log('Loading image from URL:', imageUrl);
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error loading image from URL:', url, error);
      return null;
    }
  }

  /**
   * Split text to fit within specified width with improved word wrapping
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

          // ✅ Check if single word is still too long
          const singleWordWidth = font.widthOfTextAtSize(word, fontSize);
          if (singleWordWidth > maxWidth) {
            // Break long word into smaller parts
            const brokenWord = this.breakLongWord(word, font, fontSize, maxWidth);
            lines.push(...brokenWord.slice(0, -1)); // Add all but last part
            currentLine = brokenWord[brokenWord.length - 1]; // Keep last part for next line
          }
        } else {
          // Single word is too long, break it
          const brokenWord = this.breakLongWord(word, font, fontSize, maxWidth);
          lines.push(...brokenWord.slice(0, -1));
          currentLine = brokenWord[brokenWord.length - 1];
        }
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Break a long word into smaller parts that fit within maxWidth
   */
  private breakLongWord(
    word: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] {
    const parts: string[] = [];
    let currentPart = '';

    for (let i = 0; i < word.length; i++) {
      const testPart = currentPart + word[i];
      const testWidth = font.widthOfTextAtSize(testPart, fontSize);

      if (testWidth <= maxWidth) {
        currentPart = testPart;
      } else {
        if (currentPart) {
          parts.push(currentPart + '-'); // Add hyphen for broken words
          currentPart = word[i];
        } else {
          // Even single character is too wide (shouldn't happen with normal fonts)
          parts.push(word[i]);
        }
      }
    }

    if (currentPart) {
      parts.push(currentPart);
    }

    return parts.length > 0 ? parts : [word];
  }
}

// Export singleton instance
export const pdfPageGenerator = new PdfPageGenerator();