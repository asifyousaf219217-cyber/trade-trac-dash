import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const NEWSAPI_KEY = 'a6542220e1e74e548cd3c1b7bf0a9762';
const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint') || 'everything';
    const query = url.searchParams.get('q') || 'finance OR stock market';
    const pageSize = url.searchParams.get('pageSize') || '20';
    const category = url.searchParams.get('category');
    const country = url.searchParams.get('country') || 'us';

    let apiUrl = '';
    
    if (endpoint === 'top-headlines') {
      apiUrl = `${NEWSAPI_BASE_URL}/top-headlines?country=${country}&pageSize=${pageSize}&apiKey=${NEWSAPI_KEY}`;
      if (category) {
        apiUrl += `&category=${category}`;
      }
    } else {
      apiUrl = `${NEWSAPI_BASE_URL}/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&language=en&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
    }

    console.log('Fetching news from:', apiUrl.replace(NEWSAPI_KEY, 'HIDDEN'));

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('NewsAPI error:', data);
      throw new Error(data.message || 'Failed to fetch news');
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in news-proxy:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
