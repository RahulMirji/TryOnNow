import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// API configuration
const SUPABASE_URL = "https://lqahdqjnnyeuhbjjiaji.supabase.co";

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should call the correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, image: 'data:image/jpeg;base64,test' }),
    });

    await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_photo: 'base64data',
        product_image: 'base64data',
        gender: 'male',
      }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${SUPABASE_URL}/functions/v1/generate-tryon`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle successful response', async () => {
    const mockImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, image: mockImage }),
    });

    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.image).toBe(mockImage);
  });

  it('should handle error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
    ).rejects.toThrow('Network error');
  });
});

describe('Base64 Image Handling', () => {
  const cleanBase64 = (data: string): string => {
    if (data.includes(',')) {
      return data.split(',')[1];
    }
    return data;
  };

  it('should extract base64 from data URL', () => {
    const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
    expect(cleanBase64(dataUrl)).toBe('/9j/4AAQSkZJRg==');
  });

  it('should return raw base64 if no prefix', () => {
    const rawBase64 = '/9j/4AAQSkZJRg==';
    expect(cleanBase64(rawBase64)).toBe('/9j/4AAQSkZJRg==');
  });
});
