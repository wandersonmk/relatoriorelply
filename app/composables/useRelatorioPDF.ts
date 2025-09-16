import { useUsuario } from './useUsuario'

export const useRelatorioPDF = () => {
  const { nomeEmpresa, fetchUsuarioData } = useUsuario()

  const formatarDataHora = (dataString: string | null): string => {
    if (!dataString) return '-'
    try {
      // Tentar diferentes formatos de data
      let data: Date
      
      if (dataString.includes('T')) {
        data = new Date(dataString)
      } else if (dataString.includes('/')) {
        // Formato DD/MM/YYYY HH:MM ou similar
        const partes = dataString.split(/[\/\s:]/)
        if (partes.length >= 3 && partes[0] && partes[1] && partes[2]) {
          const dia = parseInt(partes[0])
          const mes = parseInt(partes[1]) - 1 // Mês base 0
          const ano = parseInt(partes[2])
          
          // Se tem hora e minuto
          let hora = 0, minuto = 0
          if (partes.length >= 5 && partes[3] && partes[4]) {
            hora = parseInt(partes[3]) || 0
            minuto = parseInt(partes[4]) || 0
          }
          
          data = new Date(ano, mes, dia, hora, minuto)
        } else {
          return dataString
        }
      } else {
        data = new Date(dataString)
      }
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        return dataString
      }
      
      return data.toLocaleString('pt-BR', {
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
      const { default: jsPDF } = await import('jspdf')
      await import('jspdf-autotable')
      
      console.log('[useRelatorioPDF] Bibliotecas importadas, criando documento...')
      const doc = new jsPDF('landscape', 'mm', 'a4')
      doc.setFont('helvetica', 'normal')
      
      // Cabeçalho principal com gradiente azul
      doc.setFillColor(102, 90, 228)
      doc.rect(0, 0, 297, 35, 'F')
      
      // Título principal em branco
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE ATENDIMENTOS', 148.5, 18, { align: 'center' })
      
      // Subtítulo com data/hora
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      const agora = new Date()
      const dataHoraCompleta = `Gerado em: ${agora.toLocaleDateString('pt-BR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })} às ${agora.toLocaleTimeString('pt-BR')}`
      doc.text(dataHoraCompleta, 148.5, 28, { align: 'center' })
      
      // Linha separadora
      doc.setFillColor(85, 75, 190)
      doc.rect(0, 30, 297, 5, 'F')

      // Seção de filtros (se existirem)
      let yPosition = 45
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (filtros.agente || filtros.cliente || filtros.dataInicio || filtros.dataFim) {
        // Fundo cinza claro para filtros
        doc.setFillColor(248, 249, 250)
        doc.rect(15, yPosition - 3, 267, 20, 'F')
        
        // Borda dos filtros
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        doc.rect(15, yPosition - 3, 267, 20)
        
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
      
      // Preparar dados da tabela com truncamento ajustado
      const tableData = dados.map(item => [
        truncarTexto(item.ticket_number, 10),
        truncarTexto(item.agent_name, 18),
        truncarTexto(item.contact_name, 25),  // Aumentado para 25 caracteres
        truncarTexto(item.contact_phone, 15),
        formatarTempo(item.service_time),
        formatarDataHora(item.service_start_time),
        formatarScore(item.service_score),
        classificarTempo(item.service_time)
      ])
      
      console.log('[useRelatorioPDF] Dados da tabela preparados:', tableData.length, 'linhas')
      
      // Usar autoTable com configuração funcional
      try {
        console.log('[useRelatorioPDF] Gerando tabela autoTable...')
        
        // Verificar se autoTable está disponível
        if (typeof (doc as any).autoTable !== 'function') {
          throw new Error('autoTable não está disponível')
        }
        
        (doc as any).autoTable({
          head: [['Ticket', 'Agente', 'Cliente', 'Telefone', 'Tempo', 'Início', 'Score', 'Avaliação']],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            lineColor: [220, 220, 220],
            lineWidth: 0.3
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
          },
          bodyStyles: {
            fillColor: [255, 255, 255]  // Cor única branca
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'center' }, // Ticket
            1: { cellWidth: 32, halign: 'left' },   // Agente
            2: { cellWidth: 45, halign: 'left' },   // Cliente
            3: { cellWidth: 32, halign: 'center' }, // Telefone
            4: { cellWidth: 22, halign: 'center' }, // Tempo
            5: { cellWidth: 38, halign: 'center' }, // Início
            6: { cellWidth: 18, halign: 'center' }, // Score
            7: { cellWidth: 30, halign: 'center' }  // Avaliação (à direita)
          },
          margin: { left: 12, right: 12 },
          didDrawPage: (data: any) => {
            const pageCount = (doc as any).internal.getNumberOfPages()
            const pageHeight = 210
            
            doc.setFontSize(8)
            doc.setTextColor(128, 128, 128)
            doc.setFont('helvetica', 'normal')
            
            doc.text(`Total de registros encontrados: ${dados.length}`, 12, pageHeight - 10)
            doc.text(`Gerado pela ${empresa}`, 148.5, pageHeight - 10, { align: 'center' })
            doc.text(`Página ${data.pageNumber} de ${pageCount}`, 285, pageHeight - 10, { align: 'right' })
          }
        })
        
        console.log('[useRelatorioPDF] AutoTable concluída com sucesso!')
        
      } catch (autoTableError) {
        console.error('[useRelatorioPDF] Erro na autoTable:', autoTableError)
        console.log('[useRelatorioPDF] Usando fallback com tabela manual organizada...')
        
        // Criar tabela manual bem organizada
        let currentY = yPosition
        const lineHeight = 6
        const colWidths = [30, 36, 48, 36, 26, 40, 20, 34]  // Larguras ajustadas para caber na página
        const colPositions = [12, 42, 78, 126, 162, 188, 228, 248]  // Posições reajustadas
        
        // Cabeçalho da tabela manual com cor roxa
        doc.setFillColor(102, 90, 228)  // Mesma cor roxa do cabeçalho principal
        doc.rect(12, currentY - 3, 270, 8, 'F')  // Largura ajustada para não ultrapassar
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        
        const headers = ['Ticket', 'Agente', 'Cliente', 'Telefone', 'Tempo', 'Início', 'Score', 'Avaliação']
        headers.forEach((header, i) => {
          const pos = colPositions[i] || 12
          const width = colWidths[i] || 30
          let headerAlign: 'center' | 'left' | 'right' = 'center'
          let headerX = pos + width/2
          
          // Ticket alinhado à esquerda, Avaliação à direita
          if (i === 0) {  // Ticket
            headerAlign = 'left'
            headerX = pos + 2
          } else if (i === 7) {  // Avaliação
            headerAlign = 'right'
            headerX = pos + width - 2
          }
          
          doc.text(header, headerX, currentY + 2, { align: headerAlign })
        })
        
        currentY += 10
        
        // Dados da tabela manual (cor única com bordas)
        doc.setTextColor(50, 50, 50)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        
        tableData.forEach((row, index) => {
          // Fundo branco para todos
          doc.setFillColor(255, 255, 255)
          doc.rect(12, currentY - 2, 270, lineHeight, 'F')  // Largura ajustada
          
          // Linhas divisórias discretas
          doc.setDrawColor(220, 220, 220)
          doc.setLineWidth(0.2)
          doc.line(12, currentY + lineHeight - 2, 282, currentY + lineHeight - 2)
          
          row.forEach((cell, i) => {
            let align: 'center' | 'left' | 'right' = 'center'  // Padrão para colunas centrais
            const pos = colPositions[i] || 12
            const width = colWidths[i] || 30
            let x = pos + width/2
            
            // Definir alinhamentos específicos
            if (i === 0) {  // Ticket - esquerda
              align = 'left'
              x = pos + 2
            } else if (i === 1) {  // Agente - esquerda
              align = 'left'
              x = pos + 2
            } else if (i === 2) {  // Cliente - esquerda
              align = 'left'
              x = pos + 2
            } else if (i === 7) {  // Avaliação - direita
              align = 'right'
              x = pos + width - 2
            }
            // Telefone, Tempo, Início, Score permanecem centralizados
            
            doc.text(String(cell), x, currentY + 2, { align })
          })
          
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