document.addEventListener("DOMContentLoaded", () => {
    // 1. Verifica se o gestor está logado
    const adminLogado = localStorage.getItem('adminLogado');
    if (!adminLogado) {
        alert('Acesso restrito! Faça login como Gestor.');
        window.location.href = 'index.html';
        return;
    }

    // 2. Carrega os dados do Banco Geral de Talentos
    carregarBancoTalentos();
});

// --- FUNÇÃO PARA CARREGAR O BANCO GERAL DE TALENTOS ---
async function carregarBancoTalentos() {
    const tbody = document.getElementById("tabela-banco-talentos");
    if (!tbody) return;

    try {
        const resposta = await fetch("http://localhost:3000/api/banco-talentos");
        if (!resposta.ok) return;

        const talentos = await resposta.json();

        if (talentos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #666; padding: 20px;">Nenhum currículo no Banco de Talentos.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        talentos.forEach(talento => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${talento.nome || "Não informado"}</strong></td>
                <td>${talento.email || "-"}</td>
                <td>${talento.telefone || "Não informado"}</td>
                <td>${talento.resumo ? talento.resumo.substring(0, 40) + "..." : "Sem resumo"}</td>
                <td>
                    ${talento.curriculo_pdf 
                        ? `<a href="http://localhost:3000/uploads/${talento.curriculo_pdf}" target="_blank" style="color: #8B0000; font-weight: bold;"><i class="fa-solid fa-file-pdf"></i> Ver PDF</a>` 
                        : '<span style="color: #888;">Não enviado</span>'}
                </td>
                <td>${talento.data_envio ? new Date(talento.data_envio).toLocaleDateString("pt-BR") : "Recente"}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) {
        console.error("Erro ao buscar banco de talentos:", erro);
    }
}

// --- CONTROLOS DOS MODAIS (ABRIR E FECHAR) ---
function abrirModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.remove("oculto");
        modal.style.display = "flex";
    }
}

function fecharModalVaga() {
    const modal = document.getElementById("modal-nova-vaga");
    if (modal) {
        modal.classList.add("oculto");
        modal.style.display = "none";
    }
}

function abrirModal(nome, vaga, setor, match, resumo) {
    document.getElementById("modal-nome").textContent = nome;
    document.getElementById("modal-vaga").textContent = vaga;
    document.getElementById("modal-setor").textContent = setor;
    document.getElementById("modal-match").textContent = match;
    document.getElementById("modal-resumo").textContent = resumo;

    const modal = document.getElementById("modal-curriculo");
    if (modal) {
        modal.classList.remove("oculto");
        modal.style.display = "flex";
    }
}

function fecharModal() {
    const modal = document.getElementById("modal-curriculo");
    if (modal) {
        modal.classList.add("oculto");
        modal.style.display = "none";
    }
}

function logoutGestor() {
    localStorage.removeItem('adminLogado');
    window.location.href = 'index.html';
}

// Intercepta o envio do formulário de cadastro de nova vaga pelo RH
const formCadastrarVaga = document.getElementById('form-cadastrar-vaga');

if (formCadastrarVaga) {
    formCadastrarVaga.addEventListener('submit', async function(e) {
        e.preventDefault();

        const novaVaga = {
            titulo: document.getElementById('input-titulo-vaga').value.trim(),
            setor: document.getElementById('input-setor-vaga').value.trim(),
            localizacao: document.getElementById('input-local-vaga').value.trim(),
            requisitos: document.getElementById('input-requisitos-vaga').value.trim()
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/vagas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaVaga)
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem);
                formCadastrarVaga.reset();
                fecharModalVaga();
                // Opcional: recarregar a página ou atualizar listagens se houver
                window.location.reload();
            } else {
                alert(resultado.erro || 'Erro ao cadastrar a vaga.');
            }
        } catch (erro) {
            console.error('Erro de conexão:', erro);
            alert('Não foi possível conectar ao servidor para cadastrar a vaga.');
        }
    });
}



