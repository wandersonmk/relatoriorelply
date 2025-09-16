// useRelatorioPDF.ts - Versão funcional sem autoTable
export const useRelatorioPDF = () => {
  const gerarPDF = async (dados: any[], filtros: any = {}) => {
    if (process.server) {
      return { sucesso: false, erro: 'Servidor' }
    }
    
    if (!dados || dados.length === 0) {
      return { sucesso: false, erro: 'Sem dados' }
    }

    try {
      // Usar apenas jsPDF por enquanto
      const { default: jsPDF } = await import('jspdf')

      // Criar documento em orientação horizontal (paisagem)
      const doc = new jsPDF('landscape')

      // Cabeçalho do relatório - alinhado à esquerda
      doc.setFontSize(18)
      doc.text('RELATÓRIO DE ATENDIMENTOS', 15, 20) // Alinhado à esquerda
      
      doc.setFontSize(12)
      const dataGeracao = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      doc.text(`Gerado em: ${dataGeracao}`, 15, 35) // Alinhado à esquerda
      doc.text(`Total de registros: ${dados.length}`, 15, 45) // Alinhado à esquerda
      
      // Informações de filtros se houver
      let yPosition = 55
      if (filtros.dataInicio) {
        doc.text(`Período: ${filtros.dataInicio} até ${filtros.dataFim || 'atual'}`, 20, yPosition)
        yPosition += 10
      }
      if (filtros.agente) {
        doc.text(`Agente: ${filtros.agente}`, 20, yPosition)
        yPosition += 10
      }
      
      // Cabeçalho da "tabela" com todas as colunas da imagem
      yPosition += 10
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      
      // Posições das colunas (redistribuídas para melhor aproveitamento - 297mm de largura)
      const colunas = {
        ticket: 15,
        agente: 40,
        cliente: 75,
        telefone: 125,
        tempo: 155,
        inicio: 185,
        score: 225,
        avaliacao: 250
      }
      
      doc.text('Ticket', colunas.ticket, yPosition)
      doc.text('Agente', colunas.agente, yPosition)
      doc.text('Cliente', colunas.cliente, yPosition)
      doc.text('Telefone', colunas.telefone, yPosition)
      doc.text('Tempo', colunas.tempo, yPosition)
      doc.text('Início', colunas.inicio, yPosition)
      doc.text('Score', colunas.score, yPosition)
      doc.text('Avaliação', colunas.avaliacao, yPosition)
      
      // Linha separadora
      yPosition += 5
      doc.line(15, yPosition, 275, yPosition) // Linha mais larga para paisagem
      yPosition += 10
      
      // Dados (todos os registros com paginação automática)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      
      dados.forEach((item, index) => {
        if (yPosition > 180) { // Nova página se necessário (paisagem tem menos altura)
          doc.addPage('landscape')
          yPosition = 20
          
          // Repetir cabeçalho na nova página
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9)
          doc.text('Ticket', colunas.ticket, yPosition)
          doc.text('Agente', colunas.agente, yPosition)
          doc.text('Cliente', colunas.cliente, yPosition)
          doc.text('Telefone', colunas.telefone, yPosition)
          doc.text('Tempo', colunas.tempo, yPosition)
          doc.text('Início', colunas.inicio, yPosition)
          doc.text('Score', colunas.score, yPosition)
          doc.text('Avaliação', colunas.avaliacao, yPosition)
          
          yPosition += 5
          doc.line(15, yPosition, 275, yPosition)
          yPosition += 10
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
        }
        
        // Preparar dados com melhor tratamento para nomes longos
        const ticket = (item.ticket_number || '').substring(0, 8)
        const agente = (item.agent_name || '').substring(0, 15)
        const telefone = (item.contact_phone || '').substring(0, 15)
        const tempo = (item.service_time || '').substring(0, 10)
        const inicio = (item.service_start_time || '').substring(0, 16)
        const score = (item.service_score || '').substring(0, 8)
        
        // Tratamento especial para avaliação (customer_note) - mostrar como número + descrição
        let avaliacao = ''
        if (item.customer_note) {
          const nota = item.customer_note.trim()
          // Mapear as avaliações como mostrado na imagem
          const avaliacaoMap: { [key: string]: string } = {
            '1': '1 - Péssimo',
            '2': '2 - Ruim', 
            '3': '3 - Regular',
            '4': '4 - Bom',
            '5': '5 - Excelente'
          }
          avaliacao = avaliacaoMap[nota] || nota.substring(0, 15)
        }
        
        // Tratamento especial para nome do cliente (permitir quebra de linha)
        const nomeCliente = item.contact_name || ''
        let clienteLinhas = []
        if (nomeCliente.length > 20) {
          // Quebrar nome longo em duas linhas
          const palavras = nomeCliente.split(' ')
          let linha1 = ''
          let linha2 = ''
          
          for (const palavra of palavras) {
            if ((linha1 + palavra).length <= 20) {
              linha1 += (linha1 ? ' ' : '') + palavra
            } else {
              linha2 += (linha2 ? ' ' : '') + palavra
            }
          }
          clienteLinhas = [linha1, linha2.substring(0, 20)]
        } else {
          clienteLinhas = [nomeCliente]
        }
        
        // Escrever dados nas posições
        doc.text(ticket, colunas.ticket, yPosition)
        doc.text(agente, colunas.agente, yPosition)
        doc.text(clienteLinhas[0], colunas.cliente, yPosition)
        doc.text(telefone, colunas.telefone, yPosition)
        doc.text(tempo, colunas.tempo, yPosition)
        doc.text(inicio, colunas.inicio, yPosition)
        doc.text(score, colunas.score, yPosition)
        doc.text(avaliacao, colunas.avaliacao, yPosition)
        
        // Se o nome do cliente tem segunda linha, escrever ela
        if (clienteLinhas.length > 1 && clienteLinhas[1]) {
          yPosition += 6
          doc.text(clienteLinhas[1], colunas.cliente, yPosition)
        }
        
        yPosition += 8
        
        // Linha discreta de separação entre registros
        doc.setDrawColor(200, 200, 200) // Cor cinza claro
        doc.line(15, yPosition, 275, yPosition)
        doc.setDrawColor(0, 0, 0) // Voltar para preto
        
        yPosition += 3
      })
      
      // Rodapé com total completo
      yPosition += 10
      doc.setFontSize(8)
      doc.text(`Total de ${dados.length} registros incluídos neste relatório`, 15, yPosition)

      const nomeArquivo = `relatorio-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(nomeArquivo)
      
      return { sucesso: true, nomeArquivo }

    } catch (error: any) {
      console.error('[PDF] Erro:', error)
      return { sucesso: false, erro: error?.message || 'Erro desconhecido' }
    }
  }

  return { gerarPDF }
}