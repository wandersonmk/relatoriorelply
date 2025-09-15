<script setup lang="ts">
// Página acessível independente de autenticação
// Removido middleware para permitir acesso após cadastro

// Meta tags para SEO
useHead({
  title: 'Obrigado - Wise Digital',
  meta: [
    { name: 'description', content: 'Obrigado por se cadastrar no Wise Digital Gestão de Relatórios' }
  ]
})

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <ThankYouCard />
</template>
