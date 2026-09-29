# Plano — linguagem visual da /laudos no site

## Objetivo

Aproximar o visual de datasus-viz da landing de Precisa Laudos
(`precisa-saude.com.br/laudos`), a mesma atualização feita no
medbench-brasil (PR Precisa-Saude/medbench-brasil#72). Atualização visual,
sem conteúdo novo, mais uma melhoria de UX pedida: progresso da primeira
carga do mapa.

Referência normativa: `platform/docs/design/linguagem-visual.md` (v0.1,
10/09/2026) e a implementação em `platform/apps/landing/src/components/laudos/`.

## Decisões

- **Fontes.** Margem e Pausa carregadas de
  `https://www.precisa-saude.com.br/fonts/` (CORS aberto). Os arquivos,
  licenciados, não entram neste repositório público. Saem Roboto, Roboto
  Serif e Roboto Mono; código usa o mono do sistema.
- **Papéis tipográficos.** Pausa 300 nos títulos de página e de seção;
  Margem no corpo, dados e interface. Escala em `site/src/lib/typography.ts`,
  a mesma do medbench.
- **Cabeçalho.** Roxo sólido, sem blur; GitHub em contorno branco com hover
  menta.
- **Mapa.** A home é o próprio mapa, então não recebe hero nem fundo
  geométrico. Os painéis sobre o mapa só trocam de fonte.
- **Sobre.** Usa `DocLayout`: a partir de 1280 px o sumário vira um cartão
  fixo à direita que marca a seção atual; abaixo disso fica no fluxo.
- **Explorar e Tendências.** Título de página em Pausa, abertura em Margem,
  rótulos de campo num só estilo, toggles alinhados à esquerda.
- **Progresso da primeira carga.** Barra pequena no centro do mapa que avança
  por etapa real concluída (índice, agregados, primeira pintura do MapLibre),
  sem timer, como pede a seção 7 do guia. Cobre só a área do mapa; os
  painéis aparecem assim que os próprios dados chegam.
- **Rolagem suave** nas âncoras, desligada com movimento reduzido.

## Etapas

- [x] Fontes e tokens (`index.html`, `index.css`, `tailwind.config.js`)
- [x] Escala tipográfica compartilhada
- [x] Cabeçalho
- [x] Sobre com sumário fixo
- [x] Explorar e Tendências
- [x] Progresso da primeira carga do mapa, com testes
- [x] Verificação em 1440 e 375 px
- [ ] Movimento reduzido; confirmar licença das fontes para o domínio do site
