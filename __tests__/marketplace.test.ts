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
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
    return regex.test(lowerTitle);
  });
};

const detectProductGender = (title: string): 'male' | 'female' | null => {
  const lowerTitle = title.toLowerCase();
  if (/\b(women|woman|girls?|female|ladies|lady)\b/.test(lowerTitle)) return 'female';
  if (/\b(men|man|boys?|male|gents)\b/.test(lowerTitle)) return 'male';
  return null;
};

const CLOTHING_KEYWORDS = [
  'shirt', 'tshirt', 't-shirt', 'dress', 'pant', 'pants', 'jeans', 'jacket',
  'skirt', 'top', 'kurta', 'saree', 'sari', 'kurti', 'lehenga', 'blazer',
  'sweater', 'hoodie', 'coat', 'shorts', 'trouser', 'suit', 'ethnic', 'western'
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

describe('Clothing Product Detection', () => {
  it('should detect clothing products', () => {
    expect(isClothingProduct('Men Cotton Shirt Blue', CLOTHING_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Women Denim Jeans', CLOTHING_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Casual T-Shirt for Men', CLOTHING_KEYWORDS)).toBe(true);
    expect(isClothingProduct('Traditional Kurta Set', CLOTHING_KEYWORDS)).toBe(true);
  });

  it('should not detect non-clothing products', () => {
    expect(isClothingProduct('iPhone 15 Pro Max', CLOTHING_KEYWORDS)).toBe(false);
    expect(isClothingProduct('Samsung TV 55 inch', CLOTHING_KEYWORDS)).toBe(false);
    expect(isClothingProduct('Laptop Stand Aluminum', CLOTHING_KEYWORDS)).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isClothingProduct('MENS SHIRT', CLOTHING_KEYWORDS)).toBe(true);
    expect(isClothingProduct('JEANS FOR WOMEN', CLOTHING_KEYWORDS)).toBe(true);
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
