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

      // Cabeçalho do relatório
      doc.setFontSize(18)
      doc.text('RELATÓRIO DE ATENDIMENTOS', 150, 20) // Centralizado na página horizontal
      
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
      doc.text(`Gerado em: ${dataGeracao}`, 150, 35) // Centralizado
      doc.text(`Total de registros: ${dados.length}`, 150, 45) // Centralizado
      
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
      
      // Posições das colunas (ajustadas para paisagem - 297mm de largura)
      const colunas = {
        ticket: 15,
        agente: 45,
        cliente: 85,
        telefone: 125,
        tempo: 155,
        inicio: 185,
        score: 215,
        avaliacao: 240
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
      doc.line(15, yPosition, 270, yPosition) // Linha mais larga para paisagem
      yPosition += 8
      
      // Dados (todos os registros com paginação automática)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      
      dados.forEach((item, index) => {
        if (yPosition > 190) { // Nova página se necessário (paisagem tem menos altura)
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
          doc.line(15, yPosition, 270, yPosition)
          yPosition += 8
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
        }
        
        // Preparar dados truncados para caber nas colunas
        const ticket = (item.ticket_number || '').substring(0, 10)
        const agente = (item.agent_name || '').substring(0, 12)
        const cliente = (item.contact_name || '').substring(0, 12)
        const telefone = (item.contact_phone || '').substring(0, 12)
        const tempo = (item.service_time || '').substring(0, 8)
        const inicio = (item.service_start_time || '').substring(0, 16)
        const score = (item.service_score || '').substring(0, 6)
        const avaliacao = (item.customer_note || '').substring(0, 15)
        
        // Escrever dados nas posições
        doc.text(ticket, colunas.ticket, yPosition)
        doc.text(agente, colunas.agente, yPosition)
        doc.text(cliente, colunas.cliente, yPosition)
        doc.text(telefone, colunas.telefone, yPosition)
        doc.text(tempo, colunas.tempo, yPosition)
        doc.text(inicio, colunas.inicio, yPosition)
        doc.text(score, colunas.score, yPosition)
        doc.text(avaliacao, colunas.avaliacao, yPosition)
        
        yPosition += 7
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