import { createClient } from '@supabase/supabase-js'

// Эти переменные автоматически берутся из .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Проверка что переменные загрузились
console.log('Supabase URL:', supabaseUrl ? 'Загружен' : 'Ошибка')
console.log('Supabase Key:', supabaseKey ? 'Загружен' : 'Ошибка')

export const supabase = createClient(supabaseUrl, supabaseKey)