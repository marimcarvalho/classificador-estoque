# 📦 Classificador & Checklist do Estoque (Dark)

Aplicação client-side (HTML + JavaScript) para leitura de planilhas (Excel / CSV),
classificação de produtos por estoque e geração automática de tarefas/checklist
para operações de estoque.

---

## 🔧 O que faz

- Lê arquivos `.xlsx`, `.xls` e `.csv` diretamente no navegador usando SheetJS.
- Detecta automaticamente cabeçalho e normaliza colunas.
- Classifica produtos em:
  - Acima de 10
  - Entre 5–10
  - Entre 1–5
  - Zerados (≤1)
- Gera **tarefas inteligentes** automaticamente:
  - Produtos com preço zerado
  - Produtos sem código de barras
  - Produtos sem NCM
  - Estoque negativo
  - Referências duplicadas
  - Descrições duplicadas
- Checklist manual salvo em `localStorage`.
- Filtros de busca, ordenação e exportação (CSV) por visão.

---

## 🖥️ Como usar

1. Salve o arquivo `index.html` (o que está neste repositório).
2. Abra no navegador (duplo-clique) ou faça deploy no GitHub Pages.
3. Clique em **Carregar Arquivo** e selecione sua planilha.
4. Navegue entre as abas, verifique alertas e adicione tarefas ao checklist.
5. Use **Exportar** para baixar CSVs das visões.

---

## 🗂 Estrutura

A aplicação é só um arquivo (`index.html`) — sem servidor.  
Se preferir separar, crie `style.css` e `app.js` e copie os conteúdos respectivos.

---

## 📌 Observações

- Recomendado abrir com navegador moderno (Chrome, Edge, Firefox).
- Caso o módulo SheetJS via CDN seja bloqueado, use uma versão local/UMD (eu posso ajudar a trocar).
- Os dados sensíveis não saem do seu navegador; tudo é processado localmente.

---

## 💡 Melhorias sugeridas (futuro)

- Exportar filtros complexos para Excel com formatação.
- Gerar etiquetas (impressão).
- Integração com Google Sheets ou banco de dados.
- PWA para uso offline mais robusto.
- Histórico de ações e auditoria.

---

## 🧑‍💻 Autora

Feito para você — Mariana — com um empurrãozinho do ChatGPT ✨

---

Se quiser que eu converta em arquivos separados (`index.html`, `style.css`, `app.js`) ou já gere um `index.html` otimizado para GitHub Pages com README e imagem, eu faço agora.
