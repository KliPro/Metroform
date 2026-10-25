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

    // Preenche a Formação se estiver registada
    if (candidato.formacao) {
        document.getElementById('formacao-exibir').innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${candidato.formacao}`;
    }

    // Preenche a Cidade / Onde mora se estiver registada
    if (candidato.cidade) {
        document.getElementById('cidade-exibir').innerHTML = `<i class="fa-solid fa-location-dot"></i> ${candidato.cidade}`;
    }

    // --- RENDERIZAÇÃO INTELIGENTE DO AVATAR (FOTO OU INICIAIS) ---
    const avatarWrapper = document.getElementById('avatar-container-wrapper');
    if (candidato.foto_perfil) {
        avatarWrapper.innerHTML = `<img src="http://localhost:3000/uploads/${candidato.foto_perfil}" alt="Foto de Perfil" class="foto-perfil">`;
    } else {
        // Gera as iniciais automaticamente com base no nome do candidato
        const nomePartes = (candidato.nome || 'Utilizador').trim().split(' ');
        const iniciais = nomePartes.length > 1 
            ? (nomePartes[0][0] + nomePartes[nomePartes.length - 1][0]).toUpperCase() 
            : nomePartes[0].substring(0, 2).toUpperCase();
        
        avatarWrapper.innerHTML = `<div class="avatar-inicial-perfil">${iniciais}</div>`;
    }

    // --- EXIBIÇÃO DINÂMICA DO CURRÍCULO PDF ---
    const statusCurriculo = document.getElementById('status-curriculo');
    if (candidato.curriculo_pdf) {
        statusCurriculo.innerHTML = `
            <div class="curriculo-box-info">
                <div>
                    <p style="margin: 0; color: #0ca678; font-weight: bold; font-size: 14px;">
                        <i class="fa-solid fa-check-circle"></i> Currículo enviado com sucesso
                    </p>
                    <small style="color: #666; font-size: 12px;">${candidato.curriculo_pdf}</small>
                </div>
                <a href="http://localhost:3000/uploads/${candidato.curriculo_pdf}" target="_blank" class="btn-ver-pdf-perfil">
                    <i class="fa-solid fa-eye"></i> Ver PDF
                </a>
            </div>
        `;
    } else {
        statusCurriculo.innerHTML = `<p style="color: #666; font-size: 14px;">Nenhum currículo em PDF enviado. Edite o perfil para enviar o seu arquivo.</p>`;
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
                        <p class="local-candidatura"><i class="fa-solid fa-location-dot" style="color: #7A0000;"></i> ${item.localizacao}</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="status-badge">${item.status_candidatura || 'Em Análise'}</span>
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
    document.getElementById('edit-formacao').value = candidato.formacao || '';
    document.getElementById('edit-cidade').value = candidato.cidade || '';
    
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
    formData.append('formacao', document.getElementById('edit-formacao').value);
    formData.append('cidade', document.getElementById('edit-cidade').value);
    
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
            
            // Atualiza os dados na sessão local para refletir imediatamente na página
            candidato.nome = document.getElementById('edit-nome').value;
            candidato.telefone = document.getElementById('edit-telefone').value;
            candidato.resumo = document.getElementById('edit-resumo').value;
            candidato.formacao = document.getElementById('edit-formacao').value;
            candidato.cidade = document.getElementById('edit-cidade').value;
            
            // Guarda na sessão e recarrega a página
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