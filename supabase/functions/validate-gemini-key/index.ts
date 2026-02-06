import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ValidationRequest {
  api_key: string;
  business_id: string;
}

interface ValidationResponse {
  valid: boolean;
  error_type?: "unauthorized" | "invalid_key" | "rate_limited" | "quota_exceeded" | "model_not_allowed" | "network_error" | "unknown";
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ═══════════════════════════════════════════════════════════
    // SECURITY: Validate caller authentication
    // ═══════════════════════════════════════════════════════════
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "unauthorized",
        message: "Authentication required"
      } as ValidationResponse), { 
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAdmin.auth.getClaims(token);
    
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "unauthorized",
        message: "Invalid session"
      } as ValidationResponse), { 
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const userId = claimsData.claims.sub;

    const { api_key, business_id }: ValidationRequest = await req.json();
    
    if (!api_key || !business_id) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "invalid_key",
        message: "API key and business ID are required"
      } as ValidationResponse), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SECURITY: Verify caller owns this business_id
    // ═══════════════════════════════════════════════════════════
    const { data: business, error: bizError } = await supabaseAdmin
      .from("businesses")
      .select("id")
      .eq("id", business_id)
      .eq("user_id", userId)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "unauthorized",
        message: "You do not have access to this business"
      } as ValidationResponse), { 
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // Test the key with a minimal, cheap prompt
    // ═══════════════════════════════════════════════════════════
    const genAI = new GoogleGenerativeAI(api_key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Reply with only: OK");
    const text = result.response.text().trim();
    
    if (text) {
      return new Response(JSON.stringify({
        valid: true,
        message: "API key is valid and working"
      } as ValidationResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({
      valid: false,
      error_type: "unknown",
      message: "Unexpected response from Gemini"
    } as ValidationResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message?.toLowerCase() : "";
    
    if (errorMessage.includes("api key") || errorMessage.includes("invalid") || errorMessage.includes("401")) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "invalid_key",
        message: "Invalid API key. Please check and try again."
      } as ValidationResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (errorMessage.includes("429") || errorMessage.includes("rate") || errorMessage.includes("too many")) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "rate_limited",
        message: "Rate limited. Wait a moment and try again."
      } as ValidationResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (errorMessage.includes("quota") || errorMessage.includes("exceeded") || errorMessage.includes("billing")) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "quota_exceeded",
        message: "API quota exceeded. Check your Google AI billing."
      } as ValidationResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    if (errorMessage.includes("permission") || errorMessage.includes("access") || errorMessage.includes("model")) {
      return new Response(JSON.stringify({
        valid: false,
        error_type: "model_not_allowed",
        message: "Model access denied. Enable Gemini API in Google Cloud."
      } as ValidationResponse), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response(JSON.stringify({
      valid: false,
      error_type: "network_error",
      message: "Could not connect to Gemini. Check your network."
    } as ValidationResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
