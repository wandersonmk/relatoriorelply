import { ref, computed } from 'vue'
import { useSupabaseClient } from './useSupabaseClient'
import { useAuth } from './useAuth'

// Interface para os dados do usuário da tabela
interface UsuarioData {
  id: string
  nome: string
  email: string
  foto?: string
  perfil: 'admin' | 'colaborador'
  empresa?: string
  created_at?: string
}

export const useUsuario = () => {
  // Estados
  const usuarioData = ref<UsuarioData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed para nome da empresa
  const nomeEmpresa = computed(() => {
    return usuarioData.value?.empresa || 'Sistema de Relatórios'
  })
  
  // Computed para nome do usuário
  const nomeUsuario = computed(() => {
    // Só tentar pegar o user do useAuth no cliente
    if (process.server) {
      return usuarioData.value?.nome || 'Usuário'
    }
    
    const { user } = useAuth()
    return usuarioData.value?.nome || user.value?.email || 'Usuário'
  })
  
  // Função para buscar dados do usuário
  const fetchUsuarioData = async (userId?: string) => {
    // Só executar no cliente
    if (process.server) {
      console.log('[useUsuario] Pulando busca no servidor')
      return null
    }
    
    const { user } = useAuth()
    const supabase = useSupabaseClient()
    
    // Priorizar busca por email que é mais confiável
    let userEmail = null
    let targetUserId = null
    
    if (userId) {
      targetUserId = userId
    } else if (user.value?.email) {
      userEmail = user.value.email
    } else if (user.value?.id) {
      targetUserId = user.value.id
    } else {
      // Tentar pegar email do localStorage
      userEmail = localStorage.getItem('user_email')
    }
    
    if (!userEmail && !targetUserId) {
      console.log('[useUsuario] Nenhum usuário logado encontrado')
      return null
    }
    
    console.log('[useUsuario] Buscando dados do usuário:', userEmail || targetUserId)
    
    isLoading.value = true
    error.value = null
    
    try {
      let query = supabase.from('usuarios').select('*')
      
      // Buscar por email se disponível, senão por ID
      if (userEmail) {
        query = query.eq('email', userEmail)
      } else {
        query = query.eq('id', targetUserId)
      }
      
      const { data, error: fetchError } = await query.single()
      
      if (fetchError) {
        throw fetchError
      }
      
      console.log('[useUsuario] Dados do usuário encontrados:', data)
      usuarioData.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar dados do usuário'
      console.error('[useUsuario] Erro ao buscar usuario:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // Função para atualizar dados do usuário
  const updateUsuarioData = async (updates: Partial<UsuarioData>) => {
    // Só executar no cliente
    if (process.server) {
      console.log('[useUsuario] Pulando atualização no servidor')
      return false
    }
    
    const { user } = useAuth()
    const supabase = useSupabaseClient()
    
    if (!user.value?.id) return false
    
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: updateError } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()
      
      if (updateError) {
        throw updateError
      }
      
      usuarioData.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao atualizar dados do usuário'
      console.error('Erro ao atualizar usuario:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    usuarioData,
    isLoading,
    error,
    nomeEmpresa,
    nomeUsuario,
    fetchUsuarioData,
    updateUsuarioData
  }
}