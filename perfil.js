const candidato = JSON.parse(localStorage.getItem('candidatoLogado'));

if (!candidato) {
    alert('Você precisa estar logado para aceder a esta página.');
    window.location.href = 'index.html';
} else {
    // Preenche os dados do utilizador no cabeçalho do perfil
    document.getElementById('nome-exibir').textContent = candidato.nome || 'Utilizador';
    document.getElementById('email-exibir').textContent = candidato.email || '-';
    document.getElementById('telefone-exibir').textContent = candidato.telefone || 'Não informado';
    if (candidato.resumo) {
        document.getElementById('resumo-exibir').textContent = candidato.resumo;
    }

    // Exibe status do currículo se houver arquivo registrado
    const statusCurriculo = document.getElementById('status-curriculo');
    if (candidato.curriculo || candidato.caminho_curriculo) {
        statusCurriculo.innerHTML = `<p style="color: #0ca678; font-size: 14px; font-weight: bold;"><i class="fa-solid fa-check-circle"></i> Currículo enviado com sucesso.</p>`;
    }

    // Carrega as candidaturas do utilizador a partir da base de dados MySQL
    const idCandidato = candidato.id || candidato.id_candidato;
    carregarCandidaturas(idCandidato);
}

async function carregarCandidaturas(idCandidato) {
    const containerLista = document.getElementById('grid-candidaturas');

    try {
        const resposta = await fetch(`http://localhost:3000/api/candidaturas/${idCandidato}`);
        const candidaturas = await resposta.json();

        if (resposta.ok) {
            if (candidaturas.length === 0) {
                containerLista.innerHTML = '<p style="color: #666; font-size: 14px;">Ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis!</p>';
                return;
            }

            containerLista.innerHTML = '';
            candidaturas.forEach(item => {
                const cardItem = document.createElement('div');
                cardItem.className = 'item-candidatura';

                cardItem.innerHTML = `
                    <div>
                        <h4>${item.titulo}</h4>
                        <span class="tag-setor">Setor: ${item.setor}</span>
                        <p class="local-candidatura">📍 ${item.localizacao}</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge">Candidatura Realizada</span>
                        <br><small class="data-candidatura">Data: ${new Date(item.data_candidatura).toLocaleDateString('pt-BR')}</small>
                    </div>
                `;
                containerLista.appendChild(cardItem);
            });
        } else {
            containerLista.innerHTML = '<p style="color: #d97706;">Erro ao carregar as candidaturas.</p>';
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        containerLista.innerHTML = '<p style="color: #d97706;">Não foi possível conectar ao servidor.</p>';
    }
}

function logout() {
    localStorage.removeItem('candidatoLogado');
    window.location.href = 'index.html';
}

function abrirModalEdicao() {
    document.getElementById('edit-nome').value = candidato.nome || '';
    document.getElementById('edit-telefone').value = candidato.telefone || '';
    document.getElementById('edit-resumo').value = candidato.resumo || '';
    
    const modal = document.getElementById('modal-edicao');
    modal.style.display = 'flex';
    modal.classList.remove('oculto');
}

function fecharModalEdicao() {
    const modal = document.getElementById('modal-edicao');
    modal.style.display = 'none';
    modal.classList.add('oculto');
}

document.getElementById('form-editar-perfil').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nome', document.getElementById('edit-nome').value);
    formData.append('telefone', document.getElementById('edit-telefone').value);
    formData.append('resumo', document.getElementById('edit-resumo').value);
    
    const fotoFile = document.getElementById('edit-foto').files[0];
    if (fotoFile) formData.append('foto', fotoFile);

    const curriculoFile = document.getElementById('edit-curriculo').files[0];
    if (curriculoFile) formData.append('curriculo', curriculoFile);

    try {
        const resposta = await fetch(`http://localhost:3000/api/candidatos/${candidato.id_candidato || candidato.id}`, {
            method: 'PUT',
            body: formData
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem);
            candidato.nome = document.getElementById('edit-nome').value;
            candidato.telefone = document.getElementById('edit-telefone').value;
            candidato.resumo = document.getElementById('edit-resumo').value;
            localStorage.setItem('candidatoLogado', JSON.stringify(candidato));
            
            location.reload();
        } else {
            alert(resultado.erro || 'Erro ao atualizar perfil.');
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor para atualizar.');
    }
});