import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnpvtnsttaumrdiyezub.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucHZ0bnN0dGF1bXJkaXllenViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTQ2OTAsImV4cCI6MjA5MzA3MDY5MH0.K0RBxX7pUqYGlU3sc3gSDpD3ttEoi_sb7hEC5v3ewgQ'

export const supabase = createClient(supabaseUrl, supabaseKey)