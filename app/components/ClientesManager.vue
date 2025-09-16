<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com título e botões de exportação -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div>
        <h2 class="text-xl font-semibold text-foreground">Lista de Clientes</h2>
        <p class="text-sm text-muted-foreground mt-1">Gerencie todos os seus clientes</p>
        <p v-if="clientes && clientes.length > 0" class="text-xs text-muted-foreground mt-1">
          Total de clientes: <span class="font-semibold text-primary">{{ clientes.length }}</span>
        </p>
      </div>
      
      <!-- Botões de exportação -->
      <div class="flex items-center space-x-2">
        <button
          @click="exportToPDF"
          class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para PDF"
        >
          <font-awesome-icon icon="file-pdf" class="w-4 h-4" />
          <span>PDF</span>
        </button>
        
        <button
          @click="exportToExcel"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          title="Exportar para Excel"
        >
          <font-awesome-icon icon="file-excel" class="w-4 h-4" />
          <span>Excel</span>
        </button>
      </div>
    </div>

      <!-- Lista de clientes -->
    <div class="p-6">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-muted-foreground animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-foreground mb-2">Carregando clientes...</h3>
          <p class="text-muted-foreground">Aguarde um momento</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-8">
        <div class="flex flex-col items-center">
          <font-awesome-icon 
            icon="exclamation-triangle" 
            class="w-12 h-12 text-red-500 mb-4" 
          />
          <h3 class="text-lg font-medium text-foreground mb-2">Erro ao carregar clientes</h3>
          <p class="text-muted-foreground mb-4">{{ error }}</p>
          <button
            @click="recarregarClientes"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>

      <!-- Mensagem quando não há clientes -->
      <div v-else-if="clientes.length === 0" class="text-center py-8">
        <div class="flex flex-col items-center">
          <font-awesome-icon 
            icon="users" 
            class="w-12 h-12 text-muted-foreground/50 mb-4" 
          />
          <h3 class="text-lg font-medium text-foreground mb-2">Nenhum cliente encontrado</h3>
          <p class="text-muted-foreground">Quando você tiver clientes, eles aparecerão aqui.</p>
        </div>
      </div>

      <!-- Tabela de clientes -->
      <div v-else class="overflow-x-auto">
  <div style="max-height: 600px; overflow-y: auto;">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Nome</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Telefone</th>
                <th class="text-left py-2 px-3 font-medium text-muted-foreground text-xs">Atendimentos</th>
                <th class="text-right py-2 px-3 font-medium text-muted-foreground text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(cliente, index) in (clientesOrdenados ? clientesOrdenados.slice(0, clientesVisiveis) : [])" 
                :key="`${cliente.contact_name}-${cliente.contact_phone}`"
                class="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <!-- Nome do cliente -->
                <td class="py-3 px-3">
                  <div class="flex items-center">
                    <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <font-awesome-icon icon="user" class="w-3 h-3 text-primary" />
                    </div>
                    <span class="font-medium text-foreground text-sm">{{ cliente.contact_name }}</span>
                  </div>
                </td>
                
                <!-- Telefone do cliente -->
                <td class="py-3 px-3">
                  <span class="text-foreground text-sm">{{ cliente.contact_phone || 'Não informado' }}</span>
                </td>
                
                <!-- Número de atendimentos -->
                <td class="py-3 px-3">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {{ cliente.total_atendimentos }} atendimento{{ cliente.total_atendimentos === 1 ? '' : 's' }}
                  </span>
                </td>
                
                <!-- Botões de ação -->
                <td class="py-3 px-3 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <!-- Botão WhatsApp -->
                    <button
                      v-if="cliente.contact_phone"
                      @click="abrirWhatsApp(cliente)"
                      class="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200 group"
                      title="Conversar no WhatsApp"
                    >
                      <font-awesome-icon 
                        icon="comments" 
                        class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                      />
                    </button>
                    
                    <!-- Botão de histórico -->
                    <button
                      @click="verHistorico(cliente)"
                      class="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 group"
                      title="Ver histórico de atendimentos"
                    >
                      <font-awesome-icon 
                        icon="clipboard-list" 
                        class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                      />
                    </button>
                    
                    <!-- Botão de excluir -->
                    <button
                      @click="confirmarExclusao(cliente)"
                      class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                      title="Excluir cliente"
                    >
                      <font-awesome-icon 
                        icon="trash" 
                        class="w-4 h-4 group-hover:scale-110 transition-transform duration-200" 
                      />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Sentinel para infinite scroll -->
              <tr v-if="props.clientes && clientesVisiveis < props.clientes.length">
                <td :colspan="4">
                  <div ref="sentinel" style="height: 1px;"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de confirmação de exclusão -->
    <div 
      v-if="clienteParaExcluir"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <font-awesome-icon icon="exclamation-triangle" class="w-6 h-6 text-red-600" />
        </div>
        
        <h3 class="text-lg font-semibold text-foreground text-center mb-2">
          Confirmar exclusão
        </h3>
        
        <p class="text-muted-foreground text-center mb-6">
          Tem certeza que deseja excluir o cliente 
          <strong class="text-foreground">{{ clienteParaExcluir.contact_name }}</strong>?
          <br><br>
          <span class="text-red-600 font-medium">⚠️ Esta ação irá remover TODOS os {{ clienteParaExcluir.total_atendimentos }} atendimento{{ clienteParaExcluir.total_atendimentos === 1 ? '' : 's' }} deste cliente!</span>
          <br>
          Esta ação não pode ser desfeita.
        </p>
        
        <div class="flex space-x-3">
          <button
            @click="cancelarExclusao"
            class="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="excluirCliente"
            class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de histórico de atendimentos -->
    <div 
      v-if="clienteHistorico"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border">
        <!-- Header do modal -->
        <div class="flex items-center justify-between p-6 border-b border-border">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <font-awesome-icon icon="clipboard-list" class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-foreground">
                Histórico de Atendimentos
              </h3>
              <p class="text-sm text-muted-foreground">
                {{ clienteHistorico.contact_name }} - {{ clienteHistorico.contact_phone }}
              </p>
            </div>
          </div>
          <button
            @click="fecharHistorico"
            class="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Fechar"
          >
            <font-awesome-icon icon="times" class="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <!-- Resumo -->
        <div class="p-4 bg-muted/30 border-b border-border">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ clienteHistorico.total_atendimentos }}</div>
              <div class="text-sm text-muted-foreground">Total de Atendimentos</div>
            </div>
            <div class="text-center">
              <div class="text-sm font-medium text-foreground">
                {{ formatarDataSimples(clienteHistorico.primeiro_atendimento) }}
              </div>
              <div class="text-sm text-muted-foreground">Primeiro Atendimento</div>
            </div>
            <div class="text-center">
              <div class="text-sm font-medium text-foreground">
                {{ formatarDataSimples(clienteHistorico.ultimo_atendimento) }}
              </div>
              <div class="text-sm text-muted-foreground">Último Atendimento</div>
            </div>
          </div>
        </div>

        <!-- Lista de atendimentos -->
        <div class="flex-1 overflow-y-auto max-h-[50vh]">
          <!-- Loading -->
          <div v-if="loadingHistorico" class="flex items-center justify-center py-12">
            <div class="flex flex-col items-center space-y-3">
              <font-awesome-icon icon="spinner" class="w-8 h-8 text-blue-600 animate-spin" />
              <p class="text-muted-foreground">Carregando histórico...</p>
            </div>
          </div>

          <!-- Lista de atendimentos -->
          <div v-else-if="historicoDetalhado.length > 0" class="p-4 space-y-4">
            <div 
              v-for="(atendimento, index) in historicoDetalhado" 
              :key="index"
              class="bg-muted/20 rounded-lg p-4 border border-border/50"
            >
              <!-- Header do atendimento -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="ticket" class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 class="font-medium text-foreground">{{ atendimento.ticket_number || `Atendimento #${index + 1}` }}</h4>
                    <p class="text-xs text-muted-foreground">
                      {{ formatarData(atendimento.service_start_time) }} • Agente: {{ atendimento.agent_name }}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Score: {{ atendimento.service_score }}
                  </span>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ atendimento.service_time || 'Tempo não informado' }}
                  </div>
                </div>
              </div>

              <!-- Detalhes do atendimento -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <!-- Solicitação -->
                <div v-if="atendimento.contact_request">
                  <h5 class="font-medium text-foreground mb-1">Solicitação:</h5>
                  <p class="text-muted-foreground">{{ atendimento.contact_request }}</p>
                </div>

                <!-- Classificação -->
                <div v-if="atendimento.service_classification">
                  <h5 class="font-medium text-foreground mb-1">Classificação:</h5>
                  <p class="text-muted-foreground">{{ atendimento.service_classification }}</p>
                </div>

                <!-- Solução -->
                <div v-if="atendimento.agent_solution" class="md:col-span-2">
                  <h5 class="font-medium text-foreground mb-1">Solução:</h5>
                  <p class="text-muted-foreground">{{ atendimento.agent_solution }}</p>
                </div>

                <!-- Nota do cliente -->
                <div v-if="atendimento.customer_note" class="md:col-span-2">
                  <h5 class="font-medium text-foreground mb-1">Feedback do Cliente:</h5>
                  <p class="text-muted-foreground italic">"{{ atendimento.customer_note }}"</p>
                </div>

                <!-- Resumo -->
                <div v-if="atendimento.service_summary" class="md:col-span-2">
                  <h5 class="font-medium text-foreground mb-1">Resumo:</h5>
                  <p class="text-muted-foreground">{{ atendimento.service_summary }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vazio -->
          <div v-else class="flex items-center justify-center py-12">
            <div class="flex flex-col items-center space-y-3">
              <font-awesome-icon icon="exclamation-circle" class="w-12 h-12 text-muted-foreground/50" />
              <p class="text-muted-foreground">Nenhum atendimento encontrado</p>
            </div>
          </div>
        </div>

        <!-- Footer do modal -->
        <div class="p-4 border-t border-border bg-muted/20">
          <div class="flex justify-end">
            <button
              @click="fecharHistorico"
              class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
import type { ClienteAtendimento } from '../composables/useClientesAtendimento'

// Props recebidas da página
interface Props {
  clientes: ClienteAtendimento[]
}

const props = defineProps<Props>()

// Eventos emitidos para a página pai
const emit = defineEmits<{
  clienteExcluido: []
}>()

// Estado para mock loading/error (já que os dados vem da página)
const isLoading = ref(false)
const error = ref('')

// Estado para modal de confirmação de exclusão
const clienteParaExcluir = ref<ClienteAtendimento | null>(null)

// Estado para modal de histórico
const clienteHistorico = ref<ClienteAtendimento | null>(null)
const historicoDetalhado = ref<any[]>([])
const loadingHistorico = ref(false)

// Infinite scroll
const clientesVisiveis = ref(10)
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Setup infinite scroll
  nextTick(() => {
    if (sentinel.value && props.clientes && props.clientes.length > 10) {
      if (!observer) {
        observer = new IntersectionObserver((entries) => {
          const entry = entries[0]
          if (entry && entry.isIntersecting) {
            if (clientesVisiveis.value < props.clientes.length) {
              clientesVisiveis.value += 10
            }
          }
        })
        observer.observe(sentinel.value)
      }
    }
  })
})

watch(
  () => props.clientes?.length,
  () => {
    if (sentinel.value && props.clientes && props.clientes.length > 10) {
      if (!observer) {
        observer = new IntersectionObserver((entries) => {
          const entry = entries[0]
          if (entry && entry.isIntersecting) {
            if (clientesVisiveis.value < props.clientes.length) {
              clientesVisiveis.value += 10
            }
          }
        })
        observer.observe(sentinel.value)
      }
    }
  }
)

// Função para recarregar clientes (placeholder - página é que controla)
const recarregarClientes = () => {
  // Nada aqui, apenas placeholder para o template
  window.location.reload()
}

// Função para confirmar exclusão
const confirmarExclusao = (cliente: ClienteAtendimento) => {
  clienteParaExcluir.value = cliente
}

// Função para cancelar exclusão
const cancelarExclusao = () => {
  clienteParaExcluir.value = null
}

// Função para excluir cliente (remove todos os atendimentos do cliente)
const excluirCliente = async () => {
  if (clienteParaExcluir.value) {
    try {
      // Usar supabase para excluir todos os atendimentos do cliente
      const supabase = useSupabaseClient()
      
      const { error } = await supabase
        .from('Atendimentos_Pizarro')
        .delete()
        .eq('contact_name', clienteParaExcluir.value.contact_name)
        .eq('contact_phone', clienteParaExcluir.value.contact_phone)
      
      if (error) {
        console.error('Erro ao excluir cliente:', error)
        alert('Erro ao excluir cliente. Tente novamente.')
      } else {
        console.log('✅ Cliente excluído com sucesso')
        alert('Cliente excluído com sucesso!')
        
        // Emitir evento para a página recarregar os dados
        emit('clienteExcluido')
      }
    } catch (e) {
      console.error('Erro ao excluir cliente:', e)
      alert('Erro ao excluir cliente. Tente novamente.')
    } finally {
      clienteParaExcluir.value = null
    }
  }
}

// Função para abrir WhatsApp
const abrirWhatsApp = (cliente: ClienteAtendimento) => {
  if (!cliente.contact_phone) return
  const numeroLimpo = cliente.contact_phone.replace(/\D/g, '')
  const url = `https://wa.me/55${numeroLimpo}`
  window.open(url, '_blank')
}

// Função para ver histórico de atendimentos
const verHistorico = async (cliente: ClienteAtendimento) => {
  clienteHistorico.value = cliente
  loadingHistorico.value = true
  historicoDetalhado.value = []
  
  try {
    const supabase = useSupabaseClient()
    
    const { data, error } = await supabase
      .from('Atendimentos_Pizarro')
      .select('*')
      .eq('contact_name', cliente.contact_name)
      .eq('contact_phone', cliente.contact_phone)
      .order('service_start_time', { ascending: false })
    
    if (error) {
      console.error('Erro ao buscar histórico:', error)
      alert('Erro ao carregar histórico de atendimentos.')
    } else {
      historicoDetalhado.value = data || []
      console.log('✅ Histórico carregado:', data?.length, 'atendimentos')
    }
  } catch (e) {
    console.error('Erro ao buscar histórico:', e)
    alert('Erro ao carregar histórico de atendimentos.')
  } finally {
    loadingHistorico.value = false
  }
}

// Função para fechar modal de histórico
const fecharHistorico = () => {
  clienteHistorico.value = null
  historicoDetalhado.value = []
}

// Função para formatar datas considerando diferentes formatos
const formatarData = (dataString: string | null) => {
  if (!dataString) return 'N/A'
  
  try {
    let date: Date
    
    // Se já está no formato brasileiro DD/MM/YYYY, usar diretamente
    if (dataString.includes('/')) {
      // Formato: "28/08/2025 22:26" -> já está no formato correto, só converter para Date
      const parts = dataString.split(' ')
      const datePart = parts[0]
      const timePart = parts[1] || ''
      
      if (datePart) {
        const dateComponents = datePart.split('/')
        if (dateComponents.length === 3) {
          const [day, month, year] = dateComponents
          if (day && month && year) {
            // Converter para formato ISO para criar Date, mas depois formatar como brasileiro
            const isoFormat = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${timePart ? ' ' + timePart : ''}`
            date = new Date(isoFormat)
          } else {
            throw new Error('Formato de data inválido')
          }
        } else {
          throw new Error('Formato de data inválido')
        }
      } else {
        throw new Error('Formato de data inválido')
      }
    }
    // Se está no formato ISO (YYYY-MM-DD), converter
    else if (dataString.includes('-') && dataString.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dataString)
    }
    // Fallback: tentar parsing direto
    else {
      date = new Date(dataString)
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida')
    }
    
    // Sempre retornar no formato brasileiro DD/MM/YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    
    return `${day}/${month}/${year} ${hours}:${minutes}`
    
  } catch (e) {
    console.error('Erro ao formatar data:', dataString, e)
    return 'Data inválida'
  }
}

// Função para formatar apenas a data (sem hora) no formato DD/MM/YYYY
const formatarDataSimples = (dataString: string | null) => {
  if (!dataString) return 'N/A'
  
  try {
    let date: Date
    
    // Se já está no formato brasileiro DD/MM/YYYY
    if (dataString.includes('/')) {
      const parts = dataString.split(' ')
      const datePart = parts[0]
      
      if (datePart) {
        const dateComponents = datePart.split('/')
        if (dateComponents.length === 3) {
          const [day, month, year] = dateComponents
          if (day && month && year) {
            const isoFormat = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
            date = new Date(isoFormat)
          } else {
            throw new Error('Formato de data inválido')
          }
        } else {
          throw new Error('Formato de data inválido')
        }
      } else {
        throw new Error('Formato de data inválido')
      }
    }
    // Se está no formato ISO (YYYY-MM-DD)
    else if (dataString.includes('-') && dataString.match(/^\d{4}-\d{2}-\d{2}/)) {
      date = new Date(dataString)
    }
    // Fallback
    else {
      date = new Date(dataString)
    }
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      throw new Error('Data inválida')
    }
    
    // Retornar apenas no formato DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    
    return `${day}/${month}/${year}`
    
  } catch (e) {
    console.error('Erro ao formatar data simples:', dataString, e)
    return 'Data inválida'
  }
}

// Função para exportar para PDF
const exportToPDF = async () => {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Header com fundo roxo
    doc.setFillColor(102, 90, 228) // Cor roxa (RGB: 102, 90, 228)
    doc.rect(0, 0, 210, 45, 'F') // Retângulo roxo no topo

    // Título principal
    doc.setTextColor(255, 255, 255) // Texto branco
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Wise Digital', 20, 20)

    // Subtítulo
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Sistema de Relatórios', 20, 35)

    // Resetar cor do texto para preto
    doc.setTextColor(0, 0, 0)

    // Título da seção
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Lista de Clientes dos Atendimentos', 20, 65)

    // Informações de geração
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Gerado em: ${dataFormatada}, ${horaFormatada}`, 20, 75)
    doc.text(`Total de clientes: ${props.clientes.length}`, 20, 85)

    // Cabeçalho da tabela com fundo roxo
    let yPosition = 100
    doc.setFillColor(102, 90, 228) // Cor roxa para cabeçalho
    doc.rect(20, yPosition - 10, 170, 15, 'F') // Retângulo roxo para cabeçalho

    // Texto do cabeçalho em branco
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('#', 25, yPosition - 2)
    doc.text('Nome', 40, yPosition - 2)
    doc.text('Telefone', 100, yPosition - 2)
    doc.text('Atendimentos', 150, yPosition - 2)

    // Resetar cor do texto para preto
    doc.setTextColor(0, 0, 0)
    yPosition += 10

    // Dados dos clientes
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    props.clientes.forEach((cliente, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
        
        // Repetir cabeçalho na nova página
        doc.setFillColor(102, 90, 228)
        doc.rect(20, yPosition - 10, 170, 15, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('#', 25, yPosition - 2)
        doc.text('Nome', 40, yPosition - 2)
        doc.text('Telefone', 100, yPosition - 2)
        doc.text('Atendimentos', 150, yPosition - 2)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        yPosition += 10
      }

      // Cor de fundo alternada para as linhas
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251) // Cinza claro
        doc.rect(20, yPosition - 8, 170, 12, 'F')
      }

      // Dados da linha
      doc.text((index + 1).toString(), 25, yPosition)
      doc.text(cliente.contact_name, 40, yPosition)
      doc.text(cliente.contact_phone || 'N/A', 100, yPosition)
      doc.text(cliente.total_atendimentos.toString(), 150, yPosition)
      
      yPosition += 12
    })

    // Salvar o PDF
    doc.save('lista-clientes-atendimentos.pdf')
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    alert('Erro ao exportar PDF. Tente novamente.')
  }
}

// Função para exportar para Excel
const exportToExcel = async () => {
  try {
    const XLSX = await import('xlsx')

    // Criar dados do cabeçalho
    const agora = new Date()
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    // Preparar dados com todas as colunas conforme a nova estrutura
    const dadosExcel = [
      // Cabeçalho do sistema
      ['Wise Digital - Sistema de Relatórios'],
      ['Relatórios de Clientes dos Atendimentos'],
      [`Gerado em: ${dataFormatada}, ${horaFormatada}`],
      [`Total de registros: ${props.clientes.length}`],
      [], // Linha vazia
      // Cabeçalho da tabela
      ['#', 'Nome', 'Telefone', 'Total Atendimentos', 'Primeiro Contato', 'Último Contato']
    ]

    // Adicionar dados dos clientes
    props.clientes.forEach((cliente, index) => {
      dadosExcel.push([
        (index + 1).toString(), // Numeração
        cliente.contact_name,
        cliente.contact_phone || 'N/A',
        cliente.total_atendimentos.toString(),
        cliente.primeiro_atendimento ? new Date(cliente.primeiro_atendimento).toLocaleDateString('pt-BR') : 'N/A',
        cliente.ultimo_atendimento ? new Date(cliente.ultimo_atendimento).toLocaleDateString('pt-BR') : 'N/A'
      ])
    })

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(dadosExcel)

    // Definir larguras das colunas
    const columnWidths = [
      { wch: 5 },  // #
      { wch: 25 }, // Nome
      { wch: 15 }, // Telefone
      { wch: 15 }, // Total Atendimentos
      { wch: 15 }, // Primeiro Contato
      { wch: 15 }  // Último Contato
    ]
    worksheet['!cols'] = columnWidths

    // Estilizar cabeçalho (se suportado)
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
    
    // Mesclar células do título principal
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // Wise Digital - Sistema de Relatórios
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Relatórios de Clientes dos Atendimentos
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Gerado em
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }  // Total de registros
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes dos Atendimentos')

    // Salvar arquivo
    XLSX.writeFile(workbook, 'clientes-dos-atendimentos.xlsx')
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao exportar Excel. Tente novamente.')
  }
}

// Computed para clientes ordenados por nome (A-Z)
import { computed } from 'vue'
const clientesOrdenados = computed(() => {
  return props.clientes ? [...props.clientes].sort((a, b) => {
    if (!a.contact_name || !b.contact_name) return 0
    return a.contact_name.localeCompare(b.contact_name, 'pt-BR', { sensitivity: 'base' })
  }) : []
})
</script>
