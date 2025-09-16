<template>
  <div>
    <!-- Loading Screen -->
    <AppLoading v-if="!isClient" title="Carregando Vídeos..." />
    
    <!-- Main Content -->
    <div v-else class="min-h-full bg-background text-foreground">
      <div class="container mx-auto px-4 py-8">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-foreground">
            <font-awesome-icon icon="graduation-cap" class="mr-3 text-primary" />
            Vídeos
          </h1>
          <p class="text-muted-foreground mt-2">
            Gerenciar e visualizar os vídeos do sistema
          </p>
        </div>

        <!-- Content Area -->
        <div class="bg-card rounded-lg border border-border p-6">
          <div class="text-center py-12">
            <font-awesome-icon 
              icon="graduation-cap" 
              class="text-6xl text-muted-foreground mb-4" 
            />
            <h2 class="text-xl font-semibold text-foreground mb-2">
              Página de Vídeos
            </h2>
            <p class="text-muted-foreground">
              Esta página está em desenvolvimento. Em breve você poderá gerenciar os vídeos aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// SEO
useHead({
  title: 'Vídeos - Sistema de Relatórios',
  meta: [
    {
      name: 'description',
      content: 'Gerenciar e visualizar os vídeos do sistema'
    }
  ]
})

// Controle de hidratação (SSR safety)
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})
</script>