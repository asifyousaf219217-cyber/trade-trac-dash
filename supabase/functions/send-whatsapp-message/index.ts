import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Validate the JWT and get user claims
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims?.sub) {
      console.error('Auth error:', claimsError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    // Parse request body
    const { business_id, conversation_id, customer_phone, message_text } = await req.json()

    if (!business_id || !conversation_id || !customer_phone || !message_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', business_id)
      .eq('user_id', userId)
      .single()

    if (businessError || !business) {
      console.error('Business verification failed:', businessError)
      return new Response(
        JSON.stringify({ error: 'Forbidden - Business not found or not owned by user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the WhatsApp number for the business
    const { data: whatsappNumber } = await supabase
      .from('whatsapp_numbers')
      .select('display_phone_number')
      .eq('business_id', business_id)
      .single()

    const businessPhoneNumber = whatsappNumber?.display_phone_number || 'business'

    // Save message to Supabase
    const { error: insertError } = await supabase.from('messages').insert({
      business_id,
      conversation_id,
      from_number: businessPhoneNumber,
      to_number: customer_phone,
      message_text,
      direction: 'outbound',
      source: 'human',
    })

    if (insertError) {
      console.error('Failed to save message:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call n8n webhook to send via WhatsApp (server-side only)
    const webhookUrl = 'https://asifyousaf.app.n8n.cloud/webhook/agent-send-message'
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id,
          conversation_id,
          customer_phone,
          message_text,
          source: 'agent',
        }),
      })

      if (!response.ok) {
        console.warn('Webhook call failed, but message saved to DB')
      }
    } catch (webhookError) {
      console.warn('Webhook unreachable, but message saved to DB:', webhookError)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
