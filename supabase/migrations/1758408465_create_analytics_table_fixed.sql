-- Analytics table for tracking deck views and engagement
-- This migration handles existing functions properly

-- Create table first
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0,
  engaged_users INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one analytics record per deck
  UNIQUE(deck_id)
);

-- Enable Row Level Security
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see analytics for their own decks
DROP POLICY IF EXISTS "Users can view analytics for their own decks" ON analytics;
CREATE POLICY "Users can view analytics for their own decks" ON analytics
  FOR SELECT USING (
    deck_id IN (
      SELECT id FROM decks WHERE creator_id = auth.uid()
    )
  );

-- Policy: Users can insert/update analytics for their own decks
DROP POLICY IF EXISTS "Users can modify analytics for their own decks" ON analytics;
CREATE POLICY "Users can modify analytics for their own decks" ON analytics
  FOR ALL USING (
    deck_id IN (
      SELECT id FROM decks WHERE creator_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_analytics_updated_at ON analytics;
CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_updated_at();

-- Handle existing increment_view_count function
DROP FUNCTION IF EXISTS increment_view_count(UUID);
CREATE OR REPLACE FUNCTION increment_view_count(deck_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics (deck_id, view_count, last_viewed_at)
  VALUES (deck_id, 1, NOW())
  ON CONFLICT (deck_id)
  DO UPDATE SET 
    view_count = analytics.view_count + 1,
    last_viewed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_deck_id ON analytics(deck_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);

-- Insert comment
COMMENT ON TABLE analytics IS 'Analytics tracking for presentation views and engagement metrics';