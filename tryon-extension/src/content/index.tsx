import React from 'react';
import { createRoot } from 'react-dom/client';
import { TryOnModal } from './components/TryOnModal';
import { detectMarketplace, getProductImages, getProductTitle, isClothingProduct, getButtonInsertTarget } from './utils/marketplace';

// Exclusion keywords - products that should NOT show the try-on button
// IMPORTANT: Use specific terms to avoid false positives (e.g., "table" matches "comfortable")
const EXCLUSION_KEYWORDS = [
  'laptop', 'desktop', 'computer', 'smartphone', 'ipad', 'iphone', 'android',
  'television', 'smart tv', 'led tv', 'oled tv',
  'monitor', 'speaker', 'headphone', 'earphone', 'airpod', 'earbud',
  'camera', 'printer', 'keyboard', 'charger', 'cable', 'adapter', 'power bank',
  'refrigerator', 'fridge', 'washing machine', 'microwave', 'air conditioner',
  'dining table', 'coffee table', 'study table', 'office chair', 'sofa set', 'mattress', 'pillow', 'curtain',
  'motorcycle', 'scooter', 'bicycle',
  'textbook', 'notebook', 'diary', 'stationery',
  'toy', 'puzzle', 'lego', 'action figure',
  'cookware', 'utensil', 'water bottle', 'flask', 'tiffin',
  'power tool', 'drill machine', 'hammer', 'screwdriver',
  'wall paint', 'canvas',
  'pet food', 'dog food', 'cat food',
  'plant pot', 'flower pot', 'garden tool',
  'medicine', 'vitamin', 'supplement', 'tablet', 'capsule',
  'grocery', 'snack', 'beverage',
  'laptop stand', 'phone holder', 'tablet mount', 'wall mount'
];

// Wearable keywords for detection - all items humans can wear
const WEARABLE_KEYWORDS = [
  // Tops
  'shirt', 'tshirt', 't-shirt', 'top', 'blouse', 'tank', 'camisole', 'tunic', 'polo', 'henley',
  // Outerwear
  'jacket', 'blazer', 'coat', 'sweater', 'hoodie', 'cardigan', 'pullover', 'sweatshirt', 'vest', 'gilet', 'parka', 'windbreaker', 'bomber',
  // Bottoms
  'pant', 'pants', 'jeans', 'trouser', 'shorts', 'skirt', 'legging', 'jogger', 'chino', 'cargo', 'capri', 'culottes', 'palazzos',
  // Dresses & Full Body
  'dress', 'gown', 'jumpsuit', 'romper', 'playsuit', 'bodysuit', 'overalls', 'dungaree',
  // Ethnic Wear
  'kurta', 'kurti', 'saree', 'sari', 'lehenga', 'salwar', 'churidar', 'anarkali', 'sherwani', 'dhoti', 'lungi', 'pathani', 'nehru',
  // Suits & Formal
  'suit', 'tuxedo', 'waistcoat', 'formal',
  // Footwear
  'shoe', 'shoes', 'sneaker', 'sandal', 'heel', 'heels', 'boot', 'boots', 'loafer', 'slipper', 'flip-flop', 'moccasin', 'oxford', 'derby', 'brogue', 'pump', 'wedge', 'flat', 'espadrille', 'kolhapuri', 'jutti', 'mojari', 'footwear',
  // Eyewear
  'sunglass', 'sunglasses', 'spectacle', 'specs', 'glasses', 'eyeglass', 'eyewear', 'frame', 'aviator', 'wayfarer', 'goggles',
  // Jewelry
  'necklace', 'chain', 'pendant', 'earring', 'ring', 'bracelet', 'bangle', 'anklet', 'brooch', 'jewellery', 'jewelry', 'mangalsutra', 'choker', 'studs',
  // Watches
  'watch', 'watches', 'smartwatch', 'wristwatch',
  // Accessories
  'belt', 'tie', 'bow-tie', 'bowtie', 'scarf', 'stole', 'shawl', 'dupatta', 'muffler', 'glove', 'gloves', 'cap', 'hat', 'beanie', 'turban', 'headband', 'bandana',
  // Bags (wearable)
  'handbag', 'purse', 'clutch', 'sling bag', 'backpack', 'tote', 'crossbody', 'wallet',
  // Innerwear (if visible)
  'bra', 'lingerie', 'swimsuit', 'bikini', 'swimwear', 'beachwear',
  // Generic
  'ethnic', 'western', 'casual', 'formal', 'wear', 'apparel', 'clothing', 'outfit', 'fashion'
];

// Check if product is wearable (matches wearable keywords AND not in exclusion list)
function isWearableProduct(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  
  // First check exclusions - if any exclusion keyword is found, return false
  const excludedBy = EXCLUSION_KEYWORDS.find(keyword => lowerTitle.includes(keyword));
  if (excludedBy) {
    console.log('TryOnNow: Excluded by keyword:', excludedBy);
    return false;
  }
  
  // Then check if it matches any wearable keyword
  const matchedKeyword = WEARABLE_KEYWORDS.find(keyword => lowerTitle.includes(keyword));
  if (matchedKeyword) {
    console.log('TryOnNow: Matched wearable keyword:', matchedKeyword);
    return true;
  }
  
  console.log('TryOnNow: No wearable keyword matched');
  return false;
}

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
    } else if (!isWearableProduct(title)) {
      console.log('TryOnNow: Not a wearable product, title:', title);
      return;
    }
  } else {
    // Amazon - strict check
    if (!title || !isWearableProduct(title)) {
      console.log('TryOnNow: Not a wearable product');
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
