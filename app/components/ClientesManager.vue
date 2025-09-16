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
      <div class="flex items-center space-x-3">
        <!-- Botão PDF -->
        <button
          @click="exportToPDF"
          :disabled="!props.clientes || props.clientes.length === 0 || gerandoPDF"
          class="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <font-awesome-icon :icon="gerandoPDF ? 'spinner' : 'file-pdf'" :class="{ 'animate-spin': gerandoPDF, 'w-4 h-4': true }" />
          <span>{{ gerandoPDF ? 'Gerando PDF...' : 'Exportar PDF' }}</span>
        </button>
        
        <!-- Botão Excel -->
        <button
          @click="exportToExcel"
          :disabled="!props.clientes || props.clientes.length === 0 || gerandoExcel"
          class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-muted disabled:text-muted-foreground rounded-lg transition-colors text-sm font-medium shadow-sm"
        >
          <font-awesome-icon :icon="gerandoExcel ? 'spinner' : 'file-excel'" :class="{ 'animate-spin': gerandoExcel, 'w-4 h-4': true }" />
          <span>{{ gerandoExcel ? 'Gerando Excel...' : 'Exportar Excel' }}</span>
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
        <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
          <font-awesome-icon icon="trash" class="w-8 h-8 text-red-600" />
        </div>
        
        <h3 class="text-xl font-semibold text-foreground text-center mb-2">
          Confirmar Exclusão
        </h3>
        
        <p class="text-muted-foreground text-center mb-6">
          Deseja excluir o cliente 
          <strong class="text-foreground">{{ clienteParaExcluir.contact_name }}</strong>?
          <br><br>
          <span class="text-red-600 font-medium">⚠️ Serão removidos TODOS os {{ clienteParaExcluir.total_atendimentos }} atendimento{{ clienteParaExcluir.total_atendimentos === 1 ? '' : 's' }}!</span>
        </p>
        
        <div class="flex space-x-3">
          <button
            @click="cancelarExclusao"
            class="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            @click="excluirClienteSimples"
            class="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
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

    <!-- Toast customizado -->
    <div 
      v-if="showToast"
      class="fixed top-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl shadow-2xl z-[9999] flex items-center space-x-3 animate-fade-in backdrop-blur-sm border border-green-400/20"
      style="z-index: 10000;"
    >
      <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
        <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div class="flex flex-col">
        <span class="font-semibold text-sm">Sucesso</span>
        <span class="text-sm opacity-90">{{ toastMessage }}</span>
      </div>
      <button 
        @click="showToast = false"
        class="ml-2 text-white/60 hover:text-white transition-colors"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.95);
  }
}

.animate-fade-in {
  animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-fade-out {
  animation: fade-out 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

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

// Composable para puxar o nome da empresa (usando o mesmo do sidebar)
const { nomeEmpresa, fetchUsuarioData } = useUsuario()

// Buscar nome da empresa ao montar o componente
onMounted(async () => {
  await fetchUsuarioData()
  console.log('[ClientesManager] Nome da empresa:', nomeEmpresa.value)
})

// Estado para mock loading/error (já que os dados vem da página)
const isLoading = ref(false)
const error = ref('')

// Estado para modal de confirmação de exclusão
const clienteParaExcluir = ref<ClienteAtendimento | null>(null)

// Estado para toast customizado
const showToast = ref(false)
const toastMessage = ref('')

// Estados de loading para exportação
const gerandoPDF = ref(false)
const gerandoExcel = ref(false)

// Função para mostrar toast customizado
const mostrarToast = (mensagem: string) => {
  toastMessage.value = mensagem
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

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

// Função para mostrar modal de confirmação
const confirmarExclusao = (cliente: ClienteAtendimento) => {
  clienteParaExcluir.value = cliente
}

// Função para cancelar exclusão
const cancelarExclusao = () => {
  clienteParaExcluir.value = null
}

// Função para excluir cliente do banco de dados
const excluirClienteSimples = async () => {
  if (!clienteParaExcluir.value) return
  
  try {
    const supabase = useSupabaseClient()
    
    const { error } = await supabase
      .from('Atendimentos_Pizarro')
      .delete()
      .eq('contact_name', clienteParaExcluir.value.contact_name)
      .eq('contact_phone', clienteParaExcluir.value.contact_phone)
    
    // Fechar modal
    clienteParaExcluir.value = null
    
    if (!error) {
      // Mostrar toast de sucesso
      mostrarToast('Cliente excluído com sucesso!')
      // Recarregar dados
      emit('clienteExcluido')
    } else {
      mostrarToast('Erro ao excluir cliente!')
      console.error('Erro ao excluir:', error)
    }
  } catch (e) {
    mostrarToast('Erro inesperado!')
    console.error('Erro:', e)
    clienteParaExcluir.value = null
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
            // Adicionar horário meio-dia para evitar problemas de timezone
            const isoFormat = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T12:00:00`
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
  if (gerandoPDF.value) return
  
  try {
    gerandoPDF.value = true
    mostrarToast('Gerando relatório PDF...')
    
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Header com fundo roxo
    doc.setFillColor(102, 90, 228) // Cor roxa (RGB: 102, 90, 228)
    doc.rect(0, 0, 210, 45, 'F') // Retângulo roxo no topo

    // Título principal
    doc.setTextColor(255, 255, 255) // Texto branco
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    const empresa = nomeEmpresa.value || 'Sistema de Relatórios'
    doc.text(empresa, 20, 20)

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

    // Cabeçalho da tabela com fundo roxo - layout simples e organizado
    let yPosition = 100
    doc.setFillColor(102, 90, 228) // Cor roxa para cabeçalho
    doc.rect(20, yPosition - 10, 170, 15, 'F') // Retângulo roxo para cabeçalho

    // Texto do cabeçalho em branco
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('#', 25, yPosition - 2)
    doc.text('Nome', 35, yPosition - 2)
    doc.text('Telefone', 85, yPosition - 2)
    doc.text('Atend.', 125, yPosition - 2)
    doc.text('Primeiro', 145, yPosition - 2)
    doc.text('Último', 170, yPosition - 2)

    // Resetar cor do texto para preto
    doc.setTextColor(0, 0, 0)
    yPosition += 15

    // Função para formatar data de forma segura para PDF
    const formatarDataPDF = (dataString: string | null): string => {
      if (!dataString) return 'N/A'
      
      try {
        let data: Date | null = null
        
        if (dataString.includes('/')) {
          const parts = dataString.split(' ')
          const datePart = parts[0]
          
          if (datePart) {
            const dateComponents = datePart.split('/')
            if (dateComponents.length === 3) {
              const [day, month, year] = dateComponents
              if (day && month && year) {
                data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              }
            }
          }
        } else if (dataString.includes('-')) {
          data = new Date(dataString)
        }
        
        if (data && !isNaN(data.getTime())) {
          return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          }) // Apenas dia/mês para economizar espaço
        }
        
        return 'N/A'
      } catch (error) {
        return 'N/A'
      }
    }

    // Dados dos clientes
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    props.clientes.forEach((cliente, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 30
        
        // Repetir cabeçalho na nova página
        doc.setFillColor(102, 90, 228)
        doc.rect(20, yPosition - 10, 170, 15, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('#', 25, yPosition - 2)
        doc.text('Nome', 35, yPosition - 2)
        doc.text('Telefone', 85, yPosition - 2)
        doc.text('Atend.', 125, yPosition - 2)
        doc.text('Primeiro', 145, yPosition - 2)
        doc.text('Último', 170, yPosition - 2)
        
        doc.setTextColor(0, 0, 0)
        yPosition += 15
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
      }

      // Cor de fundo alternada para as linhas
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251) // Cinza claro
        doc.rect(20, yPosition - 8, 170, 12, 'F')
      }

      // Dados da linha
      doc.text((index + 1).toString(), 25, yPosition)
      
      // Nome (truncar se muito longo)
      const nome = cliente.contact_name.length > 20 ? cliente.contact_name.substring(0, 20) + '...' : cliente.contact_name
      doc.text(nome, 35, yPosition)
      
      // Telefone
      const telefone = cliente.contact_phone || 'N/A'
      doc.text(telefone, 85, yPosition)
      
      // Atendimentos
      doc.text(cliente.total_atendimentos.toString(), 125, yPosition)
      
      // Primeiro contato
      doc.text(formatarDataPDF(cliente.primeiro_atendimento), 145, yPosition)
      
      // Último contato
      doc.text(formatarDataPDF(cliente.ultimo_atendimento), 170, yPosition)
      
      yPosition += 12
    })

    // Salvar o PDF
    doc.save('lista-clientes-atendimentos.pdf')
    mostrarToast('PDF gerado com sucesso!')
  } catch (error) {
    console.error('Erro ao exportar PDF:', error)
    mostrarToast('Erro ao gerar PDF!')
  } finally {
    gerandoPDF.value = false
  }
}

// Função para exportar para Excel
const exportToExcel = async () => {
  if (gerandoExcel.value) return
  
  try {
    gerandoExcel.value = true
    mostrarToast('Gerando planilha Excel...')
    
    const XLSX = await import('xlsx')

    // Função para formatar data de forma segura
    const formatarDataSegura = (dataString: string | null): string => {
      if (!dataString) return 'N/A'
      
      try {
        // Tentar múltiplos formatos de parsing
        let data: Date | null = null
        
        // Se está no formato brasileiro DD/MM/YYYY
        if (dataString.includes('/')) {
          const parts = dataString.split(' ')
          const datePart = parts[0]
          
          if (datePart) {
            const dateComponents = datePart.split('/')
            if (dateComponents.length === 3) {
              const [day, month, year] = dateComponents
              if (day && month && year) {
                // Criar data explicitamente
                data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
              }
            }
          }
        }
        // Se está no formato ISO
        else if (dataString.includes('-')) {
          data = new Date(dataString)
        }
        
        // Verificar se a data é válida
        if (data && !isNaN(data.getTime())) {
          return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        }
        
        return 'N/A'
      } catch (error) {
        console.error('Erro ao formatar data:', dataString, error)
        return 'N/A'
      }
    }

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
    const empresa = nomeEmpresa.value || 'Sistema de Relatórios'
    const dadosExcel = [
      // Cabeçalho do sistema
      [`${empresa} - Sistema de Relatórios`],
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
        formatarDataSegura(cliente.primeiro_atendimento),
        formatarDataSegura(cliente.ultimo_atendimento)
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
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // [Empresa] - Sistema de Relatórios
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // Relatórios de Clientes dos Atendimentos
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // Gerado em
      { s: { r: 3, c: 0 }, e: { r: 3, c: 5 } }  // Total de registros
    ]

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes dos Atendimentos')

    // Salvar arquivo
    XLSX.writeFile(workbook, 'clientes-dos-atendimentos.xlsx')
    mostrarToast('Excel gerado com sucesso!')
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    mostrarToast('Erro ao gerar Excel!')
  } finally {
    gerandoExcel.value = false
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
