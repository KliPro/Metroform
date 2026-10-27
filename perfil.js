const candidatoStr = localStorage.getItem('candidatoLogado');
const candidato = candidatoStr ? JSON.parse(candidatoStr) : null;

if (!candidato || (!candidato.id && !candidato.id_candidato)) {
    alert('Você precisa estar logado para aceder a esta página.');
    window.location.href = 'index.html';
} else {
    const idCandidatoReal = candidato.id_candidato || candidato.id;

    // Preenche os dados do utilizador no cabeçalho do perfil
    document.getElementById('nome-exibir').textContent = candidato.nome || 'Utilizador';
    document.getElementById('email-exibir').textContent = candidato.email || '-';
    document.getElementById('telefone-exibir').textContent = candidato.telefone || 'Não informado';
    
    if (candidato.resumo) {
        document.getElementById('resumo-exibir').textContent = candidato.resumo;
    }

    // Preenche a Formação se estiver registada
    const formacaoExibir = document.getElementById('formacao-exibir');
    if (formacaoExibir) {
        formacaoExibir.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${candidato.formacao || 'Formação não informada'}`;
    }

    // Preenche a Cidade / Onde mora se estiver registada
    const cidadeExibir = document.getElementById('cidade-exibir');
    if (cidadeExibir) {
        cidadeExibir.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${candidato.cidade || 'Endereço não informado'}`;
    }

    // --- RENDERIZAÇÃO INTELIGENTE DO AVATAR ---
    const avatarWrapper = document.getElementById('avatar-container-wrapper');
    if (avatarWrapper) {
        if (candidato.foto_perfil) {
            avatarWrapper.innerHTML = `<img src="http://localhost:3000/uploads/${candidato.foto_perfil}" alt="Foto de Perfil" class="foto-perfil">`;
        } else {
            const nomePartes = (candidato.nome || 'Utilizador').trim().split(' ');
            const iniciais = nomePartes.length > 1 
                ? (nomePartes[0][0] + nomePartes[nomePartes.length - 1][0]).toUpperCase() 
                : nomePartes[0].substring(0, 2).toUpperCase();
            
            avatarWrapper.innerHTML = `<div class="avatar-inicial-perfil">${iniciais}</div>`;
        }
    }

    // --- EXIBIÇÃO DINÂMICA DO CURRÍCULO PDF ---
    const statusCurriculo = document.getElementById('status-curriculo');
    if (statusCurriculo) {
        if (candidato.curriculo_pdf && candidato.curriculo_pdf !== 'null') {
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
    }

    // Carrega as candidaturas do utilizador a partir da base de dados MySQL
    if (idCandidatoReal) {
        carregarCandidaturas(idCandidatoReal);
    }
}

async function carregarCandidaturas(idCandidato) {
    const containerLista = document.getElementById('grid-candidaturas') || document.getElementById('minhas-candidaturas');
    if (!containerLista) return;

    try {
        const resposta = await fetch(`http://localhost:3000/api/candidaturas/${idCandidato}`);
        
        if (!resposta.ok) {
            containerLista.innerHTML = '<p style="color: #666; font-size: 14px;">Ainda não se candidatou a nenhuma vaga.</p>';
            return;
        }

        const candidaturas = await resposta.json();

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
                    <p class="local-candidatura"><i class="fa-solid fa-location-dot" style="color: #7A0000;"></i> ${item.localizacao || 'Guarulhos / SP'}</p>
                </div>
                <div style="text-align: right;">
                    <span class="status-badge">${item.status_candidatura || 'Em Análise'}</span>
                    <br><small class="data-candidatura">Data: ${item.data_candidatura ? new Date(item.data_candidatura).toLocaleDateString('pt-BR') : 'Recente'}</small>
                </div>
            `;
            containerLista.appendChild(cardItem);
        });

    } catch (erro) {
        console.error('Erro de conexão ao carregar candidaturas:', erro);
        containerLista.innerHTML = '<p style="color: #666; font-size: 14px;">Ainda não possui candidaturas ativas registadas.</p>';
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
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('oculto');
    }
}

function fecharModalEdicao() {
    const modal = document.getElementById('modal-edicao');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('oculto');
    }
}

const formEditarPerfil = document.getElementById('form-editar-perfil');
if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nome', document.getElementById('edit-nome').value);
        formData.append('telefone', document.getElementById('edit-telefone').value);
        formData.append('resumo', document.getElementById('edit-resumo').value);
        formData.append('formacao', document.getElementById('edit-formacao').value);
        formData.append('cidade', document.getElementById('edit-cidade').value);
        
        const fotoInput = document.getElementById('edit-foto');
        if (fotoInput && fotoInput.files[0]) {
            formData.append('foto', fotoInput.files[0]);
        }

        const curriculoInput = document.getElementById('edit-curriculo');
        if (curriculoInput && curriculoInput.files[0]) {
            formData.append('curriculo', curriculoInput.files[0]);
        }

        const idCandidato = candidato.id_candidato || candidato.id;

        try {
            const resposta = await fetch(`http://localhost:3000/api/candidatos/${idCandidato}`, {
                method: 'PUT',
                body: formData
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                alert(resultado.mensagem);
                
                // Atualiza os dados no objeto local e sincroniza no localStorage
                candidato.nome = document.getElementById('edit-nome').value;
                candidato.telefone = document.getElementById('edit-telefone').value;
                candidato.resumo = document.getElementById('edit-resumo').value;
                candidato.formacao = document.getElementById('edit-formacao').value;
                candidato.cidade = document.getElementById('edit-cidade').value;
                
                localStorage.setItem('candidatoLogado', JSON.stringify(candidato));
                
                fecharModalEdicao();
                location.reload();
            } else {
                alert(resultado.erro || 'Erro ao atualizar perfil.');
            }
        } catch (erro) {
            console.error('Erro de conexão:', erro);
            alert('Não foi possível conectar ao servidor para atualizar.');
        }
    });
}