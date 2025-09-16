import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useRelatorioPDF = () => {
  const gerarPDF = (dados: any[], filtros: any) => {
    try {
      // Criar nova instância do PDF com configuração UTF-8
      const doc = new jsPDF('landscape', 'mm', 'a4')
      
      // Configurar fonte para suportar UTF-8 e caracteres especiais
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      
      // === CABEÇALHO PRINCIPAL ===
      // Fundo azul para o cabeçalho
      doc.setFillColor(41, 128, 185)
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, 'F')
      
      // Título principal em branco
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('RELATÓRIO DE ATENDIMENTOS PIZARRO', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' })
      
      // Subtítulo com data/hora
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      const agora = new Date()
      const dataHoraCompleta = `Gerado em: ${agora.toLocaleDateString('pt-BR', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })} às ${agora.toLocaleTimeString('pt-BR')}`
      doc.text(dataHoraCompleta, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' })
      
      // === SEÇÃO DE FILTROS ===
      let yPosition = 45
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      
      if (filtros.agente || filtros.cliente || filtros.dataInicio || filtros.dataFim) {
        // Fundo cinza claro para os filtros
        doc.setFillColor(248, 249, 250)
        doc.rect(10, yPosition - 3, doc.internal.pageSize.getWidth() - 20, 25, 'F')
        
        doc.text('FILTROS APLICADOS:', 15, yPosition + 3)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        yPosition += 8
        
        if (filtros.agente) {
          doc.text(`• Agente: ${filtros.agente}`, 20, yPosition)
          yPosition += 5
        }
        if (filtros.cliente) {
          doc.text(`• Cliente: ${filtros.cliente}`, 20, yPosition)
          yPosition += 5
        }
        if (filtros.dataInicio) {
          doc.text(`• Data Inicial: ${filtros.dataInicio}`, 20, yPosition)
          yPosition += 5
        }
        if (filtros.dataFim) {
          doc.text(`• Data Final: ${filtros.dataFim}`, 20, yPosition)
          yPosition += 5
        }
        yPosition += 8
      }
      
      // Preparar dados da tabela com 7 colunas (similar à imagem)
      const colunas = [
        { header: '#', dataKey: 'numero' },
        { header: 'Ticket', dataKey: 'ticket_number' },
        { header: 'Agente', dataKey: 'agent_name' },
        { header: 'Cliente', dataKey: 'contact_name' },
        { header: 'Telefone', dataKey: 'contact_phone' },
        { header: 'Data/Hora', dataKey: 'service_start_time' },
        { header: 'Classificação', dataKey: 'service_classification' }
      ]
      
      const linhas = dados.map((item, index) => ({
        numero: (index + 1).toString(),
        ticket_number: item.ticket_number || '-',
        agent_name: truncarTexto(item.agent_name, 18),
        contact_name: truncarTexto(item.contact_name, 18),
        contact_phone: formatarTelefone(item.contact_phone),
        service_start_time: formatarDataHora(item.service_start_time),
        service_classification: formatarClassificacao(item.service_classification)
      }))
      
      // === TABELA DE DADOS ===
      autoTable(doc, {
        startY: yPosition,
        head: [colunas.map(col => col.header)],
        body: linhas.map(linha => colunas.map(col => linha[col.dataKey as keyof typeof linha])),
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [33, 37, 41],
          lineColor: [222, 226, 230],
          lineWidth: 0.2,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [52, 144, 220],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' }, // #
          1: { cellWidth: 35, halign: 'center' }, // Ticket
          2: { cellWidth: 45, halign: 'left' },   // Agente
          3: { cellWidth: 45, halign: 'left' },   // Cliente
          4: { cellWidth: 35, halign: 'center' }, // Telefone
          5: { cellWidth: 40, halign: 'center' }, // Data/Hora
          6: { cellWidth: 35, halign: 'center' }  // Classificação
        },
        margin: { top: 10, left: 10, right: 10, bottom: 25 },
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawPage: (data: any) => {
          // Linha decorativa no topo de cada página
          doc.setDrawColor(41, 128, 185)
          doc.setLineWidth(2)
          doc.line(0, 0, doc.internal.pageSize.getWidth(), 0)
        }
      })
      
      // === RODAPÉ PERSONALIZADO ===
      const totalPaginas = doc.getNumberOfPages()
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i)
        
        // Linha decorativa no rodapé
        doc.setDrawColor(41, 128, 185)
        doc.setLineWidth(1)
        doc.line(12, doc.internal.pageSize.getHeight() - 20, doc.internal.pageSize.getWidth() - 12, doc.internal.pageSize.getHeight() - 20)
        
        // Informações do rodapé
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 100)
        doc.setFont('helvetica', 'normal')
        
        // Total de registros (esquerda)
        const textoTotal = `Total de registros encontrados: ${dados.length}`
        doc.text(textoTotal, 15, doc.internal.pageSize.getHeight() - 12)
        
        // Data de geração (centro)
        const dataGeracao = `Gerado pela Agência Pizarro`
        doc.text(dataGeracao, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 12, { align: 'center' })
        
        // Número da página (direita)
        const numeroPagina = `Página ${i} de ${totalPaginas}`
        doc.text(numeroPagina, doc.internal.pageSize.getWidth() - 15, doc.internal.pageSize.getHeight() - 12, { align: 'right' })
      }
      
      // Salvar o PDF com nome mais descritivo
      const dataAtual = agora.toISOString().split('T')[0]
      const horaAtual = agora.toTimeString().split(' ')[0]?.replace(/:/g, '-') || 'horario'
      const nomeArquivo = `Relatorio-Atendimentos-Pizarro-${dataAtual}-${horaAtual}.pdf`
      doc.save(nomeArquivo)
      
      return { sucesso: true, nomeArquivo }
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      return { sucesso: false, erro: error }
    }
  }
  
  // Funções auxiliares
  const truncarTexto = (texto: string | null, tamanho: number): string => {
    if (!texto) return '-'
    return texto.length > tamanho ? texto.substring(0, tamanho - 3) + '...' : texto
  }
  
  const formatarDataHora = (dataHora: string | null): string => {
    if (!dataHora) return '-'
    try {
      // Tentar diferentes formatos de data
      const data = new Date(dataHora)
      
      // Verificar se a data é válida
      if (isNaN(data.getTime())) {
        // Se não conseguir converter, retornar o texto original truncado
        return truncarTexto(dataHora, 15)
      }
      
      return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } catch {
      return truncarTexto(dataHora, 15)
    }
  }
  
  const formatarTelefone = (telefone: string | null): string => {
    if (!telefone) return '-'
    // Remover caracteres especiais e formatar
    const numeroLimpo = telefone.replace(/\D/g, '')
    if (numeroLimpo.length === 11) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 7)}-${numeroLimpo.slice(7)}`
    } else if (numeroLimpo.length === 10) {
      return `(${numeroLimpo.slice(0, 2)}) ${numeroLimpo.slice(2, 6)}-${numeroLimpo.slice(6)}`
    }
    return telefone
  }
  
  const formatarClassificacao = (classificacao: string | null): string => {
    if (!classificacao) return '-'
    
    // Limpar o texto de caracteres especiais e emojis
    let textoLimpo = classificacao.trim()
    
    // Remover emojis e caracteres especiais
    textoLimpo = textoLimpo.replace(/[^\w\sÀ-ÿ]/g, '').trim()
    
    // Mapear classificações conhecidas com texto simples
    const mapeamento: { [key: string]: string } = {
      'Vermelho': 'VERMELHO',
      'Amarelo': 'AMARELO', 
      'Verde': 'VERDE',
      'Azul': 'AZUL',
      'Laranja': 'LARANJA',
      'Branco': 'BRANCO',
      'Preto': 'PRETO'
    }
    
    // Buscar correspondência case-insensitive
    const chaveEncontrada = Object.keys(mapeamento).find(
      chave => textoLimpo.toLowerCase().includes(chave.toLowerCase())
    )
    
    if (chaveEncontrada) {
      return mapeamento[chaveEncontrada]!
    }
    
    // Se não encontrar, retornar o texto limpo em maiúsculas
    return textoLimpo.toUpperCase() || 'N/A'
  }
  
  const formatarScore = (score: string | null): string => {
    if (!score) return '-'
    
    // Se já tem %, retornar como está
    if (score.includes('%')) return score
    
    // Se é um número, adicionar %
    const numeroScore = parseFloat(score)
    if (!isNaN(numeroScore)) {
      return `${numeroScore}%`
    }
    
    return score
  }
  
  return {
    gerarPDF
  }
}