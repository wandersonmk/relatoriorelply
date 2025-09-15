<template>
  <div class="bg-card text-card-foreground rounded-lg border border-border shadow-sm">
    <!-- Header com ícone -->
    <div class="flex items-center justify-between p-6 border-b border-border">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <font-awesome-icon 
            icon="question-circle" 
            class="w-5 h-5 text-white" 
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">Central de Ajuda</h2>
          <p class="text-sm text-muted-foreground">Guia completo para usar o sistema Wise Digital</p>
        </div>
      </div>
    </div>

    <!-- Conteúdo da ajuda -->
    <div class="p-6 space-y-8">
      
      <!-- Seção: Como Usar os Filtros -->
      <div class="space-y-4">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <font-awesome-icon 
              icon="filter" 
              class="w-4 h-4 text-purple-600 dark:text-purple-400" 
            />
          </div>
          <h3 class="text-xl font-semibold text-foreground">Como Usar os Filtros nos Relatórios</h3>
        </div>
        
        <div class="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
            <span>Acesse a página de Relatórios</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Clique em "Relatórios" no menu lateral para acessar a página de relatórios de tickets.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            <span>Configure os filtros</span>
          </h4>
          <div class="text-sm text-muted-foreground ml-8 space-y-2">
            <p><strong>Data Inicial/Final:</strong> Selecione o período desejado para filtrar os registros.</p>
            <p><strong>CNPJ ou Nome da Loja:</strong> Digite o CNPJ ou nome da loja para buscar registros específicos.</p>
            <p><strong>Empresa:</strong> Selecione uma empresa específica (VIVO, TIM, CLARO, OI) ou deixe "Todas" para ver todos.</p>
          </div>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            <span>Filtros automáticos</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Os resultados são atualizados automaticamente conforme você digita ou seleciona os filtros. Não é necessário clicar em nenhum botão.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
            <span>Limpar filtros</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Para remover todos os filtros aplicados, clique no botão "Limpar Filtros" abaixo dos campos de filtro.
          </p>
        </div>
      </div>

      <!-- Seção: Como Baixar Relatórios -->
      <div class="space-y-4">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <font-awesome-icon 
              icon="file-pdf" 
              class="w-4 h-4 text-green-600 dark:text-green-400" 
            />
          </div>
          <h3 class="text-xl font-semibold text-foreground">Como Baixar Relatórios</h3>
        </div>
        
        <div class="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
            <span>Aplique os filtros desejados</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Configure os filtros conforme suas necessidades para exportar apenas os registros que deseja.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            <span>Escolha o formato de exportação</span>
          </h4>
          <div class="text-sm text-muted-foreground ml-8 space-y-2">
            <p><strong>PDF (botão vermelho):</strong> Gera um relatório profissional em formato PDF, ideal para impressão e apresentações.</p>
            <p><strong>Excel (botão verde):</strong> Cria uma planilha Excel com os dados, ideal para análises e manipulação dos dados.</p>
          </div>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            <span>Download automático</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Clique no botão do formato desejado e o arquivo será baixado automaticamente com o nome contendo a data atual.
          </p>
          
          <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 ml-8">
            <p class="text-sm text-blue-700 dark:text-blue-300">
              <strong>Dica:</strong> Os relatórios incluem todos os registros visíveis na tabela após a aplicação dos filtros, 
              incluindo informações como nome, telefone, loja, CNPJ, data/hora e empresa.
            </p>
          </div>
        </div>
      </div>

        <!-- Seção: Novas Funcionalidades -->
        <div class="space-y-4">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <font-awesome-icon 
                icon="bolt" 
                class="w-4 h-4 text-blue-600 dark:text-blue-400" 
              />
            </div>
            <h3 class="text-xl font-semibold text-foreground">Novas Funcionalidades</h3>
          </div>
          <div class="bg-muted/30 rounded-lg p-4 space-y-3">
            <h4 class="font-medium text-foreground flex items-center space-x-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
              <span>Atualizar Dados</span>
            </h4>
            <p class="text-sm text-muted-foreground ml-8">
              Para buscar os dados mais recentes do banco, basta apertar <strong>F5</strong> para atualizar a página. Isso garante que você está visualizando as informações mais atuais após alterações ou inserções de dados.
            </p>
            <h4 class="font-medium text-foreground flex items-center space-x-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
              <span>Scroll Infinito</span>
            </h4>
            <p class="text-sm text-muted-foreground ml-8">
              As tabelas de relatórios e clientes agora carregam mais registros automaticamente conforme você rola a página. Não é necessário clicar em "Carregar mais" — basta rolar até o final da lista para ver mais resultados.
            </p>
            <h4 class="font-medium text-foreground flex items-center space-x-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
              <span>Exibição de Totais</span>
            </h4>
            <p class="text-sm text-muted-foreground ml-8">
              O sistema exibe o <strong>total de clientes</strong> e o <strong>total de registros</strong> diretamente acima das tabelas, facilitando o acompanhamento dos dados.
            </p>
            <h4 class="font-medium text-foreground flex items-center space-x-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
              <span>Exportação de Dados</span>
            </h4>
            <p class="text-sm text-muted-foreground ml-8">
              Os botões de exportação para <strong>PDF</strong> e <strong>Excel</strong> estão sempre visíveis acima das tabelas. Exporte os dados filtrados com apenas um clique.
            </p>
            <h4 class="font-medium text-foreground flex items-center space-x-2">
              <span class="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
              <span>Atualização dos Relatórios</span>
            </h4>
            <p class="text-sm text-muted-foreground ml-8">
              Sempre que inserir, editar ou remover dados, utilize o botão <strong>Recarregar</strong> para garantir que os relatórios exibam as informações atualizadas. Isso é essencial para manter a precisão dos dados apresentados.
            </p>
          </div>
        </div>

      <!-- Seção: Configurações do Sistema -->
      <div class="space-y-4">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <font-awesome-icon 
              icon="cog" 
              class="w-4 h-4 text-orange-600 dark:text-orange-400" 
            />
          </div>
          <h3 class="text-xl font-semibold text-foreground">Para que Servem as Configurações</h3>
        </div>
        
        <div class="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
            <span>Gerenciamento de Dados</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            A página de configurações permite gerenciar e manter os dados do sistema organizados e atualizados.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            <span>Limpar Lista de Clientes</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Remove todos os clientes cadastrados no sistema. Útil para fazer limpeza periódica ou ao migrar dados.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            <span>Limpar Registros de Tickets</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Remove todos os registros de tickets/chamados do sistema. Ideal para limpeza após análises ou arquivamento de dados antigos.
          </p>
          
          <h4 class="font-medium text-foreground flex items-center space-x-2">
            <span class="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
            <span>Manutenção do Sistema</span>
          </h4>
          <p class="text-sm text-muted-foreground ml-8">
            Use essas opções para manter o sistema otimizado, removendo dados desnecessários e liberando espaço de armazenamento.
          </p>
        </div>
      </div>

      <!-- Seção: Cuidados ao Limpar Dados -->
      <div class="space-y-4">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <font-awesome-icon 
              icon="exclamation-triangle" 
              class="w-4 h-4 text-red-600 dark:text-red-400" 
            />
          </div>
          <h3 class="text-xl font-semibold text-foreground">Cuidados Importantes ao Limpar Dados</h3>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-4">
          <div class="space-y-3">
            <h4 class="font-medium text-red-800 dark:text-red-200 flex items-center space-x-2">
              <span class="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">⚠</span>
              <span>Ações Irreversíveis</span>
            </h4>
            <p class="text-sm text-red-700 dark:text-red-300 ml-8">
              <strong>ATENÇÃO:</strong> Todas as ações de limpeza são permanentes e não podem ser desfeitas. 
              Uma vez que os dados são removidos, não há como recuperá-los através do sistema.
            </p>
            
            <h4 class="font-medium text-red-800 dark:text-red-200 flex items-center space-x-2">
              <span class="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">💾</span>
              <span>Sempre Faça Backup</span>
            </h4>
            <p class="text-sm text-red-700 dark:text-red-300 ml-8">
              Antes de limpar qualquer dado, exporte os relatórios (PDF ou Excel) para ter uma cópia de segurança das informações importantes.
            </p>
            
            <h4 class="font-medium text-red-800 dark:text-red-200 flex items-center space-x-2">
              <span class="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">✓</span>
              <span>Confirmação Dupla</span>
            </h4>
            <p class="text-sm text-red-700 dark:text-red-300 ml-8">
              O sistema sempre pedirá confirmação antes de executar qualquer ação de limpeza. 
              Leia atentamente e tenha certeza antes de confirmar.
            </p>
            
            <h4 class="font-medium text-red-800 dark:text-red-200 flex items-center space-x-2">
              <span class="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">📋</span>
              <span>Planejamento</span>
            </h4>
            <p class="text-sm text-red-700 dark:text-red-300 ml-8">
              Realize a limpeza de dados apenas quando necessário e preferencialmente em horários de menor movimento, 
              para evitar interferir no trabalho da equipe.
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Componente de ajuda - não requer lógica específica
// Todas as informações são estáticas e informativas
</script>
