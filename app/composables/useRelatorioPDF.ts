import { useUsuario } from './useUsuario'

export const useRelatorioPDF = () => {
  const { nomeEmpresa, fetchUsuarioData } = useUsuario()

  const formatarDataHora = (dataString: string | null): string => {
    if (!dataString) return '-'
    try {
      const data = new Date(dataString)
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dataString
    }
  }

  const formatarDataArquivo = (data: Date): string => {
    return data.toISOString().split('T')[0] || ''
  }

  const truncarTexto = (texto: string | null, limite: number): string => {
    if (!texto) return '-'
    return texto.length > limite ? texto.substring(0, limite - 3) + '...' : texto
  }

  const formatarScore = (score: number | null): string => {
    if (score === null || score === undefined) return '-'
    return `${score}%`
  }

  const formatarTempo = (tempo: string | null): string => {
    if (!tempo) return '-'
    if (tempo.includes('minuto')) {
      return tempo
    }
    const num = parseFloat(tempo)
    if (!isNaN(num)) {
      const minutos = Math.round(num)
      return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
    }
    return tempo
  }

  const classificarTempo = (tempo: string | null): string => {
    if (!tempo) return '-'
    const match = tempo.match(/(\d+)/)
    if (match && match[1]) {
      const minutos = parseInt(match[1])
      if (minutos <= 3) return 'Rápido'
      if (minutos <= 10) return 'Médio'
      return 'Longo'
    }
    return '-'
  }
  
  const gerarPDF = async (dados: any[], filtros: any) => {
    if (process.server) {
      console.warn('[useRelatorioPDF] PDF não pode ser gerado no servidor')
      return
    }

    console.log('[useRelatorioPDF] Iniciando geração de PDF com', dados.length, 'registros')

    // Garantir que temos o nome da empresa
    if (!nomeEmpresa.value) {
      await fetchUsuarioData()
    }
    
    const empresa = nomeEmpresa.value || 'Sistema de Relatórios'
    console.log('[useRelatorioPDF] Nome da empresa:', empresa)

    try {
      console.log('[useRelatorioPDF] Importando bibliotecas...')
      const jsPDF = await import('jspdf')
      const autoTable = await import('jspdf-autotable')
      
      console.log('[useRelatorioPDF] Bibliotecas importadas, criando documento...')
      const doc = new jsPDF.default('portrait', 'mm', 'a4')
      doc.setFont('helvetica', 'normal')
      
      // Cabeçalho principal com gradiente azul
      doc.setFillColor(52, 152, 219)
      doc.rect(0, 0, 210, 40, 'F')
      
      // Título principal em branco
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE ATENDIMENTOS', 105, 18, { align: 'center' })
      
      // Subtítulo com data/hora
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const agora = new Date()
      const dataHoraCompleta = `Gerado em: ${agora.toLocaleDateString('pt-BR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })} às ${agora.toLocaleTimeString('pt-BR')}`
      doc.text(dataHoraCompleta, 105, 28, { align: 'center' })
      
      // Linha separadora
      doc.setFillColor(44, 123, 189)
      doc.rect(0, 35, 210, 5, 'F')

      // Seção de filtros (se existirem)
      let yPosition = 50
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filtros.agente || filtros.cliente || filtros.dataInicio || filtros.dataFim) {
        // Fundo cinza claro para filtros
        doc.setFillColor(248, 249, 250)
        doc.rect(15, yPosition - 3, 180, 25, 'F')
        
        // Borda dos filtros
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.rect(15, yPosition - 3, 180, 25)
        
        doc.setFont('helvetica', 'bold')
        doc.text('Filtros aplicados:', 20, yPosition + 3)
        yPosition += 10
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        
        if (filtros.agente) {
          doc.text(`• Agente: ${filtros.agente}`, 25, yPosition)
          yPosition += 5
        }
        if (filtros.cliente) {
          doc.text(`• Cliente: ${filtros.cliente}`, 25, yPosition)
          yPosition += 5
        }
        if (filtros.dataInicio || filtros.dataFim) {
          const periodo = filtros.dataInicio && filtros.dataFim 
            ? `${filtros.dataInicio} até ${filtros.dataFim}`
            : filtros.dataInicio 
              ? `A partir de ${filtros.dataInicio}`
              : `Até ${filtros.dataFim}`
          doc.text(`• Período: ${periodo}`, 25, yPosition)
          yPosition += 5
        }
        
        yPosition += 10
      }
      
      // Espaço antes da tabela
      yPosition += 5
      
      console.log('[useRelatorioPDF] Configurando tabela...')
      
      // Preparar dados da tabela de forma otimizada para A4
      const tableData = dados.map(item => [
        truncarTexto(item.ticket_number, 8),
        truncarTexto(item.agent_name, 12),
        truncarTexto(item.contact_name, 12),
        truncarTexto(item.contact_phone, 11),
        formatarTempo(item.service_time),
        formatarDataHora(item.service_start_time),
        formatarScore(item.service_score),
        classificarTempo(item.service_time)
      ])
      
      console.log('[useRelatorioPDF] Dados da tabela preparados:', tableData.length, 'linhas')
      
      // Usar autoTable com design melhorado para A4
      try {
        console.log('[useRelatorioPDF] Gerando tabela autoTable...')
        
        ;(doc as any).autoTable({
          head: [['Ticket', 'Agente', 'Cliente', 'Telefone', 'Tempo', 'Início', 'Score', 'Avaliação']],
          body: tableData,
          startY: yPosition,
          styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            halign: 'center'
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          columnStyles: {
            0: { cellWidth: 18, halign: 'center' }, // Ticket
            1: { cellWidth: 25, halign: 'left' },   // Agente
            2: { cellWidth: 25, halign: 'left' },   // Cliente
            3: { cellWidth: 22, halign: 'center' }, // Telefone
            4: { cellWidth: 18, halign: 'center' }, // Tempo
            5: { cellWidth: 32, halign: 'center' }, // Início
            6: { cellWidth: 15, halign: 'center' }, // Score
            7: { cellWidth: 20, halign: 'center' }  // Avaliação
          },
          margin: { left: 15, right: 15 },
          tableLineColor: [220, 220, 220],
          tableLineWidth: 0.5,
          didDrawPage: (data: any) => {
            // Rodapé em cada página
            const pageCount = (doc as any).internal.getNumberOfPages()
            const pageHeight = 297 // A4 height
            
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.setFont('helvetica', 'normal')
            
            // Total de registros (esquerda)
            const textoTotal = `Total: ${dados.length} registros`
            doc.text(textoTotal, 15, pageHeight - 10)
            
            // Data de geração (centro)  
            const dataGeracao = `Gerado pela ${empresa}`
            doc.text(dataGeracao, 105, pageHeight - 10, { align: 'center' })
            
            // Número da página (direita)
            const numeroPagina = `Página ${data.pageNumber} de ${pageCount}`
            doc.text(numeroPagina, 195, pageHeight - 10, { align: 'right' })
          }
        })
        
        console.log('[useRelatorioPDF] AutoTable concluída com sucesso!')
        
      } catch (autoTableError) {
        console.error('[useRelatorioPDF] Erro na autoTable:', autoTableError)
        // Fallback manual se autoTable falhar
        console.log('[useRelatorioPDF] Usando fallback manual...')
        
        let currentY = yPosition
        const lineHeight = 6
        
        // Cabeçalho manual
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text('Ticket | Agente | Cliente | Telefone | Tempo | Início | Score | Avaliação', 15, currentY)
        currentY += lineHeight * 2
        
        // Dados manual
        doc.setFont('helvetica', 'normal')
        tableData.forEach((row) => {
          const linha = row.join(' | ')
          doc.text(linha, 15, currentY)
          currentY += lineHeight
        })
      }
      
      console.log('[useRelatorioPDF] Salvando arquivo...')
      
      // Salvar o PDF
      const dataAtual = agora.toISOString().split('T')[0]
      const horaAtual = agora.toTimeString().split(' ')[0]?.replace(/:/g, '-') || 'horario'
      const empresaLimpa = empresa.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
      const nomeArquivo = `Relatorio-Atendimentos-${empresaLimpa}-${dataAtual}-${horaAtual}.pdf`
      doc.save(nomeArquivo)
      
      console.log('[useRelatorioPDF] PDF salvo com sucesso:', nomeArquivo)
      
      return { sucesso: true, nomeArquivo }
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      return { sucesso: false, erro: error }
    }
  }

  return { gerarPDF }
}