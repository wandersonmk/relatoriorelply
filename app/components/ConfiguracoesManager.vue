<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com ícone e descrição -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <font-awesome-icon 
            icon="cog" 
            class="w-5 h-5 text-white" 
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Configurações do Sistema</h2>
          <p class="text-sm text-muted-foreground">Gerencie as configurações e dados do sistema</p>
        </div>
      </div>
    </div>

    <!-- Conteúdo das configurações -->
    <div class="p-6 space-y-6">
      
      <!-- Seção: Gerenciamento de Dados -->
      <div class="space-y-4">
        <div class="flex items-center space-x-2 mb-4">
          <font-awesome-icon 
            icon="database" 
            class="w-5 h-5 text-muted-foreground" 
          />
          <h3 class="text-lg font-medium text-foreground">Gerenciamento de Dados</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Limpar Lista de Clientes -->
          <div class="bg-muted/30 border border-border rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mt-1">
                <font-awesome-icon 
                  icon="users" 
                  class="w-4 h-4 text-blue-600 dark:text-blue-400" 
                />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-foreground mb-1">Limpar Lista de Clientes</h4>
                <p class="text-sm text-muted-foreground mb-3">
                  Remove todos os clientes cadastrados no sistema. Esta ação não pode ser desfeita.
                </p>
                <button
                  @click="confirmarLimpezaClientes"
                  class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <font-awesome-icon icon="trash-alt" class="w-4 h-4" />
                  <span>Limpar Clientes</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Limpar Registros de Tickets -->
          <div class="bg-muted/30 border border-border rounded-lg p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mt-1">
                <font-awesome-icon 
                  icon="file-alt" 
                  class="w-4 h-4 text-red-600 dark:text-red-400" 
                />
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-foreground mb-1">Limpar Todos os Registros de Tickets</h4>
                <p class="text-sm text-muted-foreground mb-3">
                  Remove todos os registros de tickets do sistema. Esta ação não pode ser desfeita.
                </p>
                <button
                  @click="confirmarLimpezaTickets"
                  class="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <font-awesome-icon icon="trash-alt" class="w-4 h-4" />
                  <span>Limpar Tickets</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Aviso importante -->
      <div class="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div class="flex items-start space-x-3">
          <font-awesome-icon 
            icon="exclamation-triangle" 
            class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" 
          />
          <div>
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Atenção - Ações Irreversíveis
            </h4>
            <p class="text-sm text-yellow-700 dark:text-yellow-300">
              As ações de limpeza são permanentes e não podem ser desfeitas. 
              Certifique-se de fazer um backup dos dados importantes antes de prosseguir.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Modal de Confirmação para Clientes -->
  <div v-if="mostrarModalClientes" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <font-awesome-icon icon="users" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 class="text-lg font-semibold text-foreground">Confirmar Limpeza de Clientes</h3>
      </div>
      
      <p class="text-muted-foreground mb-6">
        Tem certeza que deseja remover todos os clientes do sistema? Esta ação não pode ser desfeita.
      </p>
      
      <div class="flex space-x-3">
        <button
          @click="mostrarModalClientes = false"
          class="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="limparClientes"
          class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmação para Tickets -->
  <div v-if="mostrarModalTickets" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
          <font-awesome-icon icon="file-alt" class="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="text-lg font-semibold text-foreground">Confirmar Limpeza de Tickets</h3>
      </div>
      
      <p class="text-muted-foreground mb-6">
        Tem certeza que deseja remover todos os registros de tickets do sistema? Esta ação não pode ser desfeita.
      </p>
      
      <div class="flex space-x-3">
        <button
          @click="mostrarModalTickets = false"
          class="flex-1 px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="limparTickets"
          class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '../composables/useSupabaseClient'
import { useToastSafe } from '../composables/useToastSafe'

const supabase = useSupabaseClient()

// Estados dos modais
const mostrarModalClientes = ref(false)
const mostrarModalTickets = ref(false)

// Função para confirmar limpeza de clientes
function confirmarLimpezaClientes() {
  mostrarModalClientes.value = true
}

// Função para confirmar limpeza de tickets
function confirmarLimpezaTickets() {
  mostrarModalTickets.value = true
}

// Função para limpar clientes (placeholder - sem ação de banco ainda)
async function limparClientes() {
  const toast = await useToastSafe();
  try {
    // Buscar todos os IDs dos clientes
    const { data, error: selectError } = await supabase.from('clientes').select('id')
    if (selectError) throw selectError
    if (data && data.length) {
      const { error: deleteError } = await supabase.from('clientes').delete().in('id', data.map(c => c.id))
      if (deleteError) throw deleteError
      toast?.success('Todos os clientes foram removidos com sucesso!')
    } else {
      toast?.info('Nenhum cliente para remover.')
    }
    mostrarModalClientes.value = false
  } catch (err) {
    toast?.error('Erro ao limpar clientes: ' + String(err))
  }
}

// Função para limpar tickets (placeholder - sem ação de banco ainda)
async function limparTickets() {
  const toast = await useToastSafe();
  try {
    const { data, error: selectError } = await supabase.from('relatorios').select('id')
    if (selectError) throw selectError
    if (data && data.length) {
      const { error: deleteError } = await supabase.from('relatorios').delete().in('id', data.map(r => r.id))
      if (deleteError) throw deleteError
      toast?.success('Todos os relatórios foram removidos com sucesso!')
    } else {
      toast?.info('Nenhum relatório para remover.')
    }
    mostrarModalTickets.value = false
  } catch (err) {
    toast?.error('Erro ao limpar relatórios: ' + String(err))
    mostrarModalTickets.value = false
  }
}
</script>
