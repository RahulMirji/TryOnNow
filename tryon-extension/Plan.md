<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# 1. Backend and API

1. Nothing is ready yet we need to do everything now tell me how to do this ( or if you want we can create a  Supabase Project and write edge function for this or we can include everything is the node js code in the extesion code?
2. We can use api
3. Supabase Edge functions?
4. Ok let's keep api key in the supabase secreates.
=======
5. From URL's you can suggest me or add what ever you want. Extract the url and try to figure it out.
6.Through the product title.
6. In the pop up let user select the image.
8.No this is just a hackathon project and I'm a student so this is just a proof of concept  So let's keep it for indian market places.
9.Right below the buy button.
10.Should be a modal overlay on the market place. Is this possible or we should go with side panel with chrome's built in UI.
7. Yep I need Download button and Try again. Yep keep the user uploade images a as preview there it self along with where the new images is being generated. So basically we need to show the uploaded images the image selected by the user from the market place and a space where the try on image is being created.
8. no thing happens just give a cross button. if the user dont want the pop he can close this but the pop up stays until use want's to close that.
9. Full body would be better and 10 MB max.
10. Yep we must check all these things.
11. i'm very sure all the images are of good quality.
12. Figure this our by you self to get the best output.
13. 30 sec. and show a dummy progess bar until images generates.
14. Show try again.
15. Yep we can d othis on for storing use image.
16. Yep we will limit a use to generate 5 images a day.
17. Don't store.
22.NO
23.No
18. I need all
19. For now it's only for Desktop Chrome only.
20. No
27.No for now just keep only one.
28.Manually select.
21. Show a message telling this is not an out fit please select an out fit. And ever ask him to choose the gender before upload if the image uploaded is not male then give a message. if the uplaoded image is male and the outfit is female you show show a message to change the outfit and select other.
30.no
22. Amazon and Flifkart is fine now.
23. Nope not for now.
24. This is a just a hackathon project so keep this very simple i just need a working prototype. So Don't streatch this long I want to develop this in 2 days. And tech stack is going to be tsx and js.
25. As early as possible i have only 2 days of time do all this. So just should be a working prototype.

Perfect! With all these answers, here's a **lean, 2-day hackathon PRD** focused on getting a working prototype fast:

***

# PRD: TryOnNow Chrome Extension (MVP)

**Timeline:** 2 days | **Scope:** Proof of concept for hackathon

***

## 1. Product Overview

**What:** Chrome extension that adds "Virtual Try On" buttons on Amazon India \& Flipkart product pages, lets users upload their photo and see AI-generated try-on images using Nano Banana Pro.

**Tech Stack:**

- Frontend: TSX + vanilla JS for content scripts
- Backend: Supabase Edge Functions (Deno/TypeScript)
- AI Model: Nano Banana Pro via Gemini API
- Storage: Chrome local storage (user photo cache only)

**Non-Goals (MVP):**

- No user accounts, history, or cloud storage
- No multi-marketplace support beyond Amazon IN + Flipkart
- No mobile or other browsers

***

## 2. User Flow (End-to-End)

1. **User browses** Amazon.in or Flipkart clothing product page
2. **Extension detects** product page → injects "Virtual Try On" button below "Buy Now"
3. **User clicks** "Virtual Try On" → modal opens
4. **Modal shows:**
    - Product images carousel (user selects which image to use)
    - Gender selector (Male/Female dropdown)
    - Photo upload area (with guidelines)
5. **User uploads** full-body photo (max 10MB)
6. **Extension validates:**
    - Is product a clothing item? (Check title for keywords)
    - Is uploaded image a person?
    - Does gender match product category?
7. **User clicks** "Generate Try-On" button
8. **Processing:** 30s with animated progress bar
9. **Result displayed** in modal:
    - 3-column layout: User Photo | Product Image | Try-On Result
    - Buttons: "Download", "Try Again", "X Close"
10. **User can:** Download image, regenerate with new photo, or close modal

***

## 3. Technical Architecture

### 3.1 Chrome Extension Structure

```
tryon-extension/
├── manifest.json          # V3 manifest
├── content-scripts/
│   ├── inject-button.ts   # Detects pages, injects button
│   ├── modal.tsx          # Try-on modal component
│   └── styles.css         # Modal styling
├── background/
│   └── service-worker.ts  # Handles API calls, usage limits
├── popup/
│   └── popup.tsx          # Extension popup (settings/info)
└── utils/
    ├── marketplace-selectors.ts  # DOM selectors per site
    ├── validators.ts             # Image/product validation
    └── api-client.ts             # Supabase Edge Function client
```

**Manifest permissions:**

```json
{
  "manifest_version": 3,
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": [
    "https://www.amazon.in/*",
    "https://www.flipkart.com/*"
  ],
  "content_scripts": [{
    "matches": [
      "https://www.amazon.in/*/dp/*",
      "https://www.flipkart.com/*/p/*"
    ],
    "js": ["content-scripts/inject-button.js"]
  }]
}
```


***

### 3.2 Supabase Backend Setup

**Project Structure:**

```
supabase/
└── functions/
    └── generate-tryon/
        ├── index.ts       # Edge function handler
        └── _shared/
            ├── nano-banana.ts   # Nano Banana API client
            └── validators.ts    # Server-side validation
```

**Edge Function Logic (`index.ts`):**

```typescript
// Deno edge function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // 1. Parse multipart form (user_photo, product_image, gender)
  // 2. Validate images (size, format, contains person)
  // 3. Call Nano Banana Pro API with prompt
  // 4. Return generated image as base64 or temp URL
  // 5. Don't store anything - process in-memory only
})
```

**Supabase Secrets (set in dashboard):**

- `GEMINI_API_KEY` (for Nano Banana Pro)

***

## 4. Feature Requirements (Day-by-Day Breakdown)

### Day 1: Core Extension + Detection

**Morning (4 hours):**

- ✅ Set up Chrome extension boilerplate (manifest, folders)
- ✅ Write marketplace detection logic:
    - Amazon: URL pattern `*/dp/*`, button selector `.a-button-stack`
    - Flipkart: URL pattern `*/p/*`, button selector `._2KpZ6l`
- ✅ Inject "Virtual Try On" button with icon
- ✅ Product image extraction:
    - Amazon: `#landingImage` or `.imgTagWrapper img`
    - Flipkart: `._396cs4` or `._2r_T1I img`
    - Extract all gallery images into array

**Afternoon (4 hours):**

- ✅ Build modal component (TSX):
    - Image carousel (user picks product image)
    - Gender dropdown
    - File uploader with preview
    - "Generate" button
    - 3-column result layout
- ✅ Client-side validation:
    - File size ≤ 10MB
    - File type: JPG/PNG
    - Product title contains clothing keywords:
`["shirt", "tshirt", "dress", "pant", "jeans", "jacket", "skirt", "top", "kurta", "saree"]`

***

### Day 2: Backend + AI Integration

**Morning (4 hours):**

- ✅ Set up Supabase project
- ✅ Create Edge Function `generate-tryon`:

```typescript
// Pseudo-code
POST /generate-tryon
Body: { user_photo: base64, product_image: base64, gender: "male" }

1. Decode images
2. Validate with simple checks (not empty, reasonable size)
3. Build Nano Banana Pro prompt:
   "A {gender} person wearing this exact clothing item from the product image. 
    Maintain the person's face, body shape, pose, and background from the user photo. 
    Only replace the clothing with the product garment, preserving realistic fit and lighting."
4. Call Gemini API: 
   - Model: "gemini-3.0-pro" or image generation endpoint
   - Include both images as input
   - Return generated image
5. Send back: { image_base64, success: true }
```


**Afternoon (4 hours):**

- ✅ Connect extension to Edge Function:
    - Service worker handles API calls
    - Show progress bar during 30s wait
    - Handle errors with "Try Again" message
- ✅ Usage limit (5/day):
    - Store count in `chrome.storage.local` with timestamp
    - Reset daily
    - Show "Limit Reached" if exceeded
- ✅ Download button implementation (canvas → blob → download)
- ✅ Gender validation:
    - If product title has "women/female/girl" and user selects "male" → warn
    - Vice versa for men's products
- ✅ Cache user photo in `chrome.storage.local` for reuse

***

## 5. Detailed Component Specs

### 5.1 Inject Button (Content Script)

**Detection logic:**

```typescript
// marketplace-selectors.ts
export const MARKETPLACES = {
  amazon: {
    urlPattern: /amazon\.in\/.*\/dp\//,
    buttonInsertSelector: '#buybox', // Insert after this
    imageSelector: '#landingImage',
    titleSelector: '#productTitle',
    keywords: ['shirt', 'dress', 'jeans', 'tshirt', ...]
  },
  flipkart: {
    urlPattern: /flipkart\.com\/.*\/p\//,
    buttonInsertSelector: '._2KpZ6l',
    imageSelector: '._396cs4 img',
    titleSelector: '.B_NuCI',
    keywords: [...]
  }
}
```

**Button HTML:**

```html
<button id="tryon-btn" class="tryon-button">
  <svg><!-- Hanger icon --></svg>
  Virtual Try On
</button>
```


***

### 5.2 Modal Component (TSX)

**Layout structure:**

```
┌────────────────────────────────────────────────────┐
│  [X Close]                                         │
│                                                    │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐ │
│  │          │  │           │  │                │ │
│  │  User    │  │  Product  │  │   Try-On       │ │
│  │  Photo   │  │  Image    │  │   Result       │ │
│  │(preview) │  │(selected) │  │ [Loading...]   │ │
│  │          │  │           │  │                │ │
│  └──────────┘  └───────────┘  └────────────────┘ │
│                                                    │
│  Gender: [▼ Select]    [📷 Upload Photo]         │
│                                                    │
│  [  Generate Try-On  ]  [ Download ]  [ Try Again ]│
└────────────────────────────────────────────────────┘
```

**State management:**

- `selectedProductImage: string | null`
- `userPhoto: File | null`
- `gender: 'male' | 'female' | null`
- `tryonResult: string | null` (base64)
- `isProcessing: boolean`
- `error: string | null`

***

### 5.3 Validation Rules

**Client-side (before API call):**

1. Product title must contain clothing keywords → else show: "This doesn't appear to be clothing. Please use on apparel products."
2. User photo must be selected → else disable "Generate" button
3. Gender must be selected → else disable "Generate" button
4. File size ≤ 10MB → else show: "Image too large. Please use a photo under 10MB."
5. Daily limit check (5 uses) → else show: "Daily limit reached (5 try-ons). Come back tomorrow!"

**Server-side (Edge Function):**

1. Images decode successfully
2. Images are valid formats
3. Basic dimension check (both images > 200px on short side)

**Gender-Product match (client-side):**

```typescript
const productTitle = getProductTitle().toLowerCase();
const isMensProduct = /men|boy|male/.test(productTitle);
const isWomensProduct = /women|girl|female|ladies/.test(productTitle);

if (gender === 'male' && isWomensProduct) {
  showWarning("This appears to be women's clothing. Result may not look realistic.");
}
// Vice versa for women + men's products
```


***

## 6. Nano Banana Pro Integration

### 6.1 API Call Structure

**Endpoint (hypothetical based on Gemini API):**

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateImage
```

**Request body:**

```json
{
  "prompt": "A {gender} person wearing this exact clothing item. The person should maintain their original face, hair, body shape, and background from the reference photo. Only replace their clothing with the garment from the product image. Photorealistic, natural lighting, proper fit.",
  "images": [
    {
      "role": "person_base",
      "data": "<user_photo_base64>"
    },
    {
      "role": "garment_reference", 
      "data": "<product_image_base64>"
    }
  ],
  "config": {
    "outputSize": "1024x1024",
    "quality": "high"
  }
}
```

**Response:**

```json
{
  "image": "<generated_image_base64>",
  "inferenceTime": 8500
}
```

**Error handling:**

- Timeout (>30s): "Generation took too long. Please try again."
- API error: "Something went wrong. Please try a different photo."
- Invalid result: "Try-on failed. Ensure your photo shows your full body clearly."

***

## 7. Chrome Storage Schema

```typescript
// Stored in chrome.storage.local
interface LocalStorage {
  cachedUserPhoto: string | null;  // base64, for reuse
  usageCount: number;               // daily try-on count
  usageResetDate: string;           // ISO date string
  lastGender: 'male' | 'female';    // remember selection
}
```

**Usage limit logic:**

```typescript
async function checkUsageLimit(): Promise<boolean> {
  const { usageCount, usageResetDate } = await chrome.storage.local.get();
  const today = new Date().toDateString();
  
  if (usageResetDate !== today) {
    // New day, reset
    await chrome.storage.local.set({ usageCount: 0, usageResetDate: today });
    return true;
  }
  
  return usageCount < 5;
}
```


***

## 8. Error Messages \& Edge Cases

| Scenario | Message |
| :-- | :-- |
| Non-clothing product | "⚠️ This doesn't appear to be clothing. Please use Virtual Try-On on apparel products." |
| No photo uploaded | (Disable button, gray out) |
| File too large | "📁 Image is too large. Max 10MB." |
| Daily limit exceeded | "🚫 You've reached today's limit (5 try-ons). Reset in: HH:MM" |
| Gender mismatch | "⚡ Heads up: This is {gender} clothing. Try-on may not look realistic." |
| API timeout | "⏱️ Generation took too long. Try again or use a different photo." |
| API failure | "❌ Oops! Something went wrong. Please try again." |
| Invalid image (no person detected) | "👤 We couldn't detect a person in your photo. Use a clear, full-body photo." |


***

## 9. MVP Checklist (2-Day Sprint)

### Must-Have (Core functionality)

- ✅ Button injection on Amazon IN + Flipkart
- ✅ Modal with image selection + upload
- ✅ Supabase Edge Function
- ✅ Nano Banana Pro integration
- ✅ Try-on result display
- ✅ Download button
- ✅ 5/day usage limit
- ✅ Basic validation (file size, clothing keywords)
- ✅ Gender selector + mismatch warning


### Nice-to-Have (If time permits)

- ⭕ "Try Again" clears and resets form
- ⭕ Cached photo reuse
- ⭕ Better loading animation
- ⭕ Simple error logging to console


### Out of Scope (Post-hackathon)

- ❌ More marketplaces
- ❌ User accounts / history
- ❌ Body type analysis
- ❌ Share to social media

***

## 10. Testing Plan (Quick \& Dirty)

**Manual testing scenarios:**

1. Install extension → visit Amazon product → button appears
2. Click button → modal opens with product images
3. Upload photo → validate warnings work
4. Generate try-on → see result in 30s
5. Download → file saves correctly
6. Try 5 times → 6th shows limit message
7. Next day → limit resets

**Edge cases to test:**

- Non-clothing product (electronics) → button doesn't appear or shows warning
- Very large image (>10MB) → rejected
- Men's shirt + female gender → warning shown
- API timeout → error message displays

***

## 11. Deployment

**Supabase:**

1. Deploy Edge Function: `supabase functions deploy generate-tryon`
2. Set secret: `supabase secrets set GEMINI_API_KEY=your_key`
3. Note function URL: `https://<project>.supabase.co/functions/v1/generate-tryon`

**Chrome Extension:**

1. Build TSX: `npm run build` (outputs to `/dist`)
2. Load unpacked in Chrome: `chrome://extensions` → Developer mode → Load unpacked → select `/dist`
3. Test on Amazon/Flipkart
4. (Post-hackathon) Publish to Chrome Web Store

***

## 12. Supabase Edge Function Code Template

```typescript
// supabase/functions/generate-tryon/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { user_photo, product_image, gender } = await req.json();
    
    // Validate inputs
    if (!user_photo || !product_image || !gender) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Call Nano Banana Pro (Gemini API)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const prompt = `A ${gender} person wearing this exact clothing item. Maintain face, body, background from base photo. Only replace clothing with product garment. Photorealistic.`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateImage?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          images: [
            { role: 'person_base', data: user_photo },
            { role: 'garment_reference', data: product_image }
          ]
        })
      }
    );

    const result = await response.json();
    
    return new Response(
      JSON.stringify({ image_base64: result.image, success: true }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});
```


***

This PRD is laser-focused on getting a **working demo in 2 days**. Start with Day 1 tasks (extension shell + modal), then Day 2 (backend + AI). Good luck with your hackathon! 🚀

