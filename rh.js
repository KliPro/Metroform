document.addEventListener("DOMContentLoaded", () => {
    carregarDadosPainel();
});

// --- FUNÇÕES DE CONTROLE DOS MODAIS ---
function abrirModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.remove("oculto");
        modal.classList.add("ativo");
    }
}

function fecharModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.add("oculto");
        modal.classList.remove("ativo");
    }
}

function abrirModal(nome, vaga, setor, match, resumo) {
    document.getElementById("modal-nome").textContent = nome || "---";
    document.getElementById("modal-vaga").textContent = vaga || "---";
    document.getElementById("modal-setor").textContent = setor || "---";
    document.getElementById("modal-match").textContent = match || "---";
    document.getElementById("modal-resumo").textContent = resumo || "Nenhum resumo informado.";

    const modal = document.getElementById("modal-curriculo");
    if (modal) {
        modal.classList.remove("oculto");
        modal.classList.add("ativo");
    }
}

function fecharModal() {
    const modal = document.getElementById("modal-curriculo");
    if (modal) {
        modal.classList.add("oculto");
        modal.classList.remove("ativo");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Verifica a sessão do gestor
    const adminLogado = localStorage.getItem('adminLogado');
    if (!adminLogado) {
        alert('Acesso restrito! Faça login como Gestor.');
        window.location.href = 'index.html';
        return;
    }
    
    // Carrega os dados reais do servidor
    carregarBancoTalentos();
});

async function carregarBancoTalentos() {
    try {
        const resposta = await fetch("http://localhost:3000/api/candidatos");
        if (resposta.ok) {
            const candidatos = await resposta.json();
            preencherTabelaTalentos(candidatos);
        }
    } catch (erro) {
        console.error("Erro ao buscar talentos:", erro);
    }
}

function preencherTabelaTalentos(candidatos) {
    const tbody = document.getElementById("tabela-banco-talentos");
    if (!tbody) return;

    if (!candidatos || candidatos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Nenhum currículo no Banco de Talentos.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    candidatos.forEach(cand => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${cand.nome || "Não informado"}</strong></td>
            <td>${cand.email || "-"}</td>
            <td>${cand.telefone || "Não informado"}</td>
            <td>${cand.resumo ? cand.resumo.substring(0, 35) + "..." : "Sem resumo"}</td>
            <td>
                ${cand.curriculo_pdf 
                    ? `<a href="http://localhost:3000/uploads/${cand.curriculo_pdf}" target="_blank" style="color: #8B0000; font-weight: bold;"><i class="fa-solid fa-file-pdf"></i> Ver PDF</a>` 
                    : '<span style="color: #888;">Não enviado</span>'}
            </td>
            <td>${cand.data_cadastro ? new Date(cand.data_cadastro).toLocaleDateString("pt-BR") : "Recente"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 2. FUNÇÃO DE LOGOUT SEGURA
function logoutGestor() {
    // Remove o registo de login do gestor do navegador
    localStorage.removeItem('gestorLogado');
    sessionStorage.clear();
    
    // Redireciona para a página principal
    window.location.href = 'index.html';
}

// Restantes funções de modais e tabelas...
function abrirModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.remove("oculto");
        modal.classList.add("ativo");
    }
}

function fecharModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.add("oculto");
        modal.classList.remove("ativo");
    }
}

// --- CARREGAMENTO DE DADOS REAIS DO SERVIDOR ---
async function carregarDadosPainel() {
    try {
        // Exemplo de busca de candidatos / banco de talentos na API
        const respostaCandidatos = await fetch("http://localhost:3000/api/candidatos");
        
        if (respostaCandidatos.ok) {
            const candidatos = await respostaCandidatos.json();
            
            // Atualiza o contador de inscritos se necessário
            const cardInscritos = document.querySelector(".metrica-card h3"); // Ajuste conforme a ordem dos cards
            if (cardInscritos && candidatos.length) {
                // Exemplo de atualização dinâmica
            }

            preencherBancoTalentos(candidatos);
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do painel:", erro);
    }
}

// Preenche a tabela do Banco Geral de Talentos dinamicamente
function preencherBancoTalentos(candidatos) {
    const tbody = document.getElementById("tabela-banco-talentos");
    if (!tbody) return;

    if (!candidatos || candidatos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666;">Nenhum currículo cadastrado no Banco de Talentos.</td></tr>`;
        return;
    }

    tbody.innerHTML = "";
    candidatos.forEach(cand => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td><strong>${cand.nome || "Não informado"}</strong></td>
            <td>${cand.email || "-"}</td>
            <td>${cand.telefone || "Não informado"}</td>
            <td>${cand.resumo ? cand.resumo.substring(0, 40) + "..." : "Sem resumo"}</td>
            <td>
                ${cand.curriculo_pdf 
                    ? `<a href="http://localhost:3000/uploads/${cand.curriculo_pdf}" target="_blank" class="btn-ver-pdf-perfil"><i class="fa-solid fa-file-pdf"></i> Ver PDF</a>` 
                    : '<span style="color: #888;">Não enviado</span>'}
            </td>
            <td>${cand.data_cadastro ? new Date(cand.data_cadastro).toLocaleDateString("pt-BR") : "Recente"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Exemplo de como deve ser o fetch no rh.js ao cadastrar a vaga
const formCadastrarVaga = document.getElementById("form-cadastrar-vaga"); // Ajuste para o ID real do seu formulário no modal

if (formCadastrarVaga) {
    formCadastrarVaga.addEventListener("submit", async (e) => {
        e.preventDefault();

        const dadosVaga = {
            titulo: document.getElementById("titulo-vaga").value.trim(),       // Ajuste para o ID real do campo
            setor: document.getElementById("setor-vaga").value.trim(),         // Ajuste para o ID real do campo
            localizacao: document.getElementById("local-vaga").value.trim(),   // Ajuste para o ID real do campo
            requisitos: document.getElementById("req-vaga").value.trim()       // Ajuste para o ID real do campo
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/vagas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosVaga)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem);
                location.reload(); // Recarrega a página para atualizar a lista de vagas
            } else {
                alert(resultado.erro || "Erro ao cadastrar a vaga.");
            }
        } catch (erro) {
            console.error("Erro de conexão:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}

function logoutGestor() {
    // Remove a sessão correta do gestor
    localStorage.removeItem('adminLogado');
    sessionStorage.clear();
    
    // Redireciona para a página principal
    window.location.href = 'index.html';
}