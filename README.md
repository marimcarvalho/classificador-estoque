# 📦 Classificador de Produtos por Estoque

Um sistema moderno, rápido e totalmente baseado em **HTML + JavaScript**, capaz de:

✔ Ler planilhas Excel (`.xlsx`, `.xls`) e CSV  
✔ Detectar automaticamente colunas como *referência*, *descrição*, *qtdreal*, *barra*, *ncm*  
✔ Classificar produtos em 4 categorias:
- **Acima de 10**
- **Entre 5–10**
- **Entre 1–5**
- **Zerados (≤1)**

✔ Mostrar tabelas organizadas  
✔ Permitir exportação de cada categoria em CSV  
✔ Funcionar direto pelo navegador  
✔ Sem backend, sem banco de dados, sem servidor — pronto para GitHub Pages

---

## 🚀 Demonstração

🔗 **Link da aplicação:**  

(https://marimcarvalho.github.io/classificador-estoque/) 


---

## 🧩 Funcionalidades

- Upload de arquivos `.xlsx`, `.xls` ou `.csv`
- Detecta automaticamente a linha de cabeçalho real da planilha
- Normaliza colunas com nomes diferentes
- Faz parsing de números com vírgula ou ponto
- Interface moderna e responsiva
- Exibe cartões com quantidade de produtos por categoria
- Tabelas completas com:
  - Grupo  
  - Referência  
  - Descrição  
  - Caracter  
  - Quantidade Real  
  - Preço de Venda  
  - Código de Barras  
  - NCM  
- Exportação de cada categoria para CSV

---

## 📥 Como usar

1. Abra o link da aplicação.
2. Clique em **Carregar Arquivo**.
3. Selecione um arquivo `.xlsx`, `.xls` ou `.csv`.
4. O sistema irá:
   - Ler a planilha
   - Detectar automaticamente as colunas
   - Classificar todos os produtos
   - Exibir as categorias
5. Clique nas abas para navegar entre as categorias.
6. Use **Exportar CSV** para baixar os itens filtrados.

---

## 🗂 Estrutura do Projeto
/
├── index.html # Aplicação completa
├── README.md # Este documento


Observação: Não há arquivos adicionais porque todo o sistema é **client-side**.

---

## 🌐 Hospedagem no GitHub Pages

Este projeto funciona 100% no navegador, então é perfeito para o GitHub Pages.

### Como publicar:

1. Vá em **Settings → Pages**
2. Em *Source*, selecione:


Deploy from a branch

3. Branch:


main

4. Pasta:


/ (root)

5. Clique **Save**

O site ficará disponível em:



https://SEU-USUARIO.github.io/classificador-estoque/


---

## 📊 Exemplo de planilha compatível

| grupo | referencia | descricao | caracter | qtdreal | prcvenda | barra | ncm |
|-------|------------|-----------|----------|---------|-----------|--------|------|
| 01 | 000003 | ABRASIVO JACARÉ |   | 0 | 0 | 01000003 | 68042119 |
| 01 | 000005 | ADAPT INOX |   | 12 | 13.63 | 01000005 | 73071920 |

---

## 🛠 Tecnologias Usadas

- HTML5
- CSS3
- JavaScript
- SheetJS (`xlsx.mjs` via CDN)
- GitHub Pages

---

## ⭐ Melhorias Futuras (Opcional)

- Campo de busca por referência
- Filtro por NCM, grupo, preço etc
- Exportar todas as categorias juntas
- Gráficos e estatísticas avançadas
- Tema escuro
- Versão mobile aprimorada
- Versão .EXE para Windows

---

## 🤝 Contribuição

Sinta-se à vontade para abrir issues ou enviar PRs com melhorias.

---

## 🧑‍💻 Autora

Feito com ❤️ por **Mariana** (e um empurrãozinho do ChatGPT 😄)

---


