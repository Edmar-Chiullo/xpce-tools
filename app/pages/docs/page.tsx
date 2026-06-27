'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { BookOpen, FileText, Table, Download } from 'lucide-react'

const sections = [
  { id: 'visao-geral', label: 'Visão Geral' },
  { id: 'modulo-impressao', label: 'Módulo de Impressão A4' },
  { id: 'formato-dados', label: 'Formato de Dados' },
  { id: 'exemplo-planilha', label: 'Exemplo de Planilha' },
  { id: 'modulos-operacionais', label: 'Módulos Operacionais' },
  { id: 'sessao-inatividade', label: 'Sessão e Inatividade' },
  { id: 'perfis-usuario', label: 'Perfis de Usuário' },
]

export default function DocsPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleExport = useReactToPrint({
    contentRef,
    documentTitle: 'Manual-do-Sistema-PCE-Tools',
    onAfterPrint: () => console.log('PDF exportado'),
  })

  return (
    <>
      <div className="no-print sticky top-0 z-10 bg-white border-b border-zinc-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-zinc-700" />
          <h1 className="text-lg font-bold text-zinc-900">Documentação do Sistema</h1>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-zinc-950 text-white px-4 py-2 rounded-md text-sm hover:bg-zinc-800 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar Manual (PDF)
        </button>
      </div>

      <div ref={contentRef} className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-56 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Sumário</h2>
            <ul className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-zinc-600 hover:text-zinc-950 whitespace-nowrap md:whitespace-normal transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 min-w-0 space-y-10">
            <section id="visao-geral">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">1. Visão Geral</h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                O <strong>PCE Tools</strong> é um sistema de gestão logística que oferece ferramentas
                para controle de atividades operacionais em centros de distribuição.
              </p>
              <p className="text-zinc-700 leading-relaxed mb-3">
                O sistema é dividido nos seguintes módulos principais:
              </p>
              <ul className="list-disc list-inside text-zinc-700 space-y-1 ml-2">
                <li><strong>Dashboard</strong> — Indicadores e KPIs operacionais</li>
                <li><strong>Tarefas</strong> — Gerenciamento de atividades em tempo real</li>
                <li><strong>Ferramentas</strong> — Operações de coleta (rotativo, aéreo, quarentena, validação)</li>
                <li><strong>Utilitários</strong> — Impressão de etiquetas e códigos de barras em formato A4</li>
                <li><strong>Usuários</strong> — Administração de contas e permissões</li>
              </ul>
            </section>

            <section id="modulo-impressao">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">2. Módulo de Impressão A4</h2>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">2.1. Visão Geral</h3>
              <p className="text-zinc-700 leading-relaxed mb-3">
                O módulo de impressão permite gerar etiquetas com código de barras no formato CODE128
                a partir de uma planilha Excel (.xlsx). Existem três variantes de impressão:
              </p>
              <ul className="list-disc list-inside text-zinc-700 space-y-1 ml-2 mb-4">
                <li><strong>Ficha Pallet Padrão</strong> — Etiqueta com código do produto, validade, descrição e endereço</li>
                <li><strong>Ficha Pallet BL</strong> — Etiquetas agrupadas por endereço</li>
                <li><strong>Ficha Pallet Dunean</strong> — Etiqueta com filial e código do produto</li>
              </ul>

              <p className="text-zinc-700 leading-relaxed mb-3">
                <strong>Ficha Pallet BL — Detalhamento do agrupamento:</strong> Como cada caixa pode conter
                dois ou mais tipos de produtos diferentes, o sistema agrupa todos os códigos que compartilham
                o mesmo endereço e os renderiza lado a lado na mesma etiqueta A4. Isso garante que todos os
                itens de uma mesma caixa caibam em uma única folha, evitando etiquetas separadas por produto
                e otimizando a conferência no picking.
              </p>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">2.2. Passo a Passo</h3>
              <ol className="list-decimal list-inside text-zinc-700 space-y-2 ml-2 mb-4">
                <li>
                  Acesse <strong>Utilitários</strong> no menu lateral e selecione o tipo de etiqueta desejado.
                </li>
                <li>
                  Prepare uma planilha Excel (.xlsx) com as colunas conforme a tabela abaixo.
                </li>
                <li>
                  Clique no campo de upload e selecione o arquivo.
                </li>
                <li>
                  Após o carregamento, a pré-visualização das etiquetas será exibida.
                </li>
                <li>
                  Clique em <strong>Imprimir</strong> para abrir o diálogo de impressão do navegador.
                </li>
                <li>
                  Selecione "Salvar como PDF" ou sua impressora e confirme.
                </li>
              </ol>
            </section>

            <section id="formato-dados">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">3. Formato de Dados</h2>

              <p className="text-zinc-700 leading-relaxed mb-4">
                A planilha deve conter os dados na primeira aba. A <strong>primeira linha</strong> deve conter
                os nomes das colunas exatamente como especificado abaixo. Cada variante de impressão exige
                colunas específicas:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Variante</th>
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Colunas Esperadas</th>
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Obrigatório</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Ficha Pallet Padrão</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm bg-zinc-100 px-1 rounded">Codigo</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Validade</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Descricao</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Endereco</code></td>
                      <td className="border border-zinc-300 p-2">Todos</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Ficha Pallet BL</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm bg-zinc-100 px-1 rounded">Endereco</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Descricao</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Codigo</code></td>
                      <td className="border border-zinc-300 p-2">Todos</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Ficha Pallet Dunean</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm bg-zinc-100 px-1 rounded">Filial</code>, <code className="text-sm bg-zinc-100 px-1 rounded">Codigo</code></td>
                      <td className="border border-zinc-300 p-2">Todos</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">3.1. Campo Validade</h3>
              <p className="text-zinc-700 leading-relaxed mb-3">
                O campo <code className="text-sm bg-zinc-100 px-1 rounded">Validade</code> aceita dois formatos:
              </p>
              <ul className="list-disc list-inside text-zinc-700 space-y-1 ml-2 mb-4">
                <li><strong>Número serial do Excel</strong> (ex: <code className="text-sm bg-zinc-100 px-1 rounded">45123</code>) — convertido automaticamente para <code className="text-sm bg-zinc-100 px-1 rounded">dd/mm/aaaa</code></li>
                <li><strong>Texto</strong> no formato <code className="text-sm bg-zinc-100 px-1 rounded">dd/mm/aaaa</code> — exibido como está</li>
              </ul>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">3.2. Observações</h3>
              <ul className="list-disc list-inside text-zinc-700 space-y-1 ml-2 mb-4">
                <li>Os nomes das colunas são <strong>case-sensitive</strong> (maiúsculas/minúsculas devem coincidir)</li>
                <li>A primeira linha do arquivo será interpretada como cabeçalho</li>
                <li>Valores em branco podem resultar em etiquetas vazias</li>
                <li>O formato do código de barras é <strong>CODE128</strong></li>
              </ul>
            </section>

            <section id="exemplo-planilha">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">4. Exemplo de Planilha</h2>

              <p className="text-zinc-700 leading-relaxed mb-4">
                Abaixo, um exemplo visual de como a planilha deve ser estruturada para a <strong>Ficha Pallet Padrão</strong>:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Codigo</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Validade</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Descricao</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Endereco</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560010</code></td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">45123</code></td>
                      <td className="border border-zinc-300 p-2">ARROZ TIO JOÃO 5KG</td>
                      <td className="border border-zinc-300 p-2">PP010010A</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560027</code></td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">45200</code></td>
                      <td className="border border-zinc-300 p-2">FEIJÃO CARIOCA 1KG</td>
                      <td className="border border-zinc-300 p-2">PP010020B</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560034</code></td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">45180</code></td>
                      <td className="border border-zinc-300 p-2">AÇÚCAR CRISTAL 2KG</td>
                      <td className="border border-zinc-300 p-2">PP030030C</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-zinc-700 leading-relaxed mb-3">
                Para a <strong>Ficha Pallet BL</strong>, a planilha deve conter:
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Endereco</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Descricao</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Codigo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-300 p-2">PP010010A</td>
                      <td className="border border-zinc-300 p-2">ARROZ TIO JOÃO 5KG</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560010</code></td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2">PP010020B</td>
                      <td className="border border-zinc-300 p-2">FEIJÃO CARIOCA 1KG</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560027</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-zinc-700 leading-relaxed mb-3">
                Para a <strong>Ficha Pallet Dunean</strong>, a planilha deve conter:
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Filial</th>
                      <th className="border border-zinc-300 p-2 font-semibold text-zinc-800">Codigo</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-300 p-2">MATRIZ</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560010</code></td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2">FILIAL 02</td>
                      <td className="border border-zinc-300 p-2"><code className="text-sm">7891234560027</code></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="modulos-operacionais">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">5. Módulos Operacionais</h2>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">5.1. Rotativo de Picking</h3>
              <p className="text-zinc-700 leading-relaxed mb-4">
                Utilizado para obter a quantidade que há no picking.
                O operador lê o endereço e confirma a quantidade coletada.
              </p>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">5.2. Aéreo Vazio</h3>
              <p className="text-zinc-700 leading-relaxed mb-4">
                Gerencia a conferência de posições aéreas vazias no estoque,
                garantindo que não haja divergências entre o sistema e o físico.
              </p>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">5.3. Quarentena Fracionada</h3>
              <p className="text-zinc-700 leading-relaxed mb-4">
                Produtos fracionados são relacionados e separados para envio
                a uma filial.
              </p>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">5.4. Validação de Produto e Endereço</h3>
              <p className="text-zinc-700 leading-relaxed mb-4">
                Confere se o produto está no endereço correto dentro do centro
                de distribuição, lendo o código do produto e o endereço.
              </p>

              <h3 className="text-lg font-semibold text-zinc-800 mb-2">5.5. Validação Master de Expedição</h3>
              <p className="text-zinc-700 leading-relaxed mb-4">
                Valida o master (volumização) durante a expedição, garantindo
                que os volumes estejam corretos antes do carregamento.
              </p>

            <section id="sessao-inatividade">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">6. Sessão e Inatividade</h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                Por segurança, a sessão do usuário expira automaticamente após <strong>5 minutos de inatividade</strong>.
                Qualquer interação (movimento do mouse, clique, toque na tela ou digitação) reinicia o contador.
              </p>
              <p className="text-zinc-700 leading-relaxed mb-3">
                Quando o tempo de inatividade é atingido, o sistema efetua logout automaticamente e
                redireciona para a tela de login. Todas as atividades em andamento são preservadas no
                banco de dados e podem ser retomadas após novo login.
              </p>
              <p className="text-zinc-700 leading-relaxed mb-3">
                Esta política se aplica a todos os módulos do sistema, incluindo as ferramentas de coleta
                e os utilitários de impressão.
              </p>
            </section>

            <section id="perfis-usuario">
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">7. Perfis de Usuário</h2>
              <p className="text-zinc-700 leading-relaxed mb-3">
                O sistema conta com cinco níveis de permissão, cada um com acesso a funcionalidades específicas:
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm border-collapse border border-zinc-300">
                  <thead>
                    <tr className="bg-zinc-100">
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Perfil</th>
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Acessos</th>
                      <th className="border border-zinc-300 p-2 text-left font-semibold text-zinc-800">Pode Criar Usuários</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Aux. Logística</td>
                      <td className="border border-zinc-300 p-2">Início, Ferramentas, Utilitários, Documentação</td>
                      <td className="border border-zinc-300 p-2 text-red-600">Não</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Ana. Logística</td>
                      <td className="border border-zinc-300 p-2">Início, Dashboard, Tarefas, Ferramentas, Utilitários, Documentação</td>
                      <td className="border border-zinc-300 p-2 text-red-600">Não</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Ana. Logística 2</td>
                      <td className="border border-zinc-300 p-2">Início, Dashboard, Tarefas, Ferramentas, Utilitários, Documentação, Usuários</td>
                      <td className="border border-zinc-300 p-2 text-green-600">Sim (apenas Aux. e Ana. Logística)</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Gerente</td>
                      <td className="border border-zinc-300 p-2">Início, Dashboard, Tarefas, Ferramentas, Utilitários, Documentação, Usuários</td>
                      <td className="border border-zinc-300 p-2 text-green-600">Sim (exceto Admin)</td>
                    </tr>
                    <tr>
                      <td className="border border-zinc-300 p-2 font-medium">Admin</td>
                      <td className="border border-zinc-300 p-2">Todos os módulos, incluindo Migração</td>
                      <td className="border border-zinc-300 p-2 text-green-600">Sim (todos os perfis)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex items-center gap-2 text-sm text-zinc-400 border-t border-zinc-200 pt-4 mt-6">
              <FileText className="w-4 h-4" />
              <span>PCE Tools v0.1.0 — Documentação do Sistema</span>
            </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
