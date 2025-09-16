<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Controle de loading e erro igual ao de clientes
const isLoading = ref(true)
const error = ref('')
const isClient = typeof window !== 'undefined'

// Usar o composable de relatórios
if (isClient) {
  const { fetchRelatorios } = useRelatorios()
  
  // Carregar dados quando a página montar
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
      <RelatoriosManagerSimple />
      <div v-if="error" class="text-red-500 text-center">{{ error }}</div>
    </div>
  </div>
</template>
