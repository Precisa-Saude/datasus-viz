import { DocLayout, InlineToc, type TocItem } from '../components/DocLayout';
import { TYPE } from '../lib/typography';

const TOC: readonly TocItem[] = [
  { id: 'o-que-e', label: 'O que é' },
  { id: 'fontes', label: 'Fontes' },
  { id: 'limitacoes', label: 'Limitações conhecidas' },
  { id: 'revisoes', label: 'Atualizações e revisões' },
  { id: 'detectores', label: 'Detectores de anomalia' },
  { id: 'licenca', label: 'Licença e uso' },
];

export default function Sobre() {
  return (
    <DocLayout toc={TOC}>
      <header>
        <h1 className={TYPE.pageTitle}>Sobre</h1>
      </header>

      <InlineToc items={TOC} />

      <section className="space-y-4" id="o-que-e">
        <h2 className={TYPE.h2}>O que é</h2>
        <p>
          Visualização geográfica interativa dos exames laboratoriais faturados ao SUS. Os dados vêm
          do <strong>SIA-SUS — Produção Ambulatorial (PA)</strong>, filtrados pelo grupo SIGTAP{' '}
          <code className="font-mono text-[0.9em]">02.02</code> (Diagnóstico em Laboratório Clínico)
          e cruzados com o catálogo LOINC da plataforma Precisa Saúde para expor os dados em termos
          de biomarcadores clínicos reconhecidos internacionalmente.
        </p>
      </section>

      <section className="space-y-4" id="fontes">
        <h2 className={TYPE.h2}>Fontes</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>DATASUS/SIA-SUS</strong>: microdados públicos do Sistema de Informações
            Ambulatoriais, baixados do FTP oficial (
            <code className="font-mono text-[0.9em]">ftp.datasus.gov.br</code>). Schema vintage
            SIA-PA 2008+.
          </li>
          <li>
            <strong>Geometrias</strong>: shapefiles oficiais do IBGE distribuídos pelo projeto{' '}
            <a
              className="underline"
              href="https://ipeagit.github.io/geobr/"
              rel="noreferrer"
              target="_blank"
            >
              geobr (IPEA)
            </a>
            , simplificados para renderização eficiente no browser.
          </li>
          <li>
            <strong>LOINC ↔ SIGTAP</strong>: mapeamento derivado da tabela oficial TUSS↔SIGTAP da
            ANS, refinado por LLM (Gemini 3.1 Pro) para resolver colisões semânticas. 164
            biomarcadores do <code className="font-mono text-[0.9em]">@precisa-saude/fhir</code>.
          </li>
          <li>
            <strong>População</strong>: estimativas municipais do IBGE —{' '}
            <a
              className="underline"
              href="https://sidra.ibge.gov.br/tabela/6579"
              rel="noreferrer"
              target="_blank"
            >
              SIDRA, agregado 6579
            </a>
            , variável 9324 (população residente). Usada para normalizar os detectores per capita e
            de concentração. A série tem lacunas nos anos de censo e de não-publicação (2010, 2022 e
            2023); para esses anos o lookup cai no ano publicado mais próximo do mesmo município, em
            vez de interpolar.
          </li>
        </ul>
      </section>

      <section className="space-y-4" id="limitacoes">
        <h2 className={TYPE.h2}>Limitações conhecidas</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Sub-registro</strong>: o SIA-SUS depende do faturamento do estabelecimento ao
            SUS. Nem todo exame realizado aparece — problemas de BPA ou atrasos administrativos
            subestimam o volume real. Para análise sistemática, ver{' '}
            <a
              className="underline"
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC10508673/"
              rel="noreferrer"
              target="_blank"
            >
              PMC 10508673
            </a>
            .
          </li>
          <li>
            <strong>Cobertura LOINC</strong>: o enrichment cobre apenas os 164 biomarcadores do
            catálogo Precisa Saúde. Exames do grupo 02.02 fora dessa lista aparecem nas agregações
            brutas mas não têm equivalência LOINC exibida.
          </li>
          <li>
            <strong>Semântica dos valores</strong>: o eixo "volume" usa{' '}
            <code className="font-mono text-[0.9em]">PA_QTDAPR</code> (aprovada pelo SUS), que pode
            divergir da quantidade apresentada. Valores em reais correntes, sem correção
            inflacionária.
          </li>
          <li>
            <strong>Recorte geográfico</strong>: agregação pela UF do estabelecimento executor (
            <code className="font-mono text-[0.9em]">PA_UFMUN</code>), não pelo município de
            residência do paciente. Para análise de acesso a serviços, este é o recorte certo; para
            prevalência populacional, usar com cuidado.
          </li>
        </ul>
      </section>

      <section className="space-y-4" id="revisoes">
        <h2 className={TYPE.h2}>Atualizações e revisões</h2>
        <p>
          Os números das competências mais recentes são <strong>provisórios</strong>. O DATASUS
          publica um arquivo por UF e competência e, a cada publicação mensal, reescreve não só a
          competência nova como as anteriores. Entre versões, os arquivos ganham e perdem registros,
          o que é consistente com produção apresentada com atraso e com correções. Pelas datas dos
          arquivos no FTP, cada publicação reescreve a competência mais recente e as 12 anteriores;
          depois disso, a competência deixa de mudar. Esse padrão é observado nos próprios arquivos,
          não uma regra publicada pelo DATASUS.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Sem registro de alterações</strong>: o DATASUS não publica changelog nem
            manifesto do que mudou entre uma versão e outra. O único sinal é a data e o tamanho de
            cada arquivo no FTP.
          </li>
          <li>
            <strong>Mudanças só aparecem decodificando o arquivo inteiro</strong>: os arquivos são
            DBC (DBF compactado), e a ordem dos registros não se mantém entre publicações. Uma
            comparação byte a byte ou por trecho não identifica o que mudou; é preciso baixar e
            decodificar cada arquivo alterado.
          </li>
          <li>
            <strong>O layout também muda</strong>: na publicação de setembro de 2026, os arquivos de
            2025-08 a 2026-07 ganharam o campo{' '}
            <code className="font-mono text-[0.9em]">PA_VL_CRD</code> (numérico), sem definição na
            documentação pública do DATASUS e zerado em todos os arquivos que verificamos. O site
            não usa esse campo.
          </li>
          <li>
            <strong>Defasagem em relação ao DATASUS</strong>: este site reprocessa as competências
            quando os arquivos do FTP mudam, mas entre uma publicação do DATASUS e o fim do
            reprocessamento os valores exibidos podem corresponder à versão anterior. A data em
            "Atualizado em" indica quando os dados do site foram gerados.
          </li>
        </ul>
      </section>

      <section className="space-y-4" id="detectores">
        <h2 className={TYPE.h2}>Detectores de anomalia</h2>
        <p>
          O site marca combinações de município, competência e exame que destoam do padrão. A
          marcação é <strong>estatística, não uma afirmação de erro ou irregularidade</strong>: os
          valores exibidos são exatamente os que o DATASUS publicou, e a origem da divergência não é
          observável a partir do dado agregado.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Concentração</strong>: compara a fatia do volume nacional de um exame com a
            fatia da população que o município representa, e marca a partir de{' '}
            <strong>10× a proporção populacional</strong> (com pelo menos 20% do volume do par
            exame×competência). A normalização por população é necessária: sem ela o detector media
            sobretudo tamanho — São Paulo capital, com 5,8% da população, respondia sozinha por 64%
            das marcações, com apenas ~4× a própria proporção. Municípios sem população publicada
            são pulados, não estimados.
          </li>
          <li>
            <strong>Per capita</strong>: exames por mil habitantes, restrito a municípios de 5 mil a
            50 mil habitantes — o sinal de interesse é volume desproporcional em cidade pequena, não
            escala demográfica de capital.
          </li>
          <li>
            <strong>Pico temporal</strong>: volume de um mês frente à mediana histórica do próprio
            município, que não depende de comparação entre municípios.
          </li>
          <li>
            <strong>Preço por exame</strong>: reais por exame fora do intervalo interquartil do par
            exame×ano.
          </li>
        </ul>
        <p className="text-muted-foreground text-sm">
          Os parâmetros são fixos no pipeline (
          <code className="font-mono text-xs">scripts/compute-anomalies.ts</code>) e cada artefato
          guarda o total de hits antes do truncamento em top-N, para que o corte seja auditável.
        </p>
      </section>

      <section className="space-y-4" id="licenca">
        <h2 className={TYPE.h2}>Licença e uso</h2>
        <p>
          Software licenciado sob{' '}
          <a
            className="underline"
            href="https://www.apache.org/licenses/LICENSE-2.0"
            rel="noreferrer"
            target="_blank"
          >
            Apache-2.0
          </a>
          . Microdados do DATASUS são públicos (Lei de Acesso à Informação). Esta ferramenta é para
          uso informativo, educacional e de pesquisa — não substitui análise epidemiológica
          profissional nem decisões clínicas.
        </p>
      </section>
    </DocLayout>
  );
}
