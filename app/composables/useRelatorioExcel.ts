export const useRelatorioExcel = () => {
  
  // Função para formatar telefone
  const formatarTelefone = (telefone: string | null): string => {
    if (!telefone) return '-'
    const cleaned = telefone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return telefone
  }

  // Função para formatar data e hora
  const formatarDataHora = (dataHora: string | null): string => {
    if (!dataHora) return '-'
    try {
      const date = new Date(dataHora)
      return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`
    } catch {
      return dataHora
    }
  }

  // Função para truncar texto
  const truncarTexto = (texto: string | null, maxLength: number): string => {
    if (!texto) return '-'
    return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto
  }

  // Função principal para gerar Excel
  const gerarExcel = async (dados: any[], filtros: any = {}) => {
    try {
      // Importação dinâmica do xlsx
      const XLSX = await import('xlsx')
      
      // Definir colunas do Excel (todas as colunas da tabela)
      const colunas = [
        { header: 'Ticket', key: 'ticket_number' },
        { header: 'Agente', key: 'agent_name' },
        { header: 'Cliente', key: 'contact_name' },
        { header: 'Telefone', key: 'contact_phone' },
        { header: 'Tempo de Atendimento', key: 'service_time' },
        { header: 'Data/Hora Início', key: 'service_start_time' },
        { header: 'Solicitação', key: 'contact_request' },
        { header: 'Classificação', key: 'service_classification' },
        { header: 'Score', key: 'service_score' },
        { header: 'Solução do Agente', key: 'agent_solution' },
        { header: 'Avaliação do Cliente', key: 'customer_note' },
        { header: 'Resumo do Atendimento', key: 'service_summary' }
      ]

      // Mapear dados para Excel
      const dadosExcel = dados.map(item => {
        const linha: any = {}
        
        colunas.forEach(coluna => {
          const valor = item[coluna.key as keyof typeof item]
          
          // Aplicar formatação específica por campo
          switch (coluna.key) {
            case 'contact_phone':
              linha[coluna.header] = formatarTelefone(valor)
              break
            case 'service_start_time':
              linha[coluna.header] = formatarDataHora(valor)
              break
            case 'contact_request':
            case 'agent_solution':
            case 'service_summary':
              // Não truncar no Excel, manter texto completo
              linha[coluna.header] = valor || '-'
              break
            default:
              linha[coluna.header] = valor || '-'
          }
        })
        
        return linha
      })

      // Criar planilha
      const ws = XLSX.utils.json_to_sheet(dadosExcel)
      
      // Configurar largura das colunas
      const colWidths = [
        { wch: 12 }, // Ticket
        { wch: 20 }, // Agente
        { wch: 25 }, // Cliente
        { wch: 18 }, // Telefone
        { wch: 15 }, // Tempo
        { wch: 20 }, // Data/Hora
        { wch: 40 }, // Solicitação
        { wch: 15 }, // Classificação
        { wch: 10 }, // Score
        { wch: 40 }, // Solução
        { wch: 30 }, // Avaliação
        { wch: 40 }  // Resumo
      ]
      
      ws['!cols'] = colWidths

      // Criar workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Atendimentos')

      // Adicionar metadados
      wb.Props = {
        Title: 'Relatório de Atendimentos',
        Subject: 'Dados de atendimentos exportados',
        Author: 'Sistema de Relatórios',
        CreatedDate: new Date()
      }

      // Gerar nome do arquivo com data/hora
      const agora = new Date()
      const dataFormatada = agora.toISOString().slice(0, 16).replace(/[:-]/g, '').replace('T', '_')
      const nomeArquivo = `relatorio_atendimentos_${dataFormatada}.xlsx`

      // Fazer download
      XLSX.writeFile(wb, nomeArquivo)
      
      return { success: true, nomeArquivo }
      
    } catch (error) {
      console.error('Erro ao gerar Excel:', error)
      throw new Error('Erro ao gerar arquivo Excel')
    }
  }

  return {
    gerarExcel
  }
}