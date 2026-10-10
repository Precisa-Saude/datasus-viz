# datasus-viz

[![CI](https://github.com/Precisa-Saude/datasus-viz/actions/workflows/ci.yml/badge.svg)](https://github.com/Precisa-Saude/datasus-viz/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm @precisa-saude/datasus-cli](https://img.shields.io/npm/v/@precisa-saude/datasus-cli?label=%40precisa-saude%2Fdatasus-cli)](https://www.npmjs.com/package/@precisa-saude/datasus-cli)

Geo-visualização interativa de microdados do DATASUS — agregações SIA-SUS de laboratório (SIGTAP 02.02 + LOINC) em choropleth Brasil → UF → município.

Mantido pela [Precisa Saúde](https://precisa-saude.com.br). Site público em [datasus-viz.pages.dev](https://datasus-viz.pages.dev).

---

## Em que família de repos este vive

Este repositório é o **viz consumer** do ecossistema DATASUS open-source da
Precisa Saúde. Para cada responsabilidade existe um repo dedicado:

| Repo                                                                   | Papel                                                                                                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [datasus-dbc](https://github.com/Precisa-Saude/datasus-dbc)            | Decoder DBC/DBF puro TS (PKWARE DCL Implode + xBase), zero dependências nativas                                                          |
| [datasus-sdk](https://github.com/Precisa-Saude/datasus-sdk)            | SDK de alto nível — FTP cliente, schemas tipados (SIA-PA, CNES-ST), terminologia (IBGE, LOINC, SIGTAP, TUSS, CBO), labeling e agregações |
| [datasus-parquet](https://github.com/Precisa-Saude/datasus-parquet)    | Arquivo público de microdados em Parquet (1:1 do DBC oficial, provenance SHA256), **recurso citável** para pesquisadores                 |
| [datasus-viz](https://github.com/Precisa-Saude/datasus-viz) **(este)** | Site/CLI de visualização consumindo o arquivo público                                                                                    |

---

## Escopo deste repo

- **`site`** — site Vite/React + MapLibre GL JS + DuckDB WASM com
  choropleth de biomarcadores laboratoriais por competência, com drill-down
  UF → município. Consome `parquet-opt/` derivado do arquivo público.
- **`packages/cli`** — CLI `datasus-viz` (nome histórico preservado para
  compatibilidade) para exploração ad-hoc de SIA-PA e CNES-ST com saída
  JSON/JSONL. Útil para análises pontuais sem abrir o navegador.

Tudo que é **decoder** e **SDK** mora nos repos linkados acima — este
repo consome `@precisa-saude/datasus-dbc@^2.0.0` e
`@precisa-saude/datasus-sdk@^2.0.1` via npm.

---

## Instalação da CLI

```bash
npm install -g @precisa-saude/datasus-cli
datasus-viz --help
```

A CLI conserva o nome histórico `datasus-viz` para evitar quebrar
scripts existentes.

---

## Site de visualização

Produção: [datasus-viz.pages.dev](https://datasus-viz.pages.dev) (Cloudflare Pages, sem custom domain).

Dev local:

```bash
pnpm install
pnpm -F @datasus-viz/site dev
```

Veja [`site/docs/`](site/docs/) para arquitetura,
pipeline de dados e deployment.

---

## Uso rápido da CLI

### Help

```bash
datasus-viz --help
```

### SIA-PA (produção ambulatorial)

```bash
# Top 10 procedimentos em laboratório com LOINC, em AC, jan/2024
datasus-viz sia --uf AC --year 2024 --month 1 --laboratory --enrich-loinc --top 10
```

### CNES-ST (cadastro de estabelecimentos)

```bash
datasus-viz cnes --uf AC --year 2024 --month 1 --top 5
```

Todas as flags e formatos em [`packages/cli/README.md`](packages/cli/README.md).

---

## Fontes de dados

- **DATASUS — SIA-SUS / Produção Ambulatorial (SIA-PA)**, microdados via
  FTP oficial. Pipeline em `@precisa-saude/datasus-sdk` →
  `datasus-parquet` → bucket S3 público consumido pelo site.
- **IBGE — Estimativas da População dos Municípios**, série histórica.
  SIDRA agregado 6579, variável 9324
  ([publicação](https://www.ibge.gov.br/estatisticas/sociais/populacao/9103-estimativas-de-populacao.html)).
  Consumido pela página `/explore` (detector per-capita + tooltip) via
  `site/public/data/populacao.json`. Atualização anual em duas etapas:

  ```bash
  pnpm install                                    # Node 22 + dependências
  pnpm -F @datasus-viz/site exec tsx \
    scripts/ingest-population.ts                  # acesso à SIDRA do IBGE
  ```

  O script normaliza códigos IBGE de 7 dígitos pros 6 dígitos usados
  nos parquets DATASUS, faz retry com backoff em falhas transitórias
  da SIDRA, e sobrescreve `populacao.json` idempotentemente. Falha
  com `exit 1` se a SIDRA estiver indisponível ou se o filesystem
  rejeitar a escrita.

## Cache de microdata

A CLI e o site (via SDK) reutilizam cache local de arquivos DBC:

- `$XDG_CACHE_HOME/datasus-viz/...` (ou `~/.cache/datasus-viz/...`)
- Estrutura idêntica ao FTP oficial; reexecuções hitam cache sem rede.

---

## Licença

Apache-2.0 (código). Ver [LICENSE](LICENSE).

Dados agregados publicados (quando aplicável) seguem CC-BY 4.0, derivados
dos microdados DATASUS sob regime de dados abertos (Lei 12.527/2011 +
Decreto 8.777/2016). Detalhes em
[`site/docs/data-license.md`](site/docs/data-license.md).

## Tooling versionado

A configuração deste repositório é mantida localmente. Atualizações de pacotes
e workflows compartilhados chegam pela PR agrupada `precisa-tooling` do
Renovate, com automerge desligado. Os workflows usam SHA com comentário de
versão. Revise o changelog e aguarde o CI antes de adotar cada atualização.

`precisa doctor` verifica requisitos estruturais; lint, build e testes rodam
nos jobs de CI. Para adicionar um arquivo ausente, use
`precisa scaffold --only <caminho> --dry-run`. Arquivos existentes são preservados.

A migração adota o CLI `2.0.0`, publicado no npm, e os workflows compartilhados
da [release v2.0.0](https://github.com/Precisa-Saude/tooling/releases/tag/v2.0.0),
fixados ao SHA `7a61cab18cac4aa7e2163f92dab77209109480de`. A versão e a tag foram
conferidas por `tooling/scripts/prepare-consumers.mjs`; atualizações futuras
continuam sendo revisadas em PRs do Renovate.

### Segurança dos workflows compartilhados

Os workflows e o `precisa doctor` usam tooling v3.0.0. Antes de mesclar esta
migração, a política `.github/review-policy.json` precisa estar em `main`. A
revisão externa começa desativada; sua ativação exige um PR que autorize o
provedor e os caminhos. O workflow lê a política do commit base, filtra o diff
e bloqueia conteúdo sensível antes de qualquer envio. Não há fallback implícito.

Checks têm acesso somente de leitura ao conteúdo. Release e publicação recebem
permissões e segredos específicos para cada job.

A publicação no npm exige aprovação no ambiente `npm-publish`. A recuperação
manual por tag só aceita uma GitHub Release publicada cujo commit pertença à
branch padrão; o checkout usa o SHA resolvido depois dessa validação.
