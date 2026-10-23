// Verifica se o gestor está autenticado
if (localStorage.getItem('rhLogado') !== 'true') {
    alert('Acesso restrito! Por favor, faça login com as credenciais do RH.');
    window.location.href = 'index.html';
}

function abrirModal(nome, vaga, setor, match, resumo) {
    document.getElementById('modal-nome').innerText = nome;
    document.getElementById('modal-vaga').innerText = vaga;
    document.getElementById('modal-setor').innerText = setor;
    document.getElementById('modal-match').innerText = match;
    document.getElementById('modal-resumo').innerText = resumo;
    document.getElementById('modal-curriculo').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-curriculo').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const btnNovaVaga = document.querySelector('.btn-nova-vaga');
    if (btnNovaVaga) {
        btnNovaVaga.addEventListener('click', function() {
            document.getElementById('modal-nova-vaga').style.display = 'flex';
        });
    }
    carregarBancoTalentosRH();
});

function fecharModalVaga() {
    document.getElementById('modal-nova-vaga').style.display = 'none';
}

const formCadastrarVaga = document.getElementById('form-cadastrar-vaga');
if (formCadastrarVaga) {
    formCadastrarVaga.addEventListener('submit', function(e) {
        e.preventDefault();

        const novaVaga = {
            titulo: document.getElementById('input-titulo-vaga').value,
            setor: document.getElementById('input-setor-vaga').value,
            local: document.getElementById('input-local-vaga').value,
            requisitos: document.getElementById('input-requisitos-vaga').value
        };

        let vagasSalvas = JSON.parse(localStorage.getItem('vagasMetroform')) || [];
        vagasSalvas.push(novaVaga);
        localStorage.setItem('vagasMetroform', JSON.stringify(vagasSalvas));

        alert('Vaga cadastrada e publicada na página principal com sucesso!');
        fecharModalVaga();
        formCadastrarVaga.reset();
    });
}

async function carregarBancoTalentosRH() {
    try {
        const resposta = await fetch('http://localhost:3000/api/banco-talentos');
        const talentos = await resposta.json();

        const tbody = document.getElementById('tabela-banco-talentos');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (talentos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="tabela-vazia-msg">Nenhum currículo encontrado no banco de talentos.</td></tr>';
            return;
        }

        talentos.forEach(talento => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td class="td-nome">${talento.nome}</td>
                <td class="td-email">${talento.email}</td>
                <td class="td-tel">${talento.telefone || 'Não informado'}</td>
                <td class="td-resumo">${talento.resumo || 'Sem resumo'}</td>
                <td class="td-acao-pdf">
                    <a href="http://localhost:3000/uploads/${talento.curriculo_pdf}" target="_blank" class="btn-ver-pdf">Ver PDF</a>
                </td>
                <td class="td-data">${new Date(talento.data_envio).toLocaleDateString('pt-BR')}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error('Erro ao carregar banco de talentos para o RH:', erro);
    }
}