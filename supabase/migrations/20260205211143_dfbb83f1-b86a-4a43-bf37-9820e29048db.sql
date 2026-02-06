-- Add AI columns to bot_configs if they don't exist
ALTER TABLE bot_configs 
ADD COLUMN IF NOT EXISTS ai_features JSONB DEFAULT '{
  "intent_detection": false,
  "datetime_assist": true,
  "faq_answers": false
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN bot_configs.ai_enabled IS 'Whether AI features are enabled for this business';
COMMENT ON COLUMN bot_configs.ai_api_key_encrypted IS 'Encrypted Gemini API key - NEVER return to frontend';
COMMENT ON COLUMN bot_configs.ai_features IS 'JSON object with individual AI feature toggles';