-- Add faq_welcome_message column to bot_configs
ALTER TABLE bot_configs 
ADD COLUMN IF NOT EXISTS faq_welcome_message text;