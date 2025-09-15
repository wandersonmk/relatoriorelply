<script setup lang="ts">
// Aplica middleware de autenticação
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Usar o composable de relatórios (já funcionando)
const { relatorios, isLoading, error, fetchRelatorios } = useRelatorios()

// Carregar dados quando a página montar
onMounted(async () => {
  await fetchRelatorios()
})
</script>

<template>
  <div>
    <!-- Usar o novo componente simples -->
    <RelatoriosManagerSimple />
  </div>
</template>
