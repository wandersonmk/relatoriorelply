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

      const doc = new jsPDF()

      // Cabeçalho do relatório
      doc.setFontSize(18)
      doc.text('Relatório de Atendimentos', 20, 20)
      
      doc.setFontSize(12)
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35)
      doc.text(`Total de registros: ${dados.length}`, 20, 45)
      
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
      
      // Cabeçalho da "tabela" com texto
      yPosition += 10
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Ticket', 20, yPosition)
      doc.text('Agente', 60, yPosition)
      doc.text('Cliente', 120, yPosition)
      doc.text('Telefone', 160, yPosition)
      
      // Linha separadora
      yPosition += 5
      doc.line(20, yPosition, 190, yPosition)
      yPosition += 10
      
      // Dados (máximo 25 registros para caber na página)
      doc.setFont('helvetica', 'normal')
      const registrosLimitados = dados.slice(0, 25)
      
      registrosLimitados.forEach((item, index) => {
        if (yPosition > 270) { // Nova página se necessário
          doc.addPage()
          yPosition = 20
        }
        
        const ticket = (item.ticket_number || '').substring(0, 8)
        const agente = (item.agent_name || '').substring(0, 15)
        const cliente = (item.contact_name || '').substring(0, 15)
        const telefone = (item.contact_phone || '').substring(0, 15)
        
        doc.text(ticket, 20, yPosition)
        doc.text(agente, 60, yPosition)
        doc.text(cliente, 120, yPosition)
        doc.text(telefone, 160, yPosition)
        
        yPosition += 8
      })
      
      // Rodapé
      if (dados.length > 25) {
        yPosition += 10
        doc.setFontSize(8)
        doc.text(`Mostrando 25 de ${dados.length} registros`, 20, yPosition)
      }

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