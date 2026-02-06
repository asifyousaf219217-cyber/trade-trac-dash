import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { business_id, type, user_input, context } = await req.json();

    // Validate required fields
    if (!business_id || !type || !user_input) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch AI config from bot_configs (API key is fetched HERE, not from n8n)
    const { data: botConfig, error: configError } = await supabaseAdmin
      .from("bot_configs")
      .select("ai_enabled, ai_features, ai_api_key_encrypted")
      .eq("business_id", business_id)
      .single();

    if (configError || !botConfig) {
      console.error("Config fetch error:", configError);
      return new Response(
        JSON.stringify({ fallback: true, reason: "Config not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if AI is enabled
    if (!botConfig.ai_enabled) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "AI disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if API key exists
    if (!botConfig.ai_api_key_encrypted) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "No API key configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check feature toggle
    const features = botConfig.ai_features || {};
    if (type === "faq" && !features.faq_answers) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "FAQ feature disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (type === "datetime" && !features.datetime_assist) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "DateTime feature disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (type === "intent" && !features.intent_detection) {
      return new Response(
        JSON.stringify({ fallback: true, reason: "Intent feature disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Gemini with the API key from database
    const genAI = new GoogleGenerativeAI(botConfig.ai_api_key_encrypted);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = "";
    
    if (type === "faq") {
      const staticReplies = context?.static_replies || [];
      const faqContext = staticReplies
        .map((r: any) => `Q: ${(r.keywords || []).join(", ")}\nA: ${r.reply}`)
        .join("\n\n");
      
      prompt = `You are a helpful business assistant. Based on the FAQ context below, answer the user's question.
If you cannot confidently answer based on the context, respond with exactly: {"answered": false}

FAQ Context:
${faqContext}

User Question: ${user_input}

Respond in JSON format: {"answered": true, "response": "your helpful answer here"}
Keep responses brief, professional, and friendly. Add "Type 'menu' for more options." at the end.`;
    } else if (type === "datetime") {
      prompt = `Parse this user input into a date/time format.
User input: "${user_input}"

If it's a valid date/time expression (like "tomorrow 3pm", "next week", "Feb 15 at 2pm", etc.), respond:
{"valid": true, "datetime": "the parsed readable format"}

If it's NOT a recognizable date/time, respond:
{"valid": false}

Only respond with the JSON, nothing else.`;
    } else if (type === "intent") {
      prompt = `Classify the user's intent from this message: "${user_input}"

Possible intents: booking, faq, cancel, human, greeting, unknown

Respond in JSON: {"intent": "detected_intent", "confidence": 0.0-1.0}`;
    }

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Try to parse as JSON
      let parsed;
      try {
        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch {
        // If not JSON, return as-is for FAQ
        if (type === "faq") {
          parsed = { answered: true, response: responseText };
        } else {
          return new Response(
            JSON.stringify({ fallback: true, reason: "Invalid AI response" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ result: parsed }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (aiError: any) {
      console.error("Gemini API error:", aiError);
      
      // Check for authentication or quota errors
      const errorMessage = aiError?.message?.toLowerCase() || "";
      const shouldDisable = 
        errorMessage.includes("api key") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("exceeded") ||
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("403") ||
        errorMessage.includes("401");

      if (shouldDisable) {
        // AUTO-DISABLE: Set ai_enabled = false for this business
        console.log(`🚨 Auto-disabling AI for business ${business_id}: ${errorMessage}`);
        
        await supabaseAdmin
          .from("bot_configs")
          .update({ ai_enabled: false })
          .eq("business_id", business_id);

        return new Response(
          JSON.stringify({ 
            fallback: true, 
            disable_ai: true, 
            reason: "API key invalid or quota exceeded - AI has been disabled" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Regular error - just fallback
      return new Response(
        JSON.stringify({ fallback: true, reason: "AI processing error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ fallback: true, reason: "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
