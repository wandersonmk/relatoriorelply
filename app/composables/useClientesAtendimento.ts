// Interface para cliente baseado na tabela Atendimentos_Pizarro
export interface ClienteAtendimento {
  contact_name: string
  contact_phone: string | null
  total_atendimentos: number
  ultimo_atendimento: string | null
  primeiro_atendimento: string | null
}

// Interface para dados brutos da consulta
interface AtendimentoRaw {
  contact_name: string
  contact_phone: string | null
  service_start_time: string | null
}

// Função para converter data em string para Date object, suportando múltiplos formatos
const parseDate = (dataString: string | null): Date | null => {
  if (!dataString) return null
  
  try {
    // Se está no formato brasileiro DD/MM/YYYY HH:mm
    if (dataString.includes('/')) {
      const parts = dataString.split(' ')
      const datePart = parts[0]
      const timePart = parts[1] || '00:00'
      
      if (datePart) {
        const dateComponents = datePart.split('/')
        if (dateComponents.length === 3) {
          const [day, month, year] = dateComponents
          if (day && month && year) {
            // Converter para formato ISO para criar Date
            const isoFormat = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`
            return new Date(isoFormat)
          }
        }
      }
    }
    // Se está no formato ISO (YYYY-MM-DD)
    else if (dataString.includes('-') && dataString.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(dataString)
    }
    
    // Fallback: tentar parsing direto
    return new Date(dataString)
  } catch (e) {
    console.error('Erro ao fazer parse da data:', dataString, e)
    return null
  }
}

export const useClientesAtendimento = () => {
  let supabase: any = null
  if (typeof window !== 'undefined') {
    supabase = useSupabaseClient()
  }

  // Estados reativos
  const clientes = ref<ClienteAtendimento[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Buscar clientes únicos da tabela Atendimentos_Pizarro
  const fetchClientesAtendimento = async (): Promise<void> => {
    console.log('🔍 Buscando clientes da tabela Atendimentos_Pizarro...')
    isLoading.value = true
    error.value = null
    
    try {
      const { data, error: clientesError } = await supabase
        .from('Atendimentos_Pizarro')
        .select(`
          contact_name, 
          contact_phone,
          service_start_time
        `)
        .not('contact_name', 'is', null)
        .neq('contact_name', '')
        .order('service_start_time', { ascending: false })

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes:', clientesError)
        error.value = `Erro ao carregar clientes: ${clientesError.message}`
        return
      }

      // Processar dados para agrupar por cliente
      const clientesMap = new Map<string, ClienteAtendimento>()
      
      data?.forEach((atendimento: AtendimentoRaw) => {
        const key = `${atendimento.contact_name}-${atendimento.contact_phone || 'sem-telefone'}`
        
        if (clientesMap.has(key)) {
          const cliente = clientesMap.get(key)!
          cliente.total_atendimentos++
          
          if (atendimento.service_start_time) {
            const dataAtendimento = parseDate(atendimento.service_start_time)
            
            if (dataAtendimento) {
              // Atualizar primeiro atendimento (mais antigo)
              if (!cliente.primeiro_atendimento) {
                cliente.primeiro_atendimento = atendimento.service_start_time
              } else {
                const dataPrimeiro = parseDate(cliente.primeiro_atendimento)
                if (dataPrimeiro && dataAtendimento < dataPrimeiro) {
                  cliente.primeiro_atendimento = atendimento.service_start_time
                }
              }
              
              // Atualizar último atendimento (mais recente)
              if (!cliente.ultimo_atendimento) {
                cliente.ultimo_atendimento = atendimento.service_start_time
              } else {
                const dataUltimo = parseDate(cliente.ultimo_atendimento)
                if (dataUltimo && dataAtendimento > dataUltimo) {
                  cliente.ultimo_atendimento = atendimento.service_start_time
                }
              }
            }
          }
        } else {
          clientesMap.set(key, {
            contact_name: atendimento.contact_name,
            contact_phone: atendimento.contact_phone,
            total_atendimentos: 1,
            ultimo_atendimento: atendimento.service_start_time,
            primeiro_atendimento: atendimento.service_start_time
          })
        }
      })

      // Converter Map para Array e ordenar por total de atendimentos
      clientes.value = Array.from(clientesMap.values())
        .sort((a, b) => b.total_atendimentos - a.total_atendimentos)

      console.log(`✅ ${clientes.value.length} clientes únicos encontrados`)
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar clientes:', err)
      error.value = 'Erro inesperado ao carregar clientes'
    } finally {
      isLoading.value = false
    }
  }

  // Buscar clientes com filtro por nome
  const fetchClientesPorNome = async (nome: string): Promise<ClienteAtendimento[]> => {
    console.log('🔍 Buscando clientes por nome:', nome)
    
    if (!nome || nome.length < 2) {
      return []
    }

    try {
      const { data, error: clientesError } = await supabase
        .from('Atendimentos_Pizarro')
        .select(`
          contact_name, 
          contact_phone,
          service_start_time
        `)
        .ilike('contact_name', `%${nome}%`)
        .not('contact_name', 'is', null)
        .neq('contact_name', '')
        .order('service_start_time', { ascending: false })
        .limit(50) // Limitar para performance

      if (clientesError) {
        console.error('❌ Erro ao buscar clientes por nome:', clientesError)
        return []
      }

      // Processar dados similares ao método principal
      const clientesMap = new Map<string, ClienteAtendimento>()
      
      data?.forEach((atendimento: AtendimentoRaw) => {
        const key = `${atendimento.contact_name}-${atendimento.contact_phone || 'sem-telefone'}`
        
        if (clientesMap.has(key)) {
          const cliente = clientesMap.get(key)!
          cliente.total_atendimentos++
          
          if (atendimento.service_start_time && 
              (!cliente.primeiro_atendimento || 
               new Date(atendimento.service_start_time) < new Date(cliente.primeiro_atendimento))) {
            cliente.primeiro_atendimento = atendimento.service_start_time
          }
        } else {
          clientesMap.set(key, {
            contact_name: atendimento.contact_name,
            contact_phone: atendimento.contact_phone,
            total_atendimentos: 1,
            ultimo_atendimento: atendimento.service_start_time,
            primeiro_atendimento: atendimento.service_start_time
          })
        }
      })

      return Array.from(clientesMap.values())
        .sort((a, b) => b.total_atendimentos - a.total_atendimentos)
    } catch (err) {
      console.error('💥 Erro ao buscar clientes por nome:', err)
      return []
    }
  }

  // Limpar erro
  const clearError = (): void => {
    error.value = null
  }

  // Retornar estados e funções reativas
  return {
    clientes,
    isLoading,
    error,
    fetchClientesAtendimento,
    fetchClientesPorNome,
    clearError
  }
}