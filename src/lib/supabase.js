import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://rtuxsfdroqdnhtagttmj.supabase.co"
const supabaseAnonKey = "sb_publishable_MkAinQ_yxq2HqGfakMEREg_YguVKGX6"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
