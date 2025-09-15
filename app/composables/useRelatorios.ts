export const useRelatorios = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }
  
  // Interface para o relatório
  interface Relatorio {
    id: string
    nome_pessoa: string
    telefone: string
    nome_loja: string
    cnpj: string
    nome_empresa: string
    data_abertura_chamado: string
    hora_abertura_chamado: string
    motivo_chamado: string
    created_at: string
  }
  
  // Estados reativos
  const relatorios = ref<Relatorio[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Função para buscar todos os relatórios (sem filtro por usuário)
  const fetchRelatorios = async () => {
    console.log('🔍 Iniciando busca de relatórios...')
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('relatorios')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Erro ao buscar relatórios:', fetchError)
        throw fetchError
      }

      console.log('✅ Relatórios encontrados:', data?.length || 0)
      console.log('📊 Dados dos relatórios:', data)

      relatorios.value = data || []
    } catch (err: any) {
      console.error('❌ Erro na busca de relatórios:', err)
      error.value = err.message || 'Erro ao carregar relatórios'
      relatorios.value = []
    } finally {
      isLoading.value = false
    }
  }
  
  // Função para adicionar relatório
  const addRelatorio = async (relatorioData: Omit<Relatorio, 'id' | 'created_at'>) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado')
      }
      
      const { data, error: insertError } = await supabase
        .from('relatorios')
        .insert([
          {
            ...relatorioData,
            usuario_id: currentUser.id
          }
        ])
        .select()
      
      if (insertError) {
        console.error('❌ Erro ao adicionar relatório:', insertError)
        throw insertError
      }
      
      console.log('✅ Relatório adicionado:', data)
      
      // Recarregar a lista
      await fetchRelatorios()
      
      return data
    } catch (err: any) {
      console.error('❌ Erro ao adicionar relatório:', err)
      error.value = err.message || 'Erro ao adicionar relatório'
      throw err
    }
  }
  
  // Função para deletar relatório
  const deleteRelatorio = async (relatorioId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('relatorios')
        .delete()
        .eq('id', relatorioId)
      
      if (deleteError) {
        console.error('❌ Erro ao deletar relatório:', deleteError)
        throw deleteError
      }
      
      console.log('✅ Relatório deletado:', relatorioId)
      
      // Recarregar a lista
      await fetchRelatorios()
      
    } catch (err: any) {
      console.error('❌ Erro ao deletar relatório:', err)
      error.value = err.message || 'Erro ao deletar relatório'
      throw err
    }
  }
  
  // Função para limpar erros
  const clearError = () => {
    error.value = null
  }
  
  return {
    relatorios,
    isLoading,
    error,
    fetchRelatorios,
    addRelatorio,
    deleteRelatorio,
    clearError
  }
}
