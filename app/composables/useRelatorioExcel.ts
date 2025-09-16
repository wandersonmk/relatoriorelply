export const useRelatorioExcel = () => {
  // Buscar nome da empresa
  const { nomeEmpresa, fetchUsuarioData } = useUsuario()
  
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
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dataHora)
        return dataHora || '-'
      }
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.warn('Erro ao formatar data:', dataHora, error)
      return dataHora || '-'
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
      // Garantir que temos o nome da empresa
      if (!nomeEmpresa.value) {
        await fetchUsuarioData()
      }
      
      const empresa = nomeEmpresa.value || 'Sistema de Relatórios'
      
      // Importação dinâmica do xlsx
      const XLSX = await import('xlsx')
      
      // Preparar dados do cabeçalho com informações da exportação
      const agora = new Date()
      const dataHoraCompleta = `${agora.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })} às ${agora.toLocaleTimeString('pt-BR')}`
      
      // Criar dados para o cabeçalho
      const dadosCabecalho = []
      
      // Título
      dadosCabecalho.push([`RELATÓRIO DE ATENDIMENTOS ${empresa.toUpperCase()}`])
      dadosCabecalho.push([`Gerado em: ${dataHoraCompleta}`])
      dadosCabecalho.push(['']) // Linha vazia
      
      // Filtros aplicados (se houver)
      let temFiltros = false
      if (filtros.agente || filtros.cliente || filtros.dataInicio || filtros.dataFim) {
        dadosCabecalho.push(['FILTROS APLICADOS:'])
        temFiltros = true
        
        if (filtros.agente) {
          dadosCabecalho.push([`• Agente: ${filtros.agente}`])
        }
        if (filtros.cliente) {
          dadosCabecalho.push([`• Cliente: ${filtros.cliente}`])
        }
        if (filtros.dataInicio) {
          dadosCabecalho.push([`• Data Inicial: ${filtros.dataInicio}`])
        }
        if (filtros.dataFim) {
          dadosCabecalho.push([`• Data Final: ${filtros.dataFim}`])
        }
      }
      
      // Adicionar linha vazia antes da tabela
      dadosCabecalho.push([''])
      
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

      // Criar planilha vazia
      const ws = XLSX.utils.aoa_to_sheet([])
      
      // Adicionar cabeçalho (informações do relatório)
      XLSX.utils.sheet_add_aoa(ws, dadosCabecalho, { origin: 'A1' })
      
      // Calcular a linha onde começar a tabela de dados
      const linhaInicioTabela = dadosCabecalho.length + 1
      
      // Adicionar cabeçalhos das colunas
      const headers = colunas.map(col => col.header)
      XLSX.utils.sheet_add_aoa(ws, [headers], { origin: `A${linhaInicioTabela}` })
      
      // Adicionar dados da tabela
      const dadosTabela = dadosExcel.map(linha => colunas.map(col => linha[col.header]))
      XLSX.utils.sheet_add_aoa(ws, dadosTabela, { origin: `A${linhaInicioTabela + 1}` })
      
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

      // Formatação especial para o título (primeira linha)
      if (ws['A1']) {
        ws['A1'].s = {
          font: { bold: true, sz: 16, color: { rgb: "0066CC" } },
          alignment: { horizontal: "center" }
        }
      }
      
      // Formatação para a data de geração (segunda linha)
      if (ws['A2']) {
        ws['A2'].s = {
          font: { italic: true, sz: 10 },
          alignment: { horizontal: "center" }
        }
      }
      
      // Formatação para o título dos filtros
      let linhaFiltros = 4
      if (temFiltros && ws[`A${linhaFiltros}`]) {
        ws[`A${linhaFiltros}`].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "F0F0F0" } }
        }
      }
      
      // Formatação para os cabeçalhos da tabela
      const linhaCabecalho = linhaInicioTabela
      for (let col = 0; col < colunas.length; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: linhaCabecalho - 1, c: col })
        if (ws[cellAddr]) {
          ws[cellAddr].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "0066CC" } },
            alignment: { horizontal: "center" }
          }
        }
      }

      // Criar workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório de Atendimentos')

      // Adicionar metadados
      wb.Props = {
        Title: `Relatório de Atendimentos ${empresa}`,
        Subject: 'Dados de atendimentos exportados',
        Author: empresa,
        CreatedDate: new Date()
      }

      // Gerar nome do arquivo com data/hora
      const agoraArquivo = new Date()
      const dataFormatada = agoraArquivo.toISOString().slice(0, 16).replace(/[:-]/g, '').replace('T', '_')
      const empresaLimpa = empresa.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_')
      const nomeArquivo = `relatorio_atendimentos_${empresaLimpa}_${dataFormatada}.xlsx`

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