export const useRelatorios = () => {
  console.log('🚀 [useRelatorios] Inicializando composable...')
  
  let supabase: any = null
  if (typeof window !== 'undefined') {
    console.log('🌐 [useRelatorios] Ambiente cliente detectado, inicializando Supabase...')
    try {
      supabase = useSupabaseClient()
      console.log('✅ [useRelatorios] Supabase client inicializado com sucesso')
    } catch (error) {
      console.error('❌ [useRelatorios] Erro ao inicializar Supabase client:', error)
    }
  } else {
    console.log('🖥️ [useRelatorios] Ambiente servidor - Supabase não inicializado')
  }
  
  // Interface para os dados da tabela Atendimentos_Pizarro
  interface AtendimentoPizarro {
    ticket_number: string
    agent_name: string
    contact_name: string | null
    contact_phone: string | null
    service_time: string | null
    service_start_time: string | null
    contact_request: string | null
    service_classification: string | null
    service_score: string | null
    agent_solution: string | null
    customer_note: string | null
    service_summary: string | null
  }
  
  // Estados reativos
  const relatorios = ref<AtendimentoPizarro[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Função para buscar todos os registros da tabela Atendimentos_Pizarro
  const fetchRelatorios = async () => {
    console.log('🔍 Iniciando busca de registros de atendimento...')
    
    if (!supabase) {
      console.error('❌ Supabase client não inicializado')
      error.value = 'Cliente não inicializado'
      return
    }
    
    isLoading.value = true
    error.value = null
    
    try {
      console.log('🔗 Testando conexão com Supabase...')
      
      const { data, error: fetchError } = await supabase
        .from('Atendimentos_Pizarro')
        .select('*')
        .limit(10)

      console.log('📞 Resposta da query:', { data, fetchError })

      if (fetchError) {
        console.error('❌ Erro ao buscar atendimentos:', fetchError)
        error.value = `Erro na consulta: ${fetchError.message}`
        return
      }

      console.log('✅ Atendimentos encontrados:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('📊 Primeiro registro:', data[0])
      }

      relatorios.value = data || []
    } catch (err: any) {
      console.error('❌ Erro na busca de atendimentos:', err)
      error.value = err.message || 'Erro ao carregar atendimentos'
      relatorios.value = []
    } finally {
      isLoading.value = false
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
    clearError
  }
}
