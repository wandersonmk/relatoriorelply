<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useClientesAtendimento, type ClienteAtendimento } from '../composables/useClientesAtendimento'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

const clientes = ref<ClienteAtendimento[]>([])

if (isClient) {
  const { clientes: clientesAtendimento, isLoading: loadingAtendimento, error: errorAtendimento, fetchClientesAtendimento } = useClientesAtendimento()
  
  onMounted(async () => {
    console.log('🚀 Carregando clientes da página...')
    isLoading.value = true
    error.value = ''
    
    try {
      await fetchClientesAtendimento()
      clientes.value = clientesAtendimento.value
      console.log('✅ Clientes carregados:', clientes.value.length)
    } catch (e) {
      console.error('❌ Erro ao carregar clientes:', e)
      error.value = 'Erro ao carregar clientes dos atendimentos.'
    } finally {
      isLoading.value = false
    }
  })

  // Watch para erros do composable
  watch(errorAtendimento, (newError) => {
    if (newError) {
      error.value = newError
    }
  })
  
  // Watch para loading do composable
  watch(loadingAtendimento, (newLoading) => {
    isLoading.value = newLoading
  })

  // Watch para atualizar clientes quando dados mudarem
  watch(clientesAtendimento, (newClientes) => {
    clientes.value = newClientes
  })
} else {
  isLoading.value = false
}
</script>

<template>
  <div>
    <!-- Sempre mostra loading até o client buscar os dados -->
    <AppLoading 
      v-if="isLoading || !isClient" 
      title="Carregando Clientes"
      description="Preparando visão geral dos clientes..."
    />
    <!-- Conteúdo só aparece após carregamento client-side -->
    <div v-else class="space-y-6">
      <ClientesManager :clientes="clientes" />
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>
    </div>
  </div>
</template>
