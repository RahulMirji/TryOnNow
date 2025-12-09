const SUPABASE_URL = "https://lqahdqjnnyeuhbjjiaji.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxYWhkcWpubnlldWhiamppYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTA0NDQsImV4cCI6MjA4MDc4NjQ0NH0.vFnZn90NpQkIInaKPIyPHeMFOwXRGFdx4HchtS_8Wzc";

export interface TryOnRequest {
  user_photo: string; // base64 data URL
  product_image: string; // base64 data URL
  gender: "male" | "female";
}

export interface TryOnResponse {
  success: boolean;
  image?: string;
  error?: string;
  details?: string;
}

export async function generateTryOn(request: TryOnRequest): Promise<TryOnResponse> {
  try {
    // Convert product image URL to base64 if it's a URL
    let productImageBase64 = request.product_image;
    if (request.product_image.startsWith("http")) {
      productImageBase64 = await imageUrlToBase64(request.product_image);
    }

    console.log("Calling Supabase Edge Function...");
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-tryon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        user_photo: request.user_photo,
        product_image: productImageBase64,
        gender: request.gender,
      }),
    });
    
    console.log("Response status:", response.status);

    const data = await response.json();
    
    console.log("API Response data:", {
      success: data.success,
      hasImage: !!data.image,
      imageLength: data.image?.length || 0,
      imagePrefix: data.image?.substring(0, 50) || 'none',
      error: data.error
    });

    if (!response.ok) {
      // Handle rate limit error specifically
      if (response.status === 429) {
        return { 
          success: false, 
          error: data.message || `Daily limit of ${data.current_count || 30} try-ons reached. Please try again tomorrow.`
        };
      }
      return { success: false, error: data.error || "Failed to generate try-on" };
    }

    // Validate the response has the expected structure
    if (data.success && data.image) {
      // Ensure the image is a valid data URL
      if (!data.image.startsWith('data:')) {
        console.error("Invalid image format - not a data URL");
        return { success: false, error: "Invalid image format received from server" };
      }
      return data;
    } else if (data.success && !data.image) {
      console.error("Success but no image in response");
      return { success: false, error: "No image was generated. Please try again." };
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: (error as Error).message };
  }
}

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image URL to base64:", error);
    throw error;
  }
}
