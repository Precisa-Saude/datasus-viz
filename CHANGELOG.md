## [1.12.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.11.0...v1.12.0) (2026-09-09)

### Features

* **site:** copy de município sem laboratório e explicação do baseline ([#65](https://github.com/Precisa-Saude/datasus-viz/issues/65)) ([2794b97](https://github.com/Precisa-Saude/datasus-viz/commit/2794b976366754403c796fa38f7a26736217438a))

## [1.11.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.10.0...v1.11.0) (2026-09-09)

### Features

* **site:** double-click no histograma abre o ano-calendário clicado ([#64](https://github.com/Precisa-Saude/datasus-viz/issues/64)) ([2749daf](https://github.com/Precisa-Saude/datasus-viz/commit/2749daf5426dd6226ffcf4abeeced82faa92a113))

## [1.10.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.9.0...v1.10.0) (2026-09-09)

### Features

* **site:** nomes de município, double-click no histograma e cabeçalho opaco ([#63](https://github.com/Precisa-Saude/datasus-viz/issues/63)) ([72bac88](https://github.com/Precisa-Saude/datasus-viz/commit/72bac882c4870101321c697bce47508f554fa5c5))

## [1.9.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.8.0...v1.9.0) (2026-09-09)

### Features

* **site:** cabeçalho opaco na tabela e link pro LOINC oficial ([#62](https://github.com/Precisa-Saude/datasus-viz/issues/62)) ([d7b7846](https://github.com/Precisa-Saude/datasus-viz/commit/d7b7846591bfe52f360bd498c2a41b869755dd98))

## [1.8.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.7...v1.8.0) (2026-09-09)

### Features

* **site:** escala robusta no mapa e alerta de volume atípico ([#61](https://github.com/Precisa-Saude/datasus-viz/issues/61)) ([f46eb6c](https://github.com/Precisa-Saude/datasus-viz/commit/f46eb6cf8ff847cbb0b41d5c4481f9fe7d0bb08e))

## [1.7.7](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.6...v1.7.7) (2026-09-09)

### Bug Fixes

* **ci:** guard de release compara desde a última release, não o push ([#56](https://github.com/Precisa-Saude/datasus-viz/issues/56)) ([4dd5ff1](https://github.com/Precisa-Saude/datasus-viz/commit/4dd5ff135eba49002856c384bea0f8b35850b8dc))
* **ci:** publish-watch aceita pacote sem tag quando bate com o package.json ([#55](https://github.com/Precisa-Saude/datasus-viz/issues/55)) ([68c7cbf](https://github.com/Precisa-Saude/datasus-viz/commit/68c7cbf726bb5f6a824d2b84bc9d5cb366b62ef4)), closes [#48](https://github.com/Precisa-Saude/datasus-viz/issues/48) [tooling#52](https://github.com/Precisa-Saude/tooling/issues/52)
* **ci:** publish-watch compara a versão do pacote, não a maior tag ([#54](https://github.com/Precisa-Saude/datasus-viz/issues/54)) ([4533832](https://github.com/Precisa-Saude/datasus-viz/commit/45338328330e7ac38c72431b724fbc6b041dedd0)), closes [tooling#51](https://github.com/Precisa-Saude/tooling/issues/51)
* **ci:** restaura require_package_changes: false e declara a divergência ([#60](https://github.com/Precisa-Saude/datasus-viz/issues/60)) ([3a844d8](https://github.com/Precisa-Saude/datasus-viz/commit/3a844d8c3e63d78d55ffa82648932677f7101562)), closes [#52](https://github.com/Precisa-Saude/datasus-viz/issues/52) [#36](https://github.com/Precisa-Saude/datasus-viz/issues/36)
* **site:** aguarda o manifest antes de consultar o parquet versionado ([#59](https://github.com/Precisa-Saude/datasus-viz/issues/59)) ([ef54f53](https://github.com/Precisa-Saude/datasus-viz/commit/ef54f5332aecfc511b4fda7c64ab53b0310e60df))

### CI/CD

* atualizar GitHub Actions para o runtime Node 24 ([#50](https://github.com/Precisa-Saude/datasus-viz/issues/50)) ([f892f9e](https://github.com/Precisa-Saude/datasus-viz/commit/f892f9efc8d88e3ef5aea747d7ac795414161021))
* sincroniza template de review-dispatch (pr_number como number) ([#58](https://github.com/Precisa-Saude/datasus-viz/issues/58)) ([a128781](https://github.com/Precisa-Saude/datasus-viz/commit/a12878153d416c41b0f45322f19f48e3b4e77035))

### Chores

* **ci:** publish-watch passa de cron 15min para diário ([#47](https://github.com/Precisa-Saude/datasus-viz/issues/47)) ([faad2b9](https://github.com/Precisa-Saude/datasus-viz/commit/faad2b9396d739253366af74541f923f8385bcec))
* **ci:** sincroniza templates do cli 1.13.1 ([#53](https://github.com/Precisa-Saude/datasus-viz/issues/53)) ([b27e7d5](https://github.com/Precisa-Saude/datasus-viz/commit/b27e7d538583ecd88804d852df2c24404e65db60)), closes [tooling#47](https://github.com/Precisa-Saude/tooling/issues/47) [tooling#48](https://github.com/Precisa-Saude/tooling/issues/48) [tooling#50](https://github.com/Precisa-Saude/tooling/issues/50)
* **ci:** sincroniza templates e declara divergências deliberadas ([#52](https://github.com/Precisa-Saude/datasus-viz/issues/52)) ([4b6e2c8](https://github.com/Precisa-Saude/datasus-viz/commit/4b6e2c82c63cc35af95da10921c939bf8f202b29))

## [1.7.6](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.5...v1.7.6) (2026-05-19)

### Bug Fixes

* **site:** remover bearing 180 do mapa pra voltar à orientação padrão ([e313aaa](https://github.com/Precisa-Saude/datasus-viz/commit/e313aaa30f49997bd4427e40075b213ea2b027c4))

## [1.7.5](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.4...v1.7.5) (2026-05-18)

### Bug Fixes

* **ci:** diff inclui parquetOptVersion pra detectar mudança de URL ([#46](https://github.com/Precisa-Saude/datasus-viz/issues/46)) ([ae1833f](https://github.com/Precisa-Saude/datasus-viz/commit/ae1833fd9475177826476ab0ef86b6879b441f9f)), closes [#45](https://github.com/Precisa-Saude/datasus-viz/issues/45) [#45](https://github.com/Precisa-Saude/datasus-viz/issues/45)

## [1.7.4](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.3...v1.7.4) (2026-05-18)

### Bug Fixes

* **site:** URLs versionadas para parquet-opt — bust cache automático ([#45](https://github.com/Precisa-Saude/datasus-viz/issues/45)) ([664a791](https://github.com/Precisa-Saude/datasus-viz/commit/664a791528bec06fd293af8a170d52a18a3c75e1))

## [1.7.3](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.2...v1.7.3) (2026-05-18)

### Bug Fixes

* **ci:** role-duration 3h + cache build/parquet entre runs ([#44](https://github.com/Precisa-Saude/datasus-viz/issues/44)) ([bb11867](https://github.com/Precisa-Saude/datasus-viz/commit/bb118674edfe2d9ae869087e0ed31e099c949d5d))

## [1.7.2](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.1...v1.7.2) (2026-05-18)

### Bug Fixes

* **site:** retry+fail-loud no aggregate, guard regressão no refresh ([#43](https://github.com/Precisa-Saude/datasus-viz/issues/43)) ([15df56b](https://github.com/Precisa-Saude/datasus-viz/commit/15df56bc20b4b5d817d07fda53d68739dbb567e2))

### CI/CD

* pin actions e adicionar tripwire publish-watch (postmortem TanStack) ([#41](https://github.com/Precisa-Saude/datasus-viz/issues/41)) ([8eb6291](https://github.com/Precisa-Saude/datasus-viz/commit/8eb6291f8b3cc9ce4db90c33d79b6248283d3924))

### Chores

* renomear datasus-brasil → datasus-viz em todo o conteúdo ([#42](https://github.com/Precisa-Saude/datasus-viz/issues/42)) ([88cf321](https://github.com/Precisa-Saude/datasus-viz/commit/88cf3211bac2830db51d1dbf8eae59dc9d24786e))

## [1.7.1](https://github.com/Precisa-Saude/datasus-viz/compare/v1.7.0...v1.7.1) (2026-05-13)

### Bug Fixes

* **site:** integridade do drill-down do explorador e UX (linha, modal CNES, hover) ([#40](https://github.com/Precisa-Saude/datasus-viz/issues/40)) ([32dcbe1](https://github.com/Precisa-Saude/datasus-viz/commit/32dcbe1312eafce931c24b5f67bf60a7c835838e))

## [1.7.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.6.0...v1.7.0) (2026-05-13)

### Features

* **site:** visão "Todos os Estados" no explorador + pré-cômputo de atipicidades ([#39](https://github.com/Precisa-Saude/datasus-viz/issues/39)) ([a08bd4a](https://github.com/Precisa-Saude/datasus-viz/commit/a08bd4ad44c25cd3c50bc5a28b495e38086f30c3))

## [1.6.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.5.0...v1.6.0) (2026-05-12)

### Features

* **site:** detalhamento por CNES + reagregação de partições revistas ([#38](https://github.com/Precisa-Saude/datasus-viz/issues/38)) ([cb455a7](https://github.com/Precisa-Saude/datasus-viz/commit/cb455a70cbe40cd2e048a3a9d4018a3a9fcb4c3c))

## [1.5.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.4.0...v1.5.0) (2026-05-12)

### Features

* **site:** explorar atipicidades por UF, município e exame ([#37](https://github.com/Precisa-Saude/datasus-viz/issues/37)) ([038809c](https://github.com/Precisa-Saude/datasus-viz/commit/038809cc7ea71e0cd8acd7e1ec379ea7d3bb908c))

## [1.4.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.3.2...v1.4.0) (2026-05-07)

### Features

* **site:** auto-refresh do pipeline + indicador de freshness na UI ([a8856ff](https://github.com/Precisa-Saude/datasus-viz/commit/a8856ff6b9fc4a7404e50ab18b08672399e62010))
* **site:** brush + histograma de competências (Falcon-style) ([#35](https://github.com/Precisa-Saude/datasus-viz/issues/35)) ([1a8e969](https://github.com/Precisa-Saude/datasus-viz/commit/1a8e969183b8d3c300e7901770706d3b76bd632f))
* **site:** página /tendências com séries temporais e comparação multi-UF/exame ([#28](https://github.com/Precisa-Saude/datasus-viz/issues/28)) ([66ea734](https://github.com/Precisa-Saude/datasus-viz/commit/66ea734f527c605ea1472a167434a79380610444))
* **site:** roteamento por path no mapa (drill-down ↔ URL) ([#31](https://github.com/Precisa-Saude/datasus-viz/issues/31)) ([1a4886f](https://github.com/Precisa-Saude/datasus-viz/commit/1a4886f2f462eff8a8ce715d735ae5cae5d40aed))

### Bug Fixes

* **ci:** desativar guard de packages/** no release ([#36](https://github.com/Precisa-Saude/datasus-viz/issues/36)) ([5866ce8](https://github.com/Precisa-Saude/datasus-viz/commit/5866ce848c2bfbb8c38d9468d578c11164d66415)), closes [#22](https://github.com/Precisa-Saude/datasus-viz/issues/22)
* **ci:** re-issue STS credentials antes do Upload no refresh.yml ([#33](https://github.com/Precisa-Saude/datasus-viz/issues/33)) ([7759a73](https://github.com/Precisa-Saude/datasus-viz/commit/7759a7361e6c5c368cf29a16119c2cae4e712658))
* **site:** carregar DuckDB-wasm de jsDelivr (desbloquear deploy CF Pages) ([#23](https://github.com/Precisa-Saude/datasus-viz/issues/23)) ([083916a](https://github.com/Precisa-Saude/datasus-viz/commit/083916a98f6a611cc9e9396615ed4ff403283f85))
* **site:** drilldown no clique de UF + ajustes de layout do mapa ([#26](https://github.com/Precisa-Saude/datasus-viz/issues/26)) ([37b3617](https://github.com/Precisa-Saude/datasus-viz/commit/37b36171d295f7864efe36b4d574a4622bb36847))
* **site:** pré-instala httpfs uma vez pra evitar SIGSEGV no aggregate ([#34](https://github.com/Precisa-Saude/datasus-viz/issues/34)) ([81fefde](https://github.com/Precisa-Saude/datasus-viz/commit/81fefde2c26759b5802cf6da455eb2da8988bfc4)), closes [#30](https://github.com/Precisa-Saude/datasus-viz/issues/30) [#17](https://github.com/Precisa-Saude/datasus-viz/issues/17)

### Performance

* **site:** paraleliza meses no aggregate-sia-parquet ([#30](https://github.com/Precisa-Saude/datasus-viz/issues/30)) ([b68f354](https://github.com/Precisa-Saude/datasus-viz/commit/b68f35441b6b77a6310234c566677049f3f206a4)), closes [#29](https://github.com/Precisa-Saude/datasus-viz/issues/29)

### Documentation

* alinhar README com std do ecossistema (badges + separadores + URL prod) ([#25](https://github.com/Precisa-Saude/datasus-viz/issues/25)) ([4575801](https://github.com/Precisa-Saude/datasus-viz/commit/4575801234110e9a313c76d7aa043b6517ed0e44))

### CI/CD

* bump pnpm/action-setup para v5 (Node.js 24) ([#24](https://github.com/Precisa-Saude/datasus-viz/issues/24)) ([6409e80](https://github.com/Precisa-Saude/datasus-viz/commit/6409e806f6039cc23b385d65a14354c7a1d970a2))
* bump refresh timeout-minutes 180 → 480 ([#29](https://github.com/Precisa-Saude/datasus-viz/issues/29)) ([599c83c](https://github.com/Precisa-Saude/datasus-viz/commit/599c83cac2f9be65ac4a2dc71fe8d5f3f5c6ac45))

## [1.3.2](https://github.com/Precisa-Saude/datasus-viz/compare/v1.3.1...v1.3.2) (2026-04-24)

### Bug Fixes

* **ci:** usar contexto do repo atual no pr-review-responder ([#17](https://github.com/Precisa-Saude/datasus-viz/issues/17)) ([fae51eb](https://github.com/Precisa-Saude/datasus-viz/commit/fae51eb77e83fdb334b9f35607a95064485cfb8e))

### Refactoring

* **site:** mover packages/site → site/ pra alinhar com o ecossistema ([#22](https://github.com/Precisa-Saude/datasus-viz/issues/22)) ([b11b96b](https://github.com/Precisa-Saude/datasus-viz/commit/b11b96b4f677444d5dc48d32ef4c99f638819364))

### Documentation

* **site:** remover referencias obsoletas a datasus-viz e branch PRE-206 ([#16](https://github.com/Precisa-Saude/datasus-viz/issues/16)) ([a2e73a5](https://github.com/Precisa-Saude/datasus-viz/commit/a2e73a5dcdaaf4be74a1f2d277eebdeb54a64b22))

### Chores

* **config:** precisa sync — governance/issue/PR templates ([#20](https://github.com/Precisa-Saude/datasus-viz/issues/20)) ([47ada22](https://github.com/Precisa-Saude/datasus-viz/commit/47ada223161b058cce08a1bc87c32631e43251cb))
* **config:** precisa sync — publishPackages + site wiring + template refresh ([#19](https://github.com/Precisa-Saude/datasus-viz/issues/19)) ([669f0f7](https://github.com/Precisa-Saude/datasus-viz/commit/669f0f7065383cb407fdfe0b0fa7ab3fac0df235)), closes [Precisa-Saude/tooling#28](https://github.com/Precisa-Saude/tooling/issues/28)
* **config:** remover shamefully-hoist=false do .npmrc ([#18](https://github.com/Precisa-Saude/datasus-viz/issues/18)) ([2022034](https://github.com/Precisa-Saude/datasus-viz/commit/20220347185ac7a5d8b0cf1671b2bcee9ef213d6)), closes [Precisa-Saude/tooling#26](https://github.com/Precisa-Saude/tooling/issues/26)
* **config:** siteSourcePath=packages/site/ + sync do _deploy-site ([#21](https://github.com/Precisa-Saude/datasus-viz/issues/21)) ([9046862](https://github.com/Precisa-Saude/datasus-viz/commit/9046862ae61f7beca66055c0ecec42fa49c9752a)), closes [Precisa-Saude/tooling#29](https://github.com/Precisa-Saude/tooling/issues/29)

## [1.3.1](https://github.com/Precisa-Saude/datasus-viz/compare/v1.3.0...v1.3.1) (2026-04-24)

### Refactoring

* **site:** ler raw Parquet via HTTPS de datasus-parquet ([#15](https://github.com/Precisa-Saude/datasus-viz/issues/15)) ([68fbf44](https://github.com/Precisa-Saude/datasus-viz/commit/68fbf44b533bdde9169a0f2184782f34425f7d12))

## [1.3.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.2.0...v1.3.0) (2026-04-24)

### Features

* **site:** automação SIA-PA — provenance, detect-new, per-month refactor, data-license ([#13](https://github.com/Precisa-Saude/datasus-viz/issues/13)) ([d96c1db](https://github.com/Precisa-Saude/datasus-viz/commit/d96c1db85db577e13fea777f3bf25791e938d8e6))

### Bug Fixes

* **ci:** atualizar publish packages para apenas packages/cli ([#14](https://github.com/Precisa-Saude/datasus-viz/issues/14)) ([1cf5b77](https://github.com/Precisa-Saude/datasus-viz/commit/1cf5b778ff6ec02a2098617f608a162956e5229f))

## [1.2.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.1.0...v1.2.0) (2026-04-24)

### Features

* **site:** geo-visualização de biomarcadores com Mapbox + SIA-PA ([#10](https://github.com/Precisa-Saude/datasus-viz/issues/10)) ([1f632ed](https://github.com/Precisa-Saude/datasus-viz/commit/1f632ede79c7c3ed4a465d81b3e8e9047fccaa18)), closes [#f3f0ff](https://github.com/Precisa-Saude/datasus-viz/issues/f3f0ff)

### Chores

* cleanup pós-split — remover packages extraídos + rename pra datasus-viz ([#11](https://github.com/Precisa-Saude/datasus-viz/issues/11)) ([495b695](https://github.com/Precisa-Saude/datasus-viz/commit/495b695c50d6dc9e0e465908d4ab59537c27e832))

## [1.1.0](https://github.com/Precisa-Saude/datasus-viz/compare/v1.0.0...v1.1.0) (2026-04-23)

### Features

* SIA-SUS (PA) — dataset, bridge SIGTAP→LOINC e CLI ([#9](https://github.com/Precisa-Saude/datasus-viz/issues/9)) ([4fb88e9](https://github.com/Precisa-Saude/datasus-viz/commit/4fb88e95b84b1aa75bf20e56e51e85ca94997b13))

### Chores

* **deps:** bump @precisa-saude/* para ^1.5.0 ([#8](https://github.com/Precisa-Saude/datasus-viz/issues/8)) ([1543d6e](https://github.com/Precisa-Saude/datasus-viz/commit/1543d6e3cc1af689352eef6c90f40b2af3488c44))

## 1.0.0 (2026-04-22)

### Features

* **ci:** adotar workflows canônicos split + doctor + publish-tag ([ea8194d](https://github.com/Precisa-Saude/datasus-viz/commit/ea8194d49df75ee6b88b1b7fcaa3938cd43decdc))
* consumir @precisa-saude/agent-instructions + worktree-cli ([9e91ee0](https://github.com/Precisa-Saude/datasus-viz/commit/9e91ee06ae51f8226202b4c087ef421e64796771))
* **core,cli:** terminologia pública + CNES record labeler (PRE-200) ([#6](https://github.com/Precisa-Saude/datasus-viz/issues/6)) ([b940743](https://github.com/Precisa-Saude/datasus-viz/commit/b940743b0a577c7d198f363b2459a81ccce5f548))
* datasus-viz v0.1 — decoder DBC, CNES, CLI e mapeamento LOINC↔TUSS↔SIGTAP ([#1](https://github.com/Precisa-Saude/datasus-viz/issues/1)) ([27cd027](https://github.com/Precisa-Saude/datasus-viz/commit/27cd0278c35e140e7204a8652d4d1f97cfc81676))

### Bug Fixes

* **ci:** concede contents: write no caller para _release.yml poder pedir ([08d5611](https://github.com/Precisa-Saude/datasus-viz/commit/08d561180fea70c9205c800bbefc53df70e3df46)), closes [#16](https://github.com/Precisa-Saude/datasus-viz/issues/16)
* pre-push fallback — typecheck/test topológicos, só lint paralelo ([6b86449](https://github.com/Precisa-Saude/datasus-viz/commit/6b86449c31de2529fd6e4f34c96b865dd24c5a13))

### Tests

* **dbc:** cobrir caminhos de erro e decoders por tipo ([5bcae1d](https://github.com/Precisa-Saude/datasus-viz/commit/5bcae1dc2b1fb40c44599d806eb2b719149f6599))
* excluir scripts de build e arquivos types.ts da cobertura ([5287766](https://github.com/Precisa-Saude/datasus-viz/commit/5287766c360aec7a7e9e824b90684f0fa1fd7960))

### CI/CD

* drop --offline from pre-push pnpm install ([2834a16](https://github.com/Precisa-Saude/datasus-viz/commit/2834a16cbac296af37cd0b5c3685991ac05ab4f5))
* normalizar workflows e templates de PR/issue ([8eabc49](https://github.com/Precisa-Saude/datasus-viz/commit/8eabc492f8d9e5b73130533d548c5c5ecad7ef83))

### Chores

* alinhar hooks husky e turbo.json ao template compartilhado ([acd971a](https://github.com/Precisa-Saude/datasus-viz/commit/acd971a136b30122085d6eaf38ad4d828961effa))
* aplicar drift safe-only do precisa sync ([3ada96c](https://github.com/Precisa-Saude/datasus-viz/commit/3ada96c7e5fcd708453b47e37ab2b1393dd42441))
* aplicar fixes do template husky (turbo detection + regex var) ([98ac50f](https://github.com/Precisa-Saude/datasus-viz/commit/98ac50f6bf62c72fc3439c4704c198af6fc5ee19))
* **config:** scaffold inicial do monorepo datasus-viz ([04dc154](https://github.com/Precisa-Saude/datasus-viz/commit/04dc154b0cfd8973a547f39900f10af037ac2e6f))
* **deps:** add renovate config ([808bd94](https://github.com/Precisa-Saude/datasus-viz/commit/808bd94f52b7c9094fc8ac0c87d4e0214821b165))
* **deps:** adotar configs compartilhadas [@precisa-saude](https://github.com/precisa-saude) ([a42c894](https://github.com/Precisa-Saude/datasus-viz/commit/a42c89447d1d0a862f182cd704068cf0ff46ca83))

# Changelog

Todas as alterações notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).
