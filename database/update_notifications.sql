
-- 1. RLS Policy to allow users to update their own notifications.
-- This will fix the issue of "is_read" not being saved.
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 2. Add an "updated_at" column to track when a notification is read.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Create a trigger function to automatically set the "updated_at" timestamp.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to the notifications table.
DROP TRIGGER IF EXISTS on_notifications_update ON public.notifications;
CREATE TRIGGER on_notifications_update
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- 3. Function to delete old notifications.
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void AS $$
BEGIN
    -- Delete notifications that were read more than 5 minutes ago.
    DELETE FROM public.notifications
    WHERE is_read = true AND updated_at < NOW() - INTERVAL '5 minutes';

    -- Delete unread notifications that are older than 2 days.
    DELETE FROM public.notifications
    WHERE is_read = false AND created_at < NOW() - INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql;
