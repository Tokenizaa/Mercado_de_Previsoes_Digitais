# Constituição do Frontend — Linguagem, UX e Acessibilidade

Status: Canônico
Versão: 1.0
Data: 2026-09-26

## 1. Objetivo

O frontend público deve ser compreendido rapidamente por pessoas que usam internet e redes sociais, mas que não querem ler textos longos nem aprender conceitos novos para participar.

A interface deve priorizar clareza, ação imediata e baixa carga de leitura.

A referência comportamental inclui aplicativos de uso massivo e simples, como Tinder, além de padrões de Instagram, TikTok, YouTube e WhatsApp.

Não copiamos identidade visual ou linguagem de apostas. Aproveitamos apenas princípios de simplicidade e participação rápida.

## 2. Regra principal

> Se a pessoa precisa ler para descobrir o que fazer, a tela está complicada.

Em cada tela pública, o usuário deve identificar rapidamente: o que está acontecendo; qual é a pergunta; quais são as escolhas; qual é o botão principal.

## 3. Público

O produto é voltado ao público brasileiro de internet, especialmente pessoas acostumadas a redes sociais, vídeos curtos, creators, lives, entretenimento, esportes e lutas, música e cultura digital.

Não devemos presumir nível de escolaridade, classe social ou capacidade individual a partir desse comportamento. O critério de design é simples: pouca leitura, linguagem direta e ação evidente.

## 4. Voz

Brasileira, direta, simples, natural, popular sem caricatura, digital, leve e fácil de entender.

Não deve ser corporativa, acadêmica, financeira, técnica, americana, infantilizada, cheia de gírias ou parecida com cassino/bet.

Preferir frases como: O que vai acontecer? / Quem ganha? / Qual é o seu palpite? / Escolha uma opção. / Ainda dá para participar. / Já fechou. / Esperando o resultado. / Saiu o resultado. / Você acertou. / Onde vamos conferir?

Evitar frases como: Selecione uma opção para abrir uma posição. / Execute sua operação. / Probabilidade implícita. / Liquidação antecipada. / Fonte de resolução. / Critério determinístico de resolução.

## 5. Vocabulário público

| Conceito técnico | Termo público |
|---|---|
| Market | Palpite |
| Markets | Palpites |
| Position | Meu palpite |
| Buy position | Dar meu palpite |
| Sell position | Sair |
| Probability | Chance |
| Resolution | Resultado |
| Resolution rule | Como vamos conferir |
| Resolution source | Onde vamos conferir |
| Awaiting result | Esperando o resultado |
| Result found | Resultado encontrado |
| Resolved | Resultado confirmado |
| Portfolio | Meus palpites |
| Activity | Atividade |
| Creator | Quem criou |
| Credits | Créditos |
| Balance | Meus créditos |
| Option | Escolha |
| Open | Ainda dá para participar |
| Closed | Já fechou |
| Winner | Quem acertou |
| Evidence | Prova |

Os nomes técnicos permanecem no código, banco, API e documentação técnica quando necessários.

## 6. Termos proibidos na experiência pública

Não usar como linguagem principal: aposta, bet, odd/odds, banca, bilhete, cassino, trade, posição, ordem, liquidação, token, cripto, comissão.

Também não importar gírias de apostas como green, red, all in ou forrar.

O produto usa palpite e Créditos.

## 7. Experiência pública

Início → Palpite → Escolha → Confirmar → Acompanhar → Resultado

Navegação preferencial: Início / Explorar / Meus palpites / Perfil.

Evitar menus com conceitos administrativos ou financeiros.

## 8. Interface

Botões devem ser grandes, fáceis de tocar, com texto curto, ação explícita e uma ação principal por tela.

Exemplos: DAR MEU PALPITE / CONFIRMAR / VER RESULTADO / SAIR.

Tipografia legível, tamanho confortável, contraste forte, títulos curtos e poucas palavras por bloco.

Cada card deve comunicar uma coisa: pergunta, contexto, escolhas grandes, prazo curto e ação.

## 9. Regra de uma pergunta

Sempre que possível, uma tela deve responder a uma única pergunta.

Exemplos: Quem ganha? / Vai passar de 1 milhão? / Quem fica em primeiro?

Isso é preferível a explicar primeiro o funcionamento do mercado.

## 10. Criação de palpites

Usuários comuns não criam palpites.

A criação e publicação de palpites são exclusivas dos administradores nesta versão.

O usuário comum apenas descobre, participa, acompanha, compartilha e vê o resultado.

A possibilidade de criação por creators ou comunidade fica para versões futuras e não deve aparecer na navegação pública atual.

## 11. Compartilhamento

O compartilhamento é parte central do produto.

O preview deve mostrar principalmente pergunta, imagem, escolhas e resultado/status. Evitar textos técnicos.

## 12. Estados

Usar estados que uma pessoa entende sem conhecimento do sistema: Ainda dá para participar / Já fechou / Esperando o resultado / Resultado encontrado / Resultado confirmado.

Não expor estados técnicos na experiência pública.

## 13. Erros

Erros devem dizer o que aconteceu e o que fazer.

Preferir: Não deu para fazer isso agora. Tente de novo.

Preferir: Você não tem créditos suficientes.

## 14. Regra dos 3 segundos

Uma pessoa que acabou de abrir a tela deve entender rapidamente o que é, o que pode fazer e onde tocar.

Se isso não estiver claro, simplificar antes de adicionar explicações.

## 15. Escopo

Esta constituição vale para Home, navegação, cards, descoberta, detalhe, participação, Créditos, Meus palpites, Perfil, modais, mensagens, estados vazios, erros, tooltips, SEO/Open Graph e textos de compartilhamento.

O Admin é uma experiência separada e pode usar linguagem mais técnica e densa.

## 16. Princípio final

> Menos leitura. Mais entendimento. Uma pergunta. Uma escolha. Um botão.