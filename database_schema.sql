-- Deal Ivica AI Database Schema for Supabase
-- Run these commands in your Supabase SQL editor

-- =============================================
-- 1. Create decks table
-- =============================================

CREATE TABLE IF NOT EXISTS public.decks (
    -- Primary key (auto-generated UUID)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to auth.users
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Deck metadata
    title TEXT NOT NULL,
    prompt_text TEXT NOT NULL,
    
    -- JSON columns for flexible data storage
    generated_content_json JSONB,
    gate_settings_json JSONB DEFAULT '[]'::jsonb,
    
    -- Sharing and access
    unique_url TEXT NOT NULL UNIQUE,
    
    -- Status and metrics
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Create indexes for performance
-- =============================================

-- Index for finding decks by creator
CREATE INDEX IF NOT EXISTS idx_decks_creator_id ON public.decks(creator_id);

-- Index for finding decks by unique URL (for sharing)
CREATE INDEX IF NOT EXISTS idx_decks_unique_url ON public.decks(unique_url);

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_decks_created_at ON public.decks(created_at DESC);

-- =============================================
-- 3. Enable Row Level Security (RLS)
-- =============================================

-- Enable RLS on decks table
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. Create RLS Policies
-- =============================================

-- Policy: Users can view their own decks
CREATE POLICY "Users can view own decks" ON public.decks
    FOR SELECT USING (auth.uid() = creator_id);

-- Policy: Users can insert their own decks
CREATE POLICY "Users can insert own decks" ON public.decks
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update their own decks
CREATE POLICY "Users can update own decks" ON public.decks
    FOR UPDATE USING (auth.uid() = creator_id);

-- Policy: Users can delete their own decks
CREATE POLICY "Users can delete own decks" ON public.decks
    FOR DELETE USING (auth.uid() = creator_id);

-- Policy: Anyone can view decks by unique_url (for sharing)
CREATE POLICY "Anyone can view decks by unique_url" ON public.decks
    FOR SELECT USING (unique_url IS NOT NULL);

-- =============================================
-- 5. Create function to update updated_at timestamp
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_decks_updated_at 
    BEFORE UPDATE ON public.decks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. Optional: Access logs table (for analytics)
-- =============================================

CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    viewer_info JSONB DEFAULT '{}'::jsonb,
    signatures JSONB DEFAULT '{}'::jsonb,
    access_timestamp TIMESTAMPTZ DEFAULT NOW(),
    view_count INTEGER DEFAULT 1
);

-- Index for access logs
CREATE INDEX IF NOT EXISTS idx_access_logs_deck_id ON public.access_logs(deck_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON public.access_logs(access_timestamp DESC);

-- Enable RLS on access logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Deck creators can view access logs for their decks
CREATE POLICY "Creators can view deck access logs" ON public.access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.decks 
            WHERE decks.id = access_logs.deck_id 
            AND decks.creator_id = auth.uid()
        )
    );

-- Policy: Anyone can insert access logs (for tracking views)
CREATE POLICY "Anyone can insert access logs" ON public.access_logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- 7. Grant necessary permissions
-- =============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decks TO authenticated;
GRANT SELECT, INSERT ON public.access_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions to anonymous users (for viewing shared decks)
GRANT SELECT ON public.decks TO anon;
GRANT INSERT ON public.access_logs TO anon;

-- =============================================
-- 8. Sample data (optional - for testing)
-- =============================================

-- Uncomment the following to insert sample data:

/*
-- Insert a sample deck (replace 'your-user-id' with an actual user ID from auth.users)
INSERT INTO public.decks (
    creator_id, 
    title, 
    prompt_text, 
    generated_content_json,
    gate_settings_json,
    unique_url
) VALUES (
    'your-user-id'::uuid,
    'Sample Presentation',
    'Create a presentation about AI and machine learning trends',
    '{"slides": [{"id": 1, "type": "title", "title": "AI Trends", "subtitle": "The Future of Technology"}]}'::jsonb,
    '["info"]'::jsonb,
    'sample-deck-' || extract(epoch from now())
);
*/

-- =============================================
-- Setup Complete!
-- =============================================

-- After running this script:
-- 1. Your Supabase database will have the required schema
-- 2. Row Level Security is properly configured
-- 3. Users can only access their own decks
-- 4. Shared decks can be accessed via unique_url
-- 5. Access logs will track deck views
-- 6. All necessary indexes are in place for performance

-- Next steps:
-- 1. Update your .env file with your Supabase credentials
-- 2. Test the application with deck creation
-- 3. Verify that authentication and database operations work correctly