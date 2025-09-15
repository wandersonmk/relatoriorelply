<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Atendimentos Pizarro</h2>
        <p class="text-sm text-muted-foreground mt-1">Acompanhe todos os registros de atendimento</p>
        <p v-if="relatoriosFiltrados && relatoriosFiltrados.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de registros: <span class="font-semibold text-primary">{{ relatoriosFiltrados.length }}</span>
        </p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="p-6 border-b border-border bg-muted/30">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filtro por Data Inicial -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Inicial</label>
          <input
            v-model="filtros.dataInicial"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Data Final -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Data Final</label>
          <input
            v-model="filtros.dataFinal"
            type="date"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Nome do Agente -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Agente ou Contato</label>
          <input
            v-model="filtros.agenteOuContato"
            type="text"
            placeholder="Digite nome"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <!-- Filtro por Classificação -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Classificação</label>
          <input
            v-model="filtros.classificacao"
            type="text"
            placeholder="Digite classificação"
            class="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
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
        <font-awesome-icon icon="inbox" class="w-12 h-12" />
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
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Nota</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Solução</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Obs. Cliente</th>
              <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Resumo</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="relatorio in relatoriosOrdenados" 
              :key="relatorio.ticket_number"
              class="border-b border-border/50 hover:bg-muted/30 transition-colors"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  agenteOuContato: string
  classificacao: string
}

// Usar o composable de relatórios
const { 
  relatorios: relatoriosData, 
  isLoading, 
  error, 
  fetchRelatorios, 
  clearError 
} = useRelatorios()

// Estados reativos
const filtros = ref<Filtros>({
  dataInicial: '',
  dataFinal: '',
  agenteOuContato: '',
  classificacao: ''
})

// Carregar relatórios quando o componente for montado
onMounted(() => {
  fetchRelatorios()
})

// Computed para detectar se há filtros ativos
const filtrosAplicados = computed(() => {
  return filtros.value.dataInicial !== '' || 
         filtros.value.dataFinal !== '' || 
         filtros.value.agenteOuContato !== '' || 
         filtros.value.classificacao !== ''
})

// Computed para relatórios filtrados
const relatoriosFiltrados = computed(() => {
  let resultado = relatoriosData.value

  if (filtros.value.dataInicial) {
    resultado = resultado.filter(r => {
      if (!r.service_start_time) return false
      const dataRelatorio = new Date(r.service_start_time)
      const dataFiltro = new Date(filtros.value.dataInicial)
      return dataRelatorio >= dataFiltro
    })
  }

  if (filtros.value.dataFinal) {
    resultado = resultado.filter(r => {
      if (!r.service_start_time) return false
      const dataRelatorio = new Date(r.service_start_time)
      const dataFiltro = new Date(filtros.value.dataFinal)
      return dataRelatorio <= dataFiltro
    })
  }

  if (filtros.value.agenteOuContato) {
    const termo = filtros.value.agenteOuContato.toLowerCase()
    resultado = resultado.filter(r => 
      r.agent_name.toLowerCase().includes(termo) || 
      (r.contact_name && r.contact_name.toLowerCase().includes(termo))
    )
  }

  if (filtros.value.classificacao) {
    resultado = resultado.filter(r =>
      r.service_classification && filtros.value.classificacao &&
      r.service_classification.toLowerCase() === filtros.value.classificacao.toLowerCase()
    )
  }

  return resultado
})

// Computed para ordenar relatórios por service_start_time (mais novos no topo)
const relatoriosOrdenados = computed(() => {
  return relatoriosFiltrados.value ? [...relatoriosFiltrados.value].sort((a, b) => {
    if (!a.service_start_time || !b.service_start_time) return 0
    return new Date(b.service_start_time).getTime() - new Date(a.service_start_time).getTime()
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
    agenteOuContato: '',
    classificacao: ''
  }
}

// Função para truncar texto
function truncateText(text: string | null, maxLength: number): string {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>