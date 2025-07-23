/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI, Modality} from '@google/genai';
import {marked} from 'marked';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const chat = ai.chats.create({
  model: 'gemini-2.0-flash-preview-image-generation',
  config: {
    responseModalities: [Modality.TEXT, Modality.IMAGE],
  },
  history: [],
});

const userInput = document.querySelector('#input') as HTMLTextAreaElement;
const modelOutput = document.querySelector('#output') as HTMLDivElement;
const slideshow = document.querySelector('#slideshow') as HTMLDivElement;
const error = document.querySelector('#error') as HTMLDivElement;

const additionalInstructions = `
Use a fun story about lots of tiny cats as a metaphor.
Keep sentences short but conversational, casual, and engaging.
Generate a cute, minimal illustration for each sentence with black ink on white background.
No commentary, just begin your explanation.
Keep going until you're done.`;

// This function is kept for reference but not used
async function addSlide(text: string, image: HTMLImageElement) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  const caption = document.createElement('div') as HTMLDivElement;
  caption.className = 'caption';
  caption.innerHTML = await marked.parse(text);
  slide.append(image);
  slide.append(caption);
  slideshow.append(slide);
}

function addImageSlide(image: HTMLImageElement) {
  const slide = document.createElement('div');
  slide.className = 'slide';
  
  // Add image immediately
  slide.append(image);
  
  // Add generating placeholder for caption with enhanced visibility
  const caption = document.createElement('div');
  caption.className = 'caption generating';
  caption.style.display = 'block';
  caption.style.width = '100%';
  caption.style.padding = '15px';
  caption.style.marginTop = '20px';
  caption.style.backgroundColor = '#f9f9f9';
  caption.style.border = '1px solid #e0e0e0';
  caption.style.borderRadius = '6px';
  caption.style.color = '#6c757d';
  caption.style.fontSize = '18px';
  caption.innerHTML = '<span class="generating-text">Generating...</span>';
  slide.append(caption);
  
  slideshow.append(slide);
  slideshow.removeAttribute('hidden');
  
  return slide;
}

async function updateSlideCaption(slide: HTMLElement, text: string) {
  const caption = slide.querySelector('.caption');
  if (caption) {
    caption.className = 'caption';
    
    // Apply enhanced styling for better visibility
    caption.setAttribute('style', `
      display: block;
      width: 100%;
      padding: 15px;
      margin-top: 20px;
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      color: #000000;
      font-size: 18px;
      font-weight: normal;
      text-align: center;
    `);
    
    caption.innerHTML = await marked.parse(text);
    
    // Log for debugging
    console.log('Updated caption with text:', text);
  }
}

function parseError(error: string) {
  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  try {
    if (m && m[1]) {
      const err = JSON.parse(m[1]);
      return err.message;
    }
    return error;
  } catch (_) {
    return error;
  }
}

async function generate(message: string) {
  userInput.disabled = true;

  // Reset chat context
  try {
    // @ts-ignore - Accessing private property
    chat.history.length = 0;
  } catch (e) {
    console.warn('Could not reset chat history');
  }
  modelOutput.innerHTML = '';
  slideshow.innerHTML = '';
  error.innerHTML = '';
  error.toggleAttribute('hidden', true);

  try {
    const userTurn = document.createElement('div') as HTMLDivElement;
    userTurn.innerHTML = await marked.parse(message);
    userTurn.className = 'user-turn';
    modelOutput.append(userTurn);
    userInput.value = '';

    const result = await chat.sendMessageStream({
      message: message + additionalInstructions,
    });

    let text = '';
    let currentSlide: HTMLElement | null = null;
    let pendingText = '';

    for await (const chunk of result) {
      for (const candidate of chunk.candidates || []) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.text) {
            text += part.text;
            pendingText += part.text;
          } else {
            try {
              const data = part.inlineData;
              if (data) {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,` + data.data;
                
                // Show image immediately
                currentSlide = addImageSlide(img);
                
                // If we have pending text, update the caption
                if (pendingText.trim()) {
                  await updateSlideCaption(currentSlide, pendingText.trim());
                  pendingText = '';
                }
              } else {
                console.log('no data', chunk);
              }
            } catch (e) {
              console.log('no data', chunk);
            }
          }
        }
      }
    }
    
    // Handle any remaining text for the last slide
    if (currentSlide && pendingText.trim()) {
      await updateSlideCaption(currentSlide, pendingText.trim());
    }
    
  } catch (e) {
    const msg = parseError(String(e));
    error.innerHTML = `Something went wrong: ${msg}`;
    error.removeAttribute('hidden');
  }
  userInput.disabled = false;
  userInput.focus();
}

userInput.addEventListener('keydown', async (e: KeyboardEvent) => {
  if (e.code === 'Enter') {
    e.preventDefault();
    const message = userInput.value;
    await generate(message);
  }
});

const examples = document.querySelectorAll('#examples li');
examples.forEach((li) =>
  li.addEventListener('click', async () => {
    if (li.textContent) {
      await generate(li.textContent);
    }
  }),
);
