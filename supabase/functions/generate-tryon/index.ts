import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    const prompt = `Generate a photorealistic virtual try-on image. Take the person from the first image and show them wearing the clothing item from the second image. Keep the person's face, hair, body shape, pose, and background exactly as in the first image. Only replace their clothing with the garment from the second image. Make it look natural and realistic. The person's gender is ${gender}.`;

    // Using gemini-2.0-flash-preview-image-generation (has better free tier quota)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
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
