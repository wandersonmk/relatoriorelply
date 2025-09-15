<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useClientes } from '../composables/useClientes'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

let clientes = ref([])
if (isClient) {
  const { clientes, fetchClientes } = useClientes()
  onMounted(async () => {
    isLoading.value = true
    try {
      await fetchClientes()
    } catch (e) {
      error.value = 'Erro ao carregar clientes.'
    }
    isLoading.value = false
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
