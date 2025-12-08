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
    flipkart: ['.B_NuCI', '._35KyD6', '.yhB1nd'],
  };

  for (const selector of selectors[marketplace]) {
    const el = document.querySelector(selector);
    if (el?.textContent) return el.textContent.trim();
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
    // Main image
    const mainImg = document.querySelector('._396cs4 img, ._2r_T1I img') as HTMLImageElement;
    if (mainImg?.src) images.push(mainImg.src);
    
    // Thumbnail images
    const thumbs = document.querySelectorAll('._2mLllQ img, ._3GnUWp img');
    thumbs.forEach((img) => {
      const src = (img as HTMLImageElement).src;
      if (src && !images.includes(src)) {
        // Convert to higher resolution
        const fullSize = src.replace(/\d+\/\d+/, '832/832');
        images.push(fullSize);
      }
    });
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
    const selectors = ['._2KpZ6l._2U9uOA', '._3k-BhJ', '._2AkmmA'];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return { element: el, insertMethod: 'after' };
    }
  }
  
  return null;
}

export function isClothingProduct(title: string, keywords: string[]): boolean {
  const lowerTitle = title.toLowerCase();
  return keywords.some(keyword => lowerTitle.includes(keyword));
}

export function detectProductGender(title: string): 'male' | 'female' | null {
  const lowerTitle = title.toLowerCase();
  if (/\b(women|woman|girl|female|ladies|lady)\b/.test(lowerTitle)) return 'female';
  if (/\b(men|man|boy|male|gents)\b/.test(lowerTitle)) return 'male';
  return null;
}
