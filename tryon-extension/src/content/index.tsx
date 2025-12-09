import React from 'react';
import { createRoot } from 'react-dom/client';
import { TryOnModal } from './components/TryOnModal';
import { detectMarketplace, getProductImages, getProductTitle, isClothingProduct, getButtonInsertTarget } from './utils/marketplace';

// Clothing keywords for detection
const CLOTHING_KEYWORDS = [
  'shirt', 'tshirt', 't-shirt', 'dress', 'pant', 'pants', 'jeans', 'jacket',
  'skirt', 'top', 'kurta', 'saree', 'sari', 'kurti', 'lehenga', 'blazer',
  'sweater', 'hoodie', 'coat', 'shorts', 'trouser', 'suit', 'ethnic', 'western'
];

let modalRoot: ReturnType<typeof createRoot> | null = null;
let modalContainer: HTMLDivElement | null = null;

function injectTryOnButton() {
  const marketplace = detectMarketplace();
  if (!marketplace) return;

  const title = getProductTitle(marketplace);
  console.log('TryOnNow: Marketplace:', marketplace, 'Title:', title);
  
  // For Flipkart, be more lenient - if we can't detect title, still show button on product pages
  if (marketplace === 'flipkart') {
    // Check if this looks like a product page (has price, images, etc.)
    const hasPrice = document.querySelector('[class*="Nx9bqj"], [class*="_30jeq3"], [class*="CEmiEU"]');
    const hasImages = document.querySelector('img[src*="rukminim"]');
    
    if (!title && hasPrice && hasImages) {
      console.log('TryOnNow: Flipkart product page detected via price/images');
      // Continue without title check for Flipkart
    } else if (!title) {
      console.log('TryOnNow: No title found on Flipkart');
      return;
    } else if (!isClothingProduct(title, CLOTHING_KEYWORDS)) {
      console.log('TryOnNow: Not a clothing product, title:', title);
      return;
    }
  } else {
    // Amazon - strict check
    if (!title || !isClothingProduct(title, CLOTHING_KEYWORDS)) {
      console.log('TryOnNow: Not a clothing product');
      return;
    }
  }

  // Check if button already exists
  if (document.getElementById('tryon-now-btn')) return;

  const target = getButtonInsertTarget(marketplace);
  if (!target) {
    console.log('TryOnNow: Could not find button insert target');
    return;
  }

  // Create a wrapper div to ensure proper block-level stacking
  const wrapper = document.createElement('div');
  wrapper.id = 'tryon-now-wrapper';
  
  // Create the button
  const button = document.createElement('button');
  button.id = 'tryon-now-btn';
  
  // Apply marketplace-specific styling
  if (marketplace === 'flipkart') {
    wrapper.className = 'tryon-wrapper-flipkart';
    button.className = 'tryon-now-button tryon-now-button-flipkart';
  } else {
    wrapper.style.cssText = 'display: block; width: 100%; margin-top: 8px; margin-bottom: 8px; position: relative; z-index: 1;';
    button.className = 'tryon-now-button';
  }
  
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
    Virtual Try On
  `;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(marketplace);
  });
  
  wrapper.appendChild(button);
  target.element.insertAdjacentElement('afterend', wrapper);
  console.log('TryOnNow: Button injected successfully');
}

function openModal(marketplace: 'amazon' | 'flipkart') {
  const productImages = getProductImages(marketplace);
  const productTitle = getProductTitle(marketplace) || 'Product';

  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'tryon-modal-root';
    document.body.appendChild(modalContainer);
    modalRoot = createRoot(modalContainer);
  }

  modalRoot?.render(
    <TryOnModal
      isOpen={true}
      onClose={closeModal}
      productImages={productImages}
      productTitle={productTitle}
    />
  );
}

function closeModal() {
  modalRoot?.render(
    <TryOnModal
      isOpen={false}
      onClose={closeModal}
      productImages={[]}
      productTitle=""
    />
  );
}

// Run on page load and URL changes (for SPAs)
function init() {
  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(injectTryOnButton, 1000));
  } else {
    setTimeout(injectTryOnButton, 1000);
  }

  // Watch for URL changes (SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(injectTryOnButton, 1500);
    }
  }).observe(document, { subtree: true, childList: true });
}

init();
