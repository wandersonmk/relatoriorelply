export const useRelatorios = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
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
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('Atendimentos_Pizarro')
        .select('*')
        .order('service_start_time', { ascending: false })

      if (fetchError) {
        console.error('❌ Erro ao buscar atendimentos:', fetchError)
        throw fetchError
      }

      console.log('✅ Atendimentos encontrados:', data?.length || 0)
      console.log('📊 Dados dos atendimentos:', data)

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
