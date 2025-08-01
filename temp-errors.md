 load the page-flip.browser.js in the HTML document.

<script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.min.js"></script>
3. Add pages to the flipbook. The data-density is used to specify the book type: ‘hard’ or ‘soft’.

<div class="flip-book" id="example">
  <div class="page page-cover page-cover-top" data-density="hard">
    <div class="page-content">
      <h2>BOOK TITLE</h2>
    </div>
  </div>
  <div class="page">
    <div class="page-content">
      <h2 class="page-header">Page Header 1</h2>
      <div class="page-image" style="background-image: url(1.jpg)"></div>
      <div class="page-text">Page Content 1</div>
      <div class="page-footer">2</div>
    </div>
  </div>
  <div class="page">
    <div class="page-content">
      <h2 class="page-header">Page Header 2</h2>
      <div class="page-image" style="background-image: url(2.jpg)"></div>
      <div class="page-text">Page Content 2</div>
      <div class="page-footer">3</div>
    </div>
  </div>
  ... more pages here ...
  <div class="page page-cover page-cover-bottom" data-density="hard">
    <div class="page-content">
      <h2>THE END</h2>
    </div>
  </div>
</div>
4. Initialize the library and pass options as follows:

// ES Module
const pageFlip = new PageFlip(
      document.getElementById("example"),
        {
          // options here
        }
);
// Browser
const pageFlip = new St.PageFlip(
      document.getElementById("example"),
        {
          // options here
        }
);
5. Load pages from HTML.

pageFlip.loadFromHTML(document.querySelectorAll(".page"));
6. Or load pages from images if running on the Canvas mode:

pageFlip.loadFromImages(['1.jpg', '2.jpg' ... ]);
7. Available options to config the StPageFlip instance.

// ES Module
const pageFlip = new PageFlip(
      document.getElementById("example"),
        {
          // start page index
          startPage: 0,
          size: SizeType.FIXED,
          // width & height *(REQUIRED)
          width: 0,
          height: 0,
          // min/max width & height
          minWidth: 0,
          maxWidth: 0,
          minHeight: 0,
          maxHeight: 0,
          // draw book shadows
          drawShadow: true,
          // animation speed
          flippingTime: 1000,
          // allows to switch to portrait mode
          usePortrait: true,
          // z-index property
          startZIndex: 0,
          // auto resizes the parent container to fit the book
          autoSize: true,
          // max opacity of shadow
          maxShadowOpacity: 1,
          // shows book cover
          showCover: false,
          // supports mobile scroll?
          mobileScrollSupport: true
        }
);
8. API methods.

// get total number of pages
pageFlip.getPageCount();
// get the current page index
pageFlip.getCurrentPageIndex();
// turn to a specific page
pageFlip.turnToPage(pageNum: number);
// turn to the next page
pageFlip.turnToNextPage();
// turn to the previous page
pageFlip.turnToPrevPage();
// turn to the next page with animation
pageFlip.flipNext(corner: 'top' | 'bottom');
// turn to the previous page with animation
pageFlip.flipPrev(corner: 'top' | 'bottom');
// turn to a specific page with animation
pageFlip.flip(pageNum: number, corner: 'top' | 'bottom');
// update pages
pageFlip.updateFromHtml(items: NodeListOf | HTMLElement[]);
pageFlip.updateFromImages(images: ['path-to-image1.jpg', ...]);
// destroy the instance
pageFlip.destroy();
9. Event handlers.

// triggered by page turning
pageFlip.on("flip", (e) => {
  document.querySelector(".page-current").innerText = e.data + 1;
});
// triggered when the state of the book changes
pageFlip.on("changeState", (e) => {
  // ("user_fold", "fold_corner", "flipping", "read")
});
// triggered when page orientation changes
pageFlip.on("changeOrientation", (e) => {
  // ("portrait", "landscape")
});
// triggered when the book is init and the start page is loaded
pageFlip.on("init", (e) => {
  ({page: number, mode: 'portrait', 'landscape'})
});
// triggered when the book pages are updated
pageFlip.on("update", (e) => {
  // ({page: number, mode: 'portrait', 'landscape'})
});