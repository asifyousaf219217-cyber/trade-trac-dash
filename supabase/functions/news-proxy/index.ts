// ============================================
// NEWS PROXY EDGE FUNCTION
// This proxies requests to NewsAPI to avoid CORS issues
// The API key is stored here securely on the server
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// NewsAPI configuration
const NEWSAPI_KEY = 'a6542220e1e74e548cd3c1b7bf0a9762';
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

// CORS headers to allow browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle preflight OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get URL parameters from the request
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'everything';
    const query = url.searchParams.get('q') || 'finance OR stock market';
    const pageSize = url.searchParams.get('pageSize') || '20';
    const category = url.searchParams.get('category');
    const country = url.searchParams.get('country') || 'us';

    let apiUrl = '';
    
    // Build the NewsAPI URL based on endpoint type
    if (endpoint === 'top-headlines') {
      // For top headlines, use country and optional category
      apiUrl = `${NEWSAPI_BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
      if (category) {
        apiUrl += `&category=${category}`;
      }
    } else {
      // For everything endpoint, use search query
      apiUrl = `${NEWSAPI_BASE_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
    }

    console.log('Fetching news from:', apiUrl.replace(NEWSAPI_KEY, 'HIDDEN'));

    // Make request to NewsAPI
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check for errors from NewsAPI
    if (!response.ok) {
      console.error('NewsAPI error:', data);
      throw new Error(data.message || 'Failed to fetch news');
    }

    console.log('Successfully fetched news, articles count:', data.articles?.length || 0);

    // Return the news data
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    // Handle any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in news-proxy:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
