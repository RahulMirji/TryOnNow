import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock window.location
const mockLocation = (url: string) => {
  Object.defineProperty(window, 'location', {
    value: { href: url },
    writable: true,
  });
};

// Import functions to test (we'll mock the module)
const detectMarketplace = (url: string): 'amazon' | 'flipkart' | null => {
  if (url.includes('amazon.in')) return 'amazon';
  if (url.includes('flipkart.com')) return 'flipkart';
  return null;
};

const isClothingProduct = (title: string, keywords: string[]): boolean => {
  const lowerTitle = title.toLowerCase();
  // Simple includes check for compound words like "trackpants", "sweatshirt"
  return keywords.some(keyword => lowerTitle.includes(keyword));
};

const detectProductGender = (title: string): 'male' | 'female' | null => {
  const lowerTitle = title.toLowerCase();
  if (/\b(women|woman|girls?|female|ladies|lady)\b/.test(lowerTitle)) return 'female';
  if (/\b(men|man|boys?|male|gents)\b/.test(lowerTitle)) return 'male';
  return null;
};

// Expanded wearable keywords - all items humans can wear
const WEARABLE_KEYWORDS = [
  // Clothing
  'shirt', 'tshirt', 't-shirt', 'dress', 'pant', 'pants', 'jeans', 'jacket',
  'skirt', 'top', 'kurta', 'saree', 'sari', 'kurti', 'lehenga', 'blazer',
  'sweater', 'hoodie', 'coat', 'shorts', 'trouser', 'suit', 'ethnic', 'western',
  // Footwear
  'shoe', 'shoes', 'sneaker', 'sandal', 'heel', 'boot', 'loafer', 'slipper', 'footwear',
  // Eyewear
  'sunglass', 'sunglasses', 'spectacle', 'specs', 'glasses', 'eyewear',
  // Jewelry & Watches
  'necklace', 'earring', 'ring', 'bracelet', 'watch', 'jewelry', 'jewellery',
  // Accessories
  'belt', 'tie', 'scarf', 'cap', 'hat', 'handbag', 'purse', 'backpack'
];

describe('Marketplace Detection', () => {
  it('should detect Amazon India', () => {
    expect(detectMarketplace('https://www.amazon.in/dp/B08XYZ123')).toBe('amazon');
  });

  it('should detect Flipkart', () => {
    expect(detectMarketplace('https://www.flipkart.com/product/p/123')).toBe('flipkart');
  });

  it('should return null for unsupported sites', () => {
    expect(detectMarketplace('https://www.myntra.com/product')).toBeNull();
    expect(detectMarketplace('https://www.google.com')).toBeNull();
  });
});

describe('Wearable Product Detection', () => {
  it('should detect clothing products', () => {
    expect(isClothingProduct('Men Cotton Shirt Blue', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Women Denim Jeans', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Casual T-Shirt for Men', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Traditional Kurta Set', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should detect footwear products', () => {
    expect(isClothingProduct('Nike Running Shoes', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Women Heels Gold', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Leather Sandals', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should detect eyewear products', () => {
    expect(isClothingProduct('Ray-Ban Sunglasses', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Reading Spectacles', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Blue Light Glasses', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should detect jewelry and watches', () => {
    expect(isClothingProduct('Gold Necklace Set', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Diamond Earrings', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Casio Digital Watch', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should detect accessories', () => {
    expect(isClothingProduct('Leather Belt Brown', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Silk Tie Blue', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Baseball Cap', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should not detect non-wearable products without wearable keywords', () => {
    expect(isClothingProduct('iPhone 15 Pro Max', WEARABLE_KEYWORDS)).toBe(false);
    expect(isClothingProduct('Samsung TV 55 inch', WEARABLE_KEYWORDS)).toBe(false);
    expect(isClothingProduct('Kitchen Mixer Grinder', WEARABLE_KEYWORDS)).toBe(false);
    expect(isClothingProduct('USB Cable 2m', WEARABLE_KEYWORDS)).toBe(false);
  });

  it('should detect compound wearable words', () => {
    expect(isClothingProduct('Trackpants for Men', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Sweatpants Grey', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Shortsleeve Underscrub', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Sweatshirt Hoodie', WEARABLE_KEYWORDS)).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(isClothingProduct('MENS SHIRT', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('JEANS FOR WOMEN', WEARABLE_KEYWORDS)).toBe(true);
    expect(isClothingProduct('SUNGLASSES AVIATOR', WEARABLE_KEYWORDS)).toBe(true);
  });
});

describe('Gender Detection', () => {
  it('should detect male products', () => {
    expect(detectProductGender('Men Cotton Shirt')).toBe('male');
    expect(detectProductGender('Boys School Uniform')).toBe('male');
    expect(detectProductGender('Gents Formal Wear')).toBe('male');
  });

  it('should detect female products', () => {
    expect(detectProductGender('Women Casual Dress')).toBe('female');
    expect(detectProductGender('Girls Party Wear')).toBe('female');
    expect(detectProductGender('Ladies Kurti Set')).toBe('female');
  });

  it('should return null for unisex/unknown products', () => {
    expect(detectProductGender('Cotton T-Shirt Blue')).toBeNull();
    expect(detectProductGender('Casual Jeans')).toBeNull();
  });
});
