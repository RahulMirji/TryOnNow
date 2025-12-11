import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAILY_LIMIT = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_and_increment_rate_limit', { daily_limit: DAILY_LIMIT });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed", details: rateLimitError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rateLimit = rateLimitData?.[0];
    if (!rateLimit?.allowed) {
      console.log("Rate limit exceeded:", rateLimit);
      return new Response(
        JSON.stringify({ 
          error: "Daily limit reached", 
          message: `Maximum ${DAILY_LIMIT} try-ons per day. Please try again tomorrow.`,
          current_count: rateLimit?.current_count || DAILY_LIMIT,
          remaining: 0
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Rate limit: ${rateLimit.current_count}/${DAILY_LIMIT} used, ${rateLimit.remaining} remaining`);

    const { user_photo, product_image, gender } = await req.json();

    if (!user_photo || !product_image || !gender) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanBase64 = (data: string) => data.includes(",") ? data.split(",")[1] : data;
    const userPhotoBase64 = cleanBase64(user_photo);
    const productImageBase64 = cleanBase64(product_image);

    const prompt = `Generate a photorealistic virtual try-on image.

INSTRUCTIONS:
1. Take the person from the FIRST image (user photo) - preserve 100% of their identity:
   - Keep their exact face, facial features, skin tone, hair style, and hair color
   - Keep their exact body shape, pose, and posture
   - Keep the original background and lighting

2. Take the wearable item from the SECOND image (product) and apply it to the person:
   - If it's CLOTHING (shirt, pants, dress, etc.): Replace only the relevant clothing while keeping everything else
   - If it's EYEWEAR (sunglasses, glasses, specs): Add them to the person's face naturally
   - If it's JEWELRY (necklace, earrings, bracelet, ring): Add them in the appropriate position
   - If it's a WATCH: Add it to their wrist naturally
   - If it's FOOTWEAR (shoes, sandals): Show them wearing it on their feet
   - If it's ACCESSORIES (hat, cap, scarf, belt): Add them appropriately

3. CRITICAL RULES:
   - DO NOT change the person's face, expression, or identity in any way
   - DO NOT change their pose or body position
   - Make the wearable item look naturally worn/placed on the person
   - Maintain realistic lighting, shadows, and proportions
   - The result should look like a real photograph, not edited

The person's gender is ${gender}. Generate a single high-quality photorealistic image.`;

    // Using gemini-2.0-flash-preview-image-generation (has better free tier quota)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: userPhotoBase64 } },
              { inlineData: { mimeType: "image/jpeg", data: productImageBase64 } }
            ]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return new Response(JSON.stringify({ error: "Gemini API error", details: err }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    console.log("Gemini response received");
    
    let img = null;
    if (result.candidates?.[0]?.content?.parts) {
      for (const p of result.candidates[0].content.parts) {
        if (p.inlineData) {
          img = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
          break;
        }
      }
    }

    if (!img) {
      console.error("No image in response:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "No image generated", details: JSON.stringify(result) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, image: img }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
