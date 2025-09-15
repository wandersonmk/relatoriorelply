<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

import { useRelatorios } from '../composables/useRelatorios'

const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

let relatorios = ref([])
if (isClient) {
  const { relatorios, fetchRelatorios } = useRelatorios()
  onMounted(async () => {
    isLoading.value = true
    try {
      await fetchRelatorios()
    } catch (e) {
      error.value = 'Erro ao carregar relatórios.'
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
      title="Carregando Relatórios"
      description="Preparando visão geral dos relatórios..."
    />
    <!-- Conteúdo só aparece após carregamento client-side -->
    <div v-else class="space-y-6">
      <RelatoriosManager :relatorios="relatorios" />
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>
    </div>
  </div>
</template>
