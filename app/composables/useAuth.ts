import { ref, computed, readonly } from 'vue'
import type { User, Session } from '@supabase/supabase-js'
import { useSupabaseClient } from './useSupabaseClient'

// Composable simples de autenticação
export function useAuth() {
  const supabase = useSupabaseClient()

  // Estados básicos
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  // Computed para verificar se está autenticado
  const isAuthenticated = computed(() => !!user.value)

  // Funções básicas
  const signInWithEmailAndPassword = async (email: string, password: string) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      user.value = data.user
      session.value = data.session
      return data.user
    } catch (err: any) {
      errorMessage.value = String(err?.message || err)
      return false
    } finally {
      isLoading.value = false
    }
  }
  const signUp = async ({ name, companyName, email, password }: { name: string, companyName: string, email: string, password: string }) => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: name
          }
        }
      })
      if (error) throw error
      
      // Só insere na tabela usuarios se o usuário foi criado com sucesso
      if (data.user) {
        const { error: insertError } = await supabase.from('usuarios').insert({
          id: data.user.id,
          nome: name,
          empresa: companyName,
          email: email,
          perfil: 'admin'
        })
        
        if (insertError) {
          console.error('Erro ao inserir na tabela usuarios:', insertError)
          throw new Error(`Erro ao criar perfil do usuário: ${insertError.message}`)
        }
      }
      
      return data.user
    } catch (err: any) {
      errorMessage.value = String(err?.message || err)
      console.error('Erro detalhado no signUp:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }
  const signOut = async () => {}
  const reloadSession = async () => {}
  const clearError = () => { errorMessage.value = null }

  return {
    user: readonly(user),
    session: readonly(session),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    errorMessage: readonly(errorMessage),
    signInWithEmailAndPassword,
    signUp,
    signOut,
    reloadSession,
    clearError
  }
}