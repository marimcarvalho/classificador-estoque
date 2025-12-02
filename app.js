/******************************************************************************************
 * SISTEMA DE CLASSIFICAÇÃO + CHECKLIST + AUDITORIA + BASE LOCAL
 * Autor: ChatGPT
 * Compatível com GitHub Pages
 ******************************************************************************************/

// ===============================
// BANCO DE DADOS LOCAL (LOCALSTORAGE)
// ===============================

function saveDB() {
    localStorage.setItem("estoqueDB", JSON.stringify(DB));
}

function loadDB() {
    const raw = localStorage.getItem("estoqueDB");
    if (!raw) return { itens: {}, auditoria: {} };
    try {
        return JSON.parse(raw);
    } catch {
        return { itens: {}, auditoria: {} };
    }
}

let DB = loadDB();

function registrarAcao(ref, acao) {
    if (!DB.auditoria[ref]) DB.auditoria[ref] = [];
    DB.auditoria[ref].push({
        data: new Date().toLocaleString("pt-BR"),
        acao
    });
    saveDB();
}

// ============================================================
// SISTEMA DE CHECKLIST INTELIGENTE
// ============================================================

function gerarChecklistGlobal() {
    const ul = document.getElementById("taskList");
    ul.innerHTML = "";

    const tarefas = [
        { nome: "Itens com preço zerado", cond: item => Number(item.prcvenda) === 0 },
        { nome: "Itens sem código de barras", cond: item => !item.barra },
        { nome: "Itens sem descrição", cond: item => !item.descricao },
        { nome: "Itens com NCM faltando", cond: item => !item.ncm },
        { nome: "Itens com preço abaixo de custo", cond: item => Number(item.prcvenda) < Number(item.pumat) }
    ];

    tarefas.forEach(t => {
        const count = Object.values(DB.itens).filter(t.cond).length;
        const li = document.createElement("li");
        li.textContent = `${t.nome}: ${count}`;
        ul.appendChild(li);
    });
}

// ============================================================
// ALERTAS INTELIGENTES
// ============================================================

function gerarAlertas() {
    const ul = document.getElementById("alertList");
    ul.innerHTML = "";

    const itens = Object.values(DB.itens);

    itens.forEach(item => {
        if (Number(item.qtdreal) < 0) {
            const li = document.createElement("li");
            li.textContent = `⚠ Estoque negativo: ${item.descricao} (${item.referencia})`;
            ul.appendChild(li);
        }
        if (item.descricao && item.descricao.length < 3) {
            const li = document.createElement("li");
            li.textContent = `⚠ Descrição muito curta: ${item.referencia}`;
            ul.appendChild(li);
        }
    });
}

// ============================================================
// IMPORTAÇÃO DA PLANILHA
// ============================================================

document.getElementById("inputFile").addEventListener("change", lerArquivoXLSX);

function lerArquivoXLSX(evt) {
    const file = evt.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        processarLinhas(rows);
    };
    reader.readAsArrayBuffer(file);
}

function normalizar(col) {
    return col.toString().replace(/\s+/g, "").toLowerCase();
}

function processarLinhas(rows) {
    const header = rows[0].map(normalizar);

    const colRef = header.indexOf("referencia");
    const colQtd = header.indexOf("qtdreal");
    const colDesc = header.indexOf("descricao");
    const colPrcVenda = header.indexOf("prcvenda");
    const colCusto = header.indexOf("pumat");
    const colNcm = header.indexOf("ncm");
    const colBarra = header.indexOf("barra");

    if (colRef < 0 || colQtd < 0) {
        alert("As colunas referencia e qtdreal são obrigatórias.");
        return;
    }

    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[colRef]) continue;

        const ref = String(r[colRef]).trim();

        DB.itens[ref] = {
            referencia: ref,
            descricao: (r[colDesc] || "").toString(),
            qtdreal: Number(r[colQtd]) || 0,
            prcvenda: Number(r[colPrcVenda]) || 0,
            pumat: Number(r[colCusto]) || 0,
            barra: r[colBarra] || "",
            ncm: r[colNcm] || "",
            notas: DB.itens[ref]?.notas || ""
        };

        registrarAcao(ref, "Importado da planilha");
    }

    saveDB();
    atualizarInterface();
}

// ============================================================
// CLASSIFICAÇÃO AUTOMÁTICA
// ============================================================

function classificarItens() {
    const todos = Object.values(DB.itens);

    return {
        acima10: todos.filter(x => x.qtdreal > 10),
        entre5e10: todos.filter(x => x.qtdreal > 5 && x.qtdreal <= 10),
        entre1e5: todos.filter(x => x.qtdreal > 1 && x.qtdreal <= 5),
        zerados: todos.filter(x => x.qtdreal === 0),
        negativos: todos.filter(x => x.qtdreal < 0)
    };
}

// ============================================================
// RENDERIZAÇÃO
// ============================================================

let categoriaAtual = "acima10";

function atualizarInterface() {
    gerarChecklistGlobal();
    gerarAlertas();
    renderTabs();
    renderTabela();
}

function renderTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";

    const cats = {
        acima10: "Acima de 10",
        entre5e10: "Entre 5 e 10",
        entre1e5: "Entre 1 e 5",
        zerados: "Zerados",
        negativos: "Negativos"
    };

    Object.keys(cats).forEach(cat => {
        const div = document.createElement("div");
        div.className = "tab" + (cat === categoriaAtual ? " active" : "");
        div.textContent = cats[cat];
        div.onclick = () => {
            categoriaAtual = cat;
            renderTabela();
        };
        tabs.appendChild(div);
    });
}

function renderTabela() {
    const head = document.getElementById("tableHead");
    const body = document.getElementById("tableBody");

    head.innerHTML = `
        <tr>
            <th>Ref</th>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Preço</th>
            <th>NCM</th>
            <th>Ações</th>
        </tr>
    `;

    const grupos = classificarItens();
    const itens = grupos[categoriaAtual];

    body.innerHTML = "";

    itens.forEach(item => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.referencia}</td>
            <td>${item.descricao}</td>
            <td>${item.qtdreal}</td>
            <td>${item.prcvenda.toFixed(2)}</td>
            <td>${item.ncm}</td>
            <td>
                <button onclick="abrirEdicao('${item.referencia}')">Editar</button>
            </td>
        `;

        body.appendChild(tr);
    });

    document.getElementById("emptyMsg").style.display =
        itens.length === 0 ? "block" : "none";
}

// ============================================================
// EDIÇÃO + AUDITORIA
// ============================================================

function abrirEdicao(ref) {
    const m = document.getElementById("editModal");
    m.style.display = "flex";

    const item = DB.itens[ref];

    document.getElementById("editDescricao").value = item.descricao;
    document.getElementById("editPreco").value = item.prcvenda;
    document.getElementById("editQtd").value = item.qtdreal;
    document.getElementById("editBarra").value = item.barra;
    document.getElementById("editNcm").value = item.ncm;
    document.getElementById("editNotas").value = item.notas || "";

    document.getElementById("btnSalvarEdicao").onclick = () => salvarEdicao(ref);

    renderHistorico(ref);
}

function salvarEdicao(ref) {
    const item = DB.itens[ref];

    item.descricao = document.getElementById("editDescricao").value;
    item.prcvenda = Number(document.getElementById("editPreco").value);
    item.qtdreal = Number(document.getElementById("editQtd").value);
    item.barra = document.getElementById("editBarra").value;
    item.ncm = document.getElementById("editNcm").value;
    item.notas = document.getElementById("editNotas").value;

    registrarAcao(ref, "Alteração manual");

    saveDB();
    atualizarInterface();

    document.getElementById("editModal").style.display = "none";
}

function renderHistorico(ref) {
    const box = document.getElementById("historyBox");
    box.innerHTML = "";

    const hist = DB.auditoria[ref] || [];

    hist.forEach(h => {
        const div = document.createElement("div");
        div.textContent = `${h.data} — ${h.acao}`;
        box.appendChild(div);
    });
}

document.getElementById("btnFecharModal").onclick = () =>
    (document.getElementById("editModal").style.display = "none");

// ============================================================
// EXPORTAÇÃO / IMPORTAÇÃO DA BASE LOCAL
// ============================================================

document.getElementById("btnExportBase").onclick = () => {
    const blob = new Blob([JSON.stringify(DB, null, 2)], {
        type: "application/json"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "estoqueDB.json";
    a.click();
};

document.getElementById("btnImportBase").onclick = () =>
    document.getElementById("inputImportBase").click();

document.getElementById("inputImportBase").addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
        DB = JSON.parse(evt.target.result);
        saveDB();
        atualizarInterface();
    };

    reader.readAsText(file);
});

// ===========================================
// INICIALIZAÇÃO
// ===========================================
window.onload = () => atualizarInterface();
