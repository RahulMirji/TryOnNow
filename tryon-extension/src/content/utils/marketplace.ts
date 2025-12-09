export type Marketplace = 'amazon' | 'flipkart';

export function detectMarketplace(): Marketplace | null {
  const url = window.location.href;
  if (url.includes('amazon.in')) return 'amazon';
  if (url.includes('flipkart.com')) return 'flipkart';
  return null;
}

export function getProductTitle(marketplace: Marketplace): string | null {
  const selectors: Record<Marketplace, string[]> = {
    amazon: ['#productTitle', '#title', '.product-title-word-break'],
    flipkart: [
      '.LMizgS', // New 2024 selector - product title span
      'span.LMizgS', // Explicit span with class
      '.B_NuCI', // Old selector
      '._35KyD6', // Old selector
      '.yhB1nd', // Old selector
      'h1.yhB1nd span', // New: title in span
      'h1[class*="VU-ZEz"]', // New: dynamic class pattern
      '.VU-ZEz', // New selector 2024
      'h1 span.VU-ZEz', // Nested span
      '[class*="product-title"]', // Generic fallback
      'h1.B_NuCI', // H1 with old class
    ],
  };

  for (const selector of selectors[marketplace]) {
    const el = document.querySelector(selector);
    if (el?.textContent) return el.textContent.trim();
  }
  
  // Flipkart fallback: try to find any h1 in the product area
  if (marketplace === 'flipkart') {
    const h1 = document.querySelector('h1');
    if (h1?.textContent) return h1.textContent.trim();
    
    // Try breadcrumb last item as product name
    const breadcrumbs = document.querySelectorAll('a[class*="breadcrumb"], ._2whKao');
    if (breadcrumbs.length > 0) {
      const last = breadcrumbs[breadcrumbs.length - 1];
      if (last?.textContent) return last.textContent.trim();
    }
  }
  
  return null;
}

export function getProductImages(marketplace: Marketplace): string[] {
  const images: string[] = [];
  
  if (marketplace === 'amazon') {
    // Try main image first
    const mainImg = document.querySelector('#landingImage') as HTMLImageElement;
    if (mainImg?.src) images.push(mainImg.src);
    
    // Get thumbnail images
    const thumbs = document.querySelectorAll('#altImages img, .imageThumbnail img');
    thumbs.forEach((img) => {
      const src = (img as HTMLImageElement).src;
      if (src && !src.includes('sprite') && !images.includes(src)) {
        // Convert thumbnail to full size
        const fullSize = src.replace(/\._.*_\./, '._AC_SL1500_.');
        images.push(fullSize);
      }
    });
  } else if (marketplace === 'flipkart') {
    // Main image - try multiple selectors
    const mainImgSelectors = [
      '._396cs4 img',
      '._2r_T1I img', 
      '.CXW8mj img', // New 2024 selector
      '._1YokD2 img', // Another variant
      'div[class*="CXW8mj"] img',
      'div[class*="_3kidJX"] img',
    ];
    
    for (const selector of mainImgSelectors) {
      const mainImg = document.querySelector(selector) as HTMLImageElement;
      if (mainImg?.src) {
        images.push(mainImg.src);
        break;
      }
    }
    
    // Thumbnail images - try multiple selectors
    const thumbSelectors = [
      '._2mLllQ img',
      '._3GnUWp img',
      '._1YokD2._3Rrcbo img', // New thumbnail selector
      'div[class*="_3GnUWp"] img',
      'div[class*="q6DClP"] img', // 2024 thumbnails
      'ul[class*="_3GnUWp"] img',
    ];
    
    for (const selector of thumbSelectors) {
      const thumbs = document.querySelectorAll(selector);
      thumbs.forEach((img) => {
        const src = (img as HTMLImageElement).src;
        if (src && !images.includes(src)) {
          // Convert to higher resolution
          const fullSize = src.replace(/\d+\/\d+/, '832/832');
          images.push(fullSize);
        }
      });
    }
    
    // Fallback: get all images in the image gallery area
    if (images.length === 0) {
      const galleryImgs = document.querySelectorAll('img[src*="rukminim"]');
      galleryImgs.forEach((img) => {
        const src = (img as HTMLImageElement).src;
        if (src && !images.includes(src) && !src.includes('icon') && !src.includes('logo')) {
          const fullSize = src.replace(/\d+\/\d+/, '832/832');
          images.push(fullSize);
        }
      });
    }
  }

  // Remove duplicates and limit to 10
  return [...new Set(images)].slice(0, 10);
}

export function getButtonInsertTarget(marketplace: Marketplace): { element: Element; insertMethod: 'after' | 'append' } | null {
  if (marketplace === 'amazon') {
    // Try to find the buy-now button's parent container for proper stacking
    const buyNowBtn = document.querySelector('#buy-now-button');
    if (buyNowBtn) {
      // Find the parent span/div that wraps the button
      const wrapper = buyNowBtn.closest('.a-button') || buyNowBtn.parentElement;
      if (wrapper) return { element: wrapper, insertMethod: 'after' };
    }
    
    const addToCartBtn = document.querySelector('#add-to-cart-button');
    if (addToCartBtn) {
      const wrapper = addToCartBtn.closest('.a-button') || addToCartBtn.parentElement;
      if (wrapper) return { element: wrapper, insertMethod: 'after' };
    }
    
    // Fallback to button stack container
    const buttonStack = document.querySelector('#addToCart, #buybox-see-all-buying-choices');
    if (buttonStack) return { element: buttonStack, insertMethod: 'after' };
  }
  
  if (marketplace === 'flipkart') {
    // Find the container that holds both Add to Cart and Buy Now buttons
    // This way our button will span full width below both
    const buttonRowSelectors = [
      'div[class*="hJinjk"]', // New 2024 button row container
      'div[class*="_3dsJAO"]', // Button container
      'div[class*="hwN1Ld"]', // Another button container variant
    ];
    
    for (const selector of buttonRowSelectors) {
      const container = document.querySelector(selector);
      if (container) {
        return { element: container, insertMethod: 'after' };
      }
    }
    
    // Fallback: find Buy Now button and get its parent row
    const allButtons = document.querySelectorAll('button');
    for (const btn of allButtons) {
      if (btn.textContent?.toUpperCase().includes('BUY NOW')) {
        // Go up to find the row container (parent of parent usually)
        const parent = btn.parentElement?.parentElement || btn.parentElement;
        if (parent) return { element: parent, insertMethod: 'after' };
      }
    }
    
    // Last fallback: find Add to Cart button
    for (const btn of allButtons) {
      if (btn.textContent?.toUpperCase().includes('ADD TO CART')) {
        const parent = btn.parentElement?.parentElement || btn.parentElement;
        if (parent) return { element: parent, insertMethod: 'after' };
      }
    }
  }
  
  return null;
}

export function isClothingProduct(title: string, keywords: string[]): boolean {
  const lowerTitle = title.toLowerCase();
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
    return regex.test(lowerTitle);
  });
}

export function detectProductGender(title: string): 'male' | 'female' | null {
  const lowerTitle = title.toLowerCase();
  if (/\b(women|woman|girls?|female|ladies|lady)\b/.test(lowerTitle)) return 'female';
  if (/\b(men|man|boys?|male|gents)\b/.test(lowerTitle)) return 'male';
  return null;
}
