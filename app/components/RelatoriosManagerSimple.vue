<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Atendimentos</h2>
        <p class="text-sm text-muted-foreground mt-1">Acompanhe todos os registros de atendimento</p>
        <p v-if="relatoriosFiltrados && relatoriosFiltrados.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de registros: <span class="font-semibold text-primary">{{ relatoriosFiltrados.length }}</span>
        </p>
      </div>
      
      <!-- Botões de exportação no header -->
      <div class="flex items-center space-x-3">
        <!-- Botão PDF -->
        <button
          @click="gerarRelatorioPDF"
          :disabled="!relatoriosFiltrados || relatoriosFiltrados.length === 0 || gerandoPDF"
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <font-awesome-icon :icon="gerandoPDF ? 'spinner' : 'file-pdf'" :class="{ 'animate-spin': gerandoPDF, 'w-4 h-4': true }" />
          <span>{{ gerandoPDF ? 'Gerando PDF...' : 'Exportar PDF' }}</span>
        </button>

        <!-- Botão Excel -->
        <button
          @click="gerarRelatorioExcel"
          :disabled="!relatoriosFiltrados || relatoriosFiltrados.length === 0 || gerandoExcel"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <font-awesome-icon :icon="gerandoExcel ? 'spinner' : 'file-excel'" :class="{ 'animate-spin': gerandoExcel, 'w-4 h-4': true }" />
          <span>{{ gerandoExcel ? 'Gerando Excel...' : 'Exportar Excel' }}</span>
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Filtro por Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
          <input
            v-model="filtros.dataInicial"
            type="date"
            class="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Data Final -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
          <input
            v-model="filtros.dataFinal"
            type="date"
            class="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Número do Ticket -->
        <div class="relative">
          <label class="block text-sm font-medium text-foreground mb-2">Ticket</label>
          <input
            v-model="filtros.numeroTicket"
            type="text"
            placeholder="Nº do ticket"
            class="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div v-if="processandoFiltro && filtros.numeroTicket" class="absolute right-3 top-9 text-muted-foreground">
            <font-awesome-icon icon="spinner" class="animate-spin w-4 h-4" />
          </div>
        </div>

        <!-- Filtro por Nome do Agente -->
        <div class="relative">
          <label class="block text-sm font-medium text-foreground mb-2">Agente</label>
          <input
            v-model="filtros.agenteOuContato"
            type="text"
            placeholder="Nome do agente"
            class="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div v-if="processandoFiltro && filtros.agenteOuContato" class="absolute right-3 top-9 text-muted-foreground">
            <font-awesome-icon icon="spinner" class="animate-spin w-4 h-4" />
          </div>
        </div>

        <!-- Filtro por Nome do Cliente -->
        <div class="relative">
          <label class="block text-sm font-medium text-foreground mb-2">Cliente</label>
          <input
            v-model="filtros.classificacao"
            type="text"
            placeholder="Nome do cliente"
            class="w-full px-2 py-2 border border-border rounded-lg bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div v-if="processandoFiltro && filtros.classificacao" class="absolute right-3 top-9 text-muted-foreground">
            <font-awesome-icon icon="spinner" class="animate-spin w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Botão limpar filtros -->
      <div class="flex items-center justify-end mt-4">
        <button
          @click="limparFiltros"
          class="flex items-center space-x-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <font-awesome-icon icon="eraser" class="w-4 h-4" />
          <span>Limpar Filtros</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-3">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Carregando atendimentos...</p>
      </div>
    </div>

    <!-- Erro -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
      <div class="text-red-500 mb-4">
        <font-awesome-icon icon="exclamation-triangle" class="w-12 h-12" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">Erro ao carregar relatórios</h3>
      <p class="text-muted-foreground text-center mb-4">{{ error }}</p>
      <button
        @click="recarregarRelatorios"
        class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="relatoriosFiltrados.length === 0" class="text-center py-8">
      <div class="text-muted-foreground mb-4">
        <font-awesome-icon icon="exclamation-circle" class="w-12 h-12" />
      </div>
      <h3 class="text-lg font-medium text-foreground mb-2">
        {{ filtrosAplicados ? 'Nenhum atendimento encontrado' : 'Nenhum atendimento disponível' }}
      </h3>
      <p class="text-muted-foreground text-sm">
        {{ filtrosAplicados ? 'Tente ajustar os filtros para encontrar atendimentos.' : 'Quando houver atendimentos, eles aparecerão aqui.' }}
      </p>
    </div>

    <!-- Tabela -->
    <div v-else class="overflow-x-auto">
      <div style="max-height: 400px; overflow-y: auto; position: relative;">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Ticket</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Agente</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Cliente</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Telefone</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Tempo</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Início</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Solicitação</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Classificação</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Score</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Solução</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Avaliação</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Resumo</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="relatorio in relatoriosOrdenados" 
              :key="relatorio.ticket_number"
              v-memo="[relatorio.ticket_number, relatorio.agent_name, relatorio.contact_name]"
              @click="abrirModal(relatorio)"
              class="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <!-- Número do ticket -->
              <td class="py-3 px-3">
                <div class="flex items-center">
                  <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                    <font-awesome-icon icon="ticket" class="w-3 h-3 text-primary" />
                  </div>
                  <span class="font-medium text-foreground text-sm">{{ relatorio.ticket_number }}</span>
                </div>
              </td>
              
              <!-- Nome do agente -->
              <td class="py-3 px-3">
                <span class="text-foreground text-sm">{{ relatorio.agent_name }}</span>
              </td>
              
              <!-- Nome do contato -->
              <td class="py-3 px-3">
                <span class="text-foreground font-medium text-sm">{{ relatorio.contact_name || '-' }}</span>
              </td>
              
              <!-- Telefone do contato -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs">{{ relatorio.contact_phone || '-' }}</span>
              </td>
              
              <!-- Tempo de serviço -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs">{{ relatorio.service_time || '-' }}</span>
              </td>
              
              <!-- Hora de início do serviço -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs">{{ relatorio.service_start_time || '-' }}</span>
              </td>
              
              <!-- Solicitação do contato -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs" :title="relatorio.contact_request || '-'">
                  {{ truncateText(relatorio.contact_request, 30) }}
                </span>
              </td>
              
              <!-- Classificação do serviço -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs">{{ relatorio.service_classification || '-' }}</span>
              </td>
              
              <!-- Pontuação do serviço -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs">{{ relatorio.service_score || '-' }}</span>
              </td>
              
              <!-- Solução do agente -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs" :title="relatorio.agent_solution || '-'">
                  {{ truncateText(relatorio.agent_solution, 30) }}
                </span>
              </td>
              
              <!-- Nota do cliente -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs" :title="relatorio.customer_note || '-'">
                  {{ truncateText(relatorio.customer_note, 30) }}
                </span>
              </td>
              
              <!-- Resumo do serviço -->
              <td class="py-3 px-3">
                <span class="text-foreground text-xs" :title="relatorio.service_summary || '-'">
                  {{ truncateText(relatorio.service_summary, 30) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Detalhes do Atendimento -->
    <div 
      v-if="modalAberto" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="fecharModal"
    >
      <div 
        class="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <!-- Header do Modal -->
        <div class="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div>
            <h3 class="text-xl font-semibold text-foreground">Detalhes do Atendimento</h3>
            <p class="text-sm text-muted-foreground mt-1">Ticket #{{ atendimentoSelecionado?.ticket_number }}</p>
          </div>
          <button 
            @click="fecharModal"
            class="text-muted-foreground hover:text-foreground transition-colors"
          >
            <font-awesome-icon icon="times" class="w-6 h-6" />
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6 space-y-6" v-if="atendimentoSelecionado">
          <!-- Informações Principais -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h4 class="text-lg font-medium text-foreground border-b border-border pb-2">Informações do Atendimento</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Número do Ticket</label>
                  <p class="text-foreground font-mono">{{ atendimentoSelecionado.ticket_number }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Nome do Agente</label>
                  <p class="text-foreground">{{ atendimentoSelecionado.agent_name }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Tempo de Serviço</label>
                  <p class="text-foreground">{{ atendimentoSelecionado.service_time || 'Não informado' }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Início do Atendimento</label>
                  <p class="text-foreground">{{ formatarData(atendimentoSelecionado.service_start_time) }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Pontuação do Serviço</label>
                  <p class="text-foreground">{{ atendimentoSelecionado.service_score || 'Não avaliado' }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <h4 class="text-lg font-medium text-foreground border-b border-border pb-2">Informações do Cliente</h4>
              
              <div class="space-y-3">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Nome do Contato</label>
                  <p class="text-foreground">{{ atendimentoSelecionado.contact_name || 'Não informado' }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Telefone do Contato</label>
                  <p class="text-foreground font-mono">{{ atendimentoSelecionado.contact_phone || 'Não informado' }}</p>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Classificação do Serviço</label>
                  <p class="text-foreground">{{ atendimentoSelecionado.service_classification || 'Não classificado' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção de Textos Longos -->
          <div class="space-y-6">
            <div>
              <h4 class="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">Detalhes da Solicitação</h4>
              
              <div class="space-y-4">
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Solicitação do Cliente</label>
                  <div class="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p class="text-foreground whitespace-pre-wrap">{{ atendimentoSelecionado.contact_request || 'Não informado' }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Solução do Agente</label>
                  <div class="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p class="text-foreground whitespace-pre-wrap">{{ atendimentoSelecionado.agent_solution || 'Não informado' }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Observações do Cliente</label>
                  <div class="mt-2 p-4 bg-muted/30 rounded-lg">
                    <p class="text-foreground whitespace-pre-wrap">{{ atendimentoSelecionado.customer_note || 'Não informado' }}</p>
                  </div>
                </div>
                
                <div>
                  <label class="text-sm font-medium text-muted-foreground">Resumo do Atendimento</label>
                  <div class="mt-2 p-4 bg-muted/30 rounded-lg">
                    <div class="text-foreground leading-relaxed" v-html="formatarResumo(atendimentoSelecionado.service_summary)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer do Modal -->
        <div class="sticky bottom-0 bg-background border-t border-border p-6">
          <div class="flex justify-end">
            <button 
              @click="fecharModal"
              class="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

// Interface para atendimento da tabela Atendimentos_Pizarro
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

// Interface para filtros 
interface Filtros {
  dataInicial: string
  dataFinal: string
  numeroTicket: string     // Campo usado para filtro por número do ticket
  agenteOuContato: string  // Campo usado para filtro por agente
  classificacao: string    // Campo usado para filtro por nome do cliente
}

// Usar o composable de relatórios
const { 
  relatorios: relatoriosData, 
  isLoading, 
  error, 
  fetchRelatorios, 
  clearError 
} = useRelatorios()

// Usar o composable de PDF
const { gerarPDF } = useRelatorioPDF()

// Usar o composable de Excel
const { gerarExcel } = useRelatorioExcel()

// Estado para controle da geração do PDF
const gerandoPDF = ref(false)

// Estado para controle da geração do Excel
const gerandoExcel = ref(false)

// Estados reativos
const filtros = ref<Filtros>({
  dataInicial: '',
  dataFinal: '',
  numeroTicket: '',
  agenteOuContato: '',
  classificacao: ''
})

// Estados do modal
const modalAberto = ref(false)
const atendimentoSelecionado = ref<AtendimentoPizarro | null>(null)

// Estados para debounce dos filtros de texto
const filtrosDebounce = ref<Filtros>({
  dataInicial: '',
  dataFinal: '',
  numeroTicket: '',
  agenteOuContato: '',
  classificacao: ''
})

// Estado para indicar quando está processando filtros de texto
const processandoFiltro = ref(false)

// Timers separados para cada filtro
let debounceTimerAgente: NodeJS.Timeout
let debounceTimerCliente: NodeJS.Timeout
let debounceTimerTicket: NodeJS.Timeout

// Watcher para aplicar debounce nos filtros de texto
watch(() => filtros.value.numeroTicket, (novoValor) => {
  console.log('🎫 Watcher ticket chamado:', novoValor)
  processandoFiltro.value = true
  clearTimeout(debounceTimerTicket)
  debounceTimerTicket = setTimeout(() => {
    console.log('🎫 Aplicando filtro ticket após debounce:', novoValor)
    filtrosDebounce.value.numeroTicket = novoValor
    processandoFiltro.value = false
  }, 100) // Reduzido para 100ms para filtrar mais rapidamente
}, { immediate: true })

watch(() => filtros.value.agenteOuContato, (novoValor) => {
  processandoFiltro.value = true
  clearTimeout(debounceTimerAgente)
  debounceTimerAgente = setTimeout(() => {
    filtrosDebounce.value.agenteOuContato = novoValor
    processandoFiltro.value = false
  }, 100) // Reduzido para 100ms para carregamento mais rápido
}, { immediate: true })

watch(() => filtros.value.classificacao, (novoValor) => {
  processandoFiltro.value = true
  clearTimeout(debounceTimerCliente)
  debounceTimerCliente = setTimeout(() => {
    filtrosDebounce.value.classificacao = novoValor
    processandoFiltro.value = false
  }, 100) // Reduzido para 100ms para carregamento mais rápido
}, { immediate: true })

// Para as datas não precisamos de debounce, aplicar imediatamente
watch(() => filtros.value.dataInicial, (novoValor) => {
  filtrosDebounce.value.dataInicial = novoValor
}, { immediate: true })

watch(() => filtros.value.dataFinal, (novoValor) => {
  filtrosDebounce.value.dataFinal = novoValor
}, { immediate: true })

// Carregar relatórios e configurar listeners quando o componente for montado
onMounted(() => {
  fetchRelatorios()
  
  // Listener para tecla ESC fechar modal
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && modalAberto.value) {
      fecharModal()
    }
  }
  
  window.addEventListener('keydown', handleKeydown)
  
  // Cleanup no unmount
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    // Garantir que o scroll seja restaurado
    document.body.style.overflow = 'auto'
  })
})

// Computed para detectar se há filtros ativos
const filtrosAplicados = computed(() => {
  return filtros.value.dataInicial !== '' || 
         filtros.value.dataFinal !== '' || 
         filtrosDebounce.value.agenteOuContato !== '' || 
         filtrosDebounce.value.classificacao !== ''
})

// Computed para relatórios filtrados
const relatoriosFiltrados = computed(() => {
  let resultado = relatoriosData.value

  // Filtro de data inicial - otimizado
  if (filtrosDebounce.value.dataInicial) {
    resultado = resultado.filter(r => {
      if (!r.service_start_time) return false
      try {
        let dataAtendimento = r.service_start_time
        
        if (dataAtendimento.includes('/')) {
          const partes = dataAtendimento.split(' ')[0]?.split('/')
          if (partes && partes.length === 3) {
            dataAtendimento = `${partes[2]}-${partes[1]!.padStart(2, '0')}-${partes[0]!.padStart(2, '0')}`
          }
        } else {
          dataAtendimento = dataAtendimento.split(' ')[0]!
        }
        
        return dataAtendimento >= filtrosDebounce.value.dataInicial
      } catch (e) {
        return false
      }
    })
  }

  // Filtro de data final - otimizado
  if (filtrosDebounce.value.dataFinal) {
    resultado = resultado.filter(r => {
      if (!r.service_start_time) return false
      try {
        let dataAtendimento = r.service_start_time
        
        if (dataAtendimento.includes('/')) {
          const partes = dataAtendimento.split(' ')[0]?.split('/')
          if (partes && partes.length === 3) {
            dataAtendimento = `${partes[2]}-${partes[1]!.padStart(2, '0')}-${partes[0]!.padStart(2, '0')}`
          }
        } else {
          dataAtendimento = dataAtendimento.split(' ')[0]!
        }
        
        return dataAtendimento <= filtrosDebounce.value.dataFinal
      } catch (e) {
        return false
      }
    })
  }

  // Filtro de número do ticket - otimizado com debounce
  if (filtrosDebounce.value.numeroTicket) {
    const termo = filtrosDebounce.value.numeroTicket.toLowerCase()
    console.log('🎫 Filtrando por ticket:', termo)
    const resultadoAnterior = resultado.length
    resultado = resultado.filter(r => 
      r.ticket_number && r.ticket_number.toLowerCase().includes(termo)
    )
    console.log('🎫 Resultado filtro ticket:', `${resultadoAnterior} → ${resultado.length}`)
  }

  // Filtro de agente - otimizado com debounce
  if (filtrosDebounce.value.agenteOuContato) {
    const termo = filtrosDebounce.value.agenteOuContato.toLowerCase()
    resultado = resultado.filter(r => 
      r.agent_name && r.agent_name.toLowerCase().includes(termo)
    )
  }

  // Filtro de cliente - otimizado com debounce
  if (filtrosDebounce.value.classificacao) {
    const termo = filtrosDebounce.value.classificacao.toLowerCase()
    resultado = resultado.filter(r =>
      r.contact_name && r.contact_name.toLowerCase().includes(termo)
    )
  }

  return resultado
})

// Computed para ordenar relatórios por service_start_time (mais novos no topo)
const relatoriosOrdenados = computed(() => {
  return relatoriosFiltrados.value ? [...relatoriosFiltrados.value].sort((a, b) => {
    if (!a.service_start_time || !b.service_start_time) return 0
    try {
      return new Date(b.service_start_time).getTime() - new Date(a.service_start_time).getTime()
    } catch (e) {
      return 0
    }
  }) : []
})

// Função para recarregar relatórios
const recarregarRelatorios = () => {
  clearError()
  fetchRelatorios()
}

// Função para limpar filtros
function limparFiltros() {
  filtros.value = {
    dataInicial: '',
    dataFinal: '',
    numeroTicket: '',
    agenteOuContato: '',
    classificacao: ''
  }
  
  // Limpar também os valores com debounce imediatamente
  filtrosDebounce.value = {
    dataInicial: '',
    dataFinal: '',
    numeroTicket: '',
    agenteOuContato: '',
    classificacao: ''
  }
  
  // Limpar qualquer timer pendente e estado de processamento
  clearTimeout(debounceTimerTicket)
  clearTimeout(debounceTimerAgente)
  clearTimeout(debounceTimerCliente)
  processandoFiltro.value = false
}

// Função para truncar texto
function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Função para formatar resumo do atendimento
function formatarResumo(resumo: string | null): string {
  if (!resumo) return '<p class="text-muted-foreground italic">Não informado</p>'
  
  // Extrair apenas o resumo geral
  const resumoGeralMatch = resumo.match(/Resumo Geral:\s*(.*)/s)
  
  if (resumoGeralMatch && resumoGeralMatch[1]) {
    const textoResumo = resumoGeralMatch[1].trim()
    return `<div class="p-3 bg-muted/10 rounded-lg border-l-2 border-muted-foreground/20">
              <strong class="text-foreground text-sm">📋 Resumo Geral:</strong>
              <p class="mt-2 text-foreground/90 leading-relaxed text-sm">${textoResumo}</p>
            </div>`
  }
  
  // Se não encontrar "Resumo Geral", exibir o texto completo com fonte mais clara
  return `<div class="p-3 bg-muted/10 rounded-lg border-l-2 border-muted-foreground/20">
            <p class="text-foreground/90 leading-relaxed text-sm whitespace-pre-line">${resumo}</p>
          </div>`
}

// Funções do modal
function abrirModal(atendimento: AtendimentoPizarro) {
  atendimentoSelecionado.value = atendimento
  modalAberto.value = true
  // Prevenir scroll do body quando modal estiver aberto
  document.body.style.overflow = 'hidden'
}

function fecharModal() {
  modalAberto.value = false
  atendimentoSelecionado.value = null
  // Restaurar scroll do body
  document.body.style.overflow = 'auto'
}

// Função para gerar PDF
async function gerarRelatorioPDF() {
  const toast = await useToastSafe()
  
  // Verificar se há dados
  if (!relatoriosFiltrados.value || relatoriosFiltrados.value.length === 0) {
    toast.warning('Nenhum dado para gerar PDF')
    return
  }

  try {
    gerandoPDF.value = true
    
    const resultado = await gerarPDF(relatoriosFiltrados.value, {})
    
    if (resultado && resultado.sucesso) {
      toast.success(`PDF gerado com sucesso: ${resultado.nomeArquivo}`)
    } else {
      toast.error('Erro ao gerar PDF')
    }
  } catch (error) {
    console.error('[COMPONENTE] Erro:', error)
    toast.error('Erro ao gerar PDF')
  } finally {
    gerandoPDF.value = false
  }
}

// Função para gerar Excel
async function gerarRelatorioExcel() {
  if (!relatoriosFiltrados.value || relatoriosFiltrados.value.length === 0) {
    const toast = await useToastSafe()
    toast.warning('Nenhum dado para gerar Excel')
    return
  }

  try {
    gerandoExcel.value = true
    
    // Preparar dados dos filtros para o Excel (opcional para metadados)
    const dadosFiltros = {
      agente: filtrosDebounce.value.agenteOuContato,
      cliente: filtrosDebounce.value.classificacao,
      dataInicio: filtrosDebounce.value.dataInicial,
      dataFim: filtrosDebounce.value.dataFinal
    }
    
    // Gerar Excel com os dados filtrados
    const resultado = await gerarExcel(relatoriosFiltrados.value, dadosFiltros)
    
    const toast = await useToastSafe()
    if (resultado && resultado.success) {
      toast.success(`Excel gerado com sucesso: ${resultado.nomeArquivo}`)
    } else {
      toast.error('Erro ao gerar Excel')
    }
  } catch (error) {
    console.error('Erro ao gerar Excel:', error)
    const toast = await useToastSafe()
    toast.error('Erro ao gerar Excel')
  } finally {
    gerandoExcel.value = false
  }
}

// Função para formatar data
function formatarData(data: string | null): string {
  if (!data) return 'Não informado'
  try {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return data
  }
}
</script>