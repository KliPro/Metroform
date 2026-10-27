// Função para carregar as vagas diretamente da base de dados MySQL e aplicar o filtro de busca
async function carregarVagasDoBanco() {
    try {
        const resposta = await fetch('http://localhost:3000/api/vagas');
        let vagas = await resposta.json();

        const gridVagas = document.querySelector('.grid-vagas-completa');
        if (!gridVagas) return;

        // 1. Captura o termo de busca enviado pela URL (ex: ?busca=tecnico)
        const urlParams = new URLSearchParams(window.location.search);
        const termoBusca = urlParams.get('busca') ? urlParams.get('busca').toLowerCase().trim() : '';

        // 2. Se houver um termo de pesquisa, filtra a lista de vagas recebida do banco
        if (termoBusca) {
            vagas = vagas.filter(vaga => 
                vaga.titulo.toLowerCase().includes(termoBusca) || 
                vaga.setor.toLowerCase().includes(termoBusca) || 
                (vaga.requisitos && vaga.requisitos.toLowerCase().includes(termoBusca)) ||
                (vaga.localizacao && vaga.localizacao.toLowerCase().includes(termoBusca))
            );
        }

        // Limpa o grid antes de preencher
        gridVagas.innerHTML = '';

        if (vagas.length === 0) {
            gridVagas.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666; font-size: 16px; padding: 20px;">Não foram encontradas vagas para "${termoBusca}".</p>`;
            return;
        }

        // Cria os cartões dinamicamente para cada vaga filtrada do MySQL
        vagas.forEach(vaga => {
            const card = document.createElement('div');
            card.className = 'card-vaga';

            card.innerHTML = `
                <h3>${vaga.titulo}</h3>
                <span class="setor">Setor: ${vaga.setor}</span>
                <p class="local">📍 ${vaga.localizacao}</p>
                <p class="requisitos"><strong>Requisitos:</strong> ${vaga.requisitos}</p>
                <div class="card-botoes">
                     <button class="btn-match" onclick="analisarMatch('${vaga.titulo}', '${vaga.setor}', '${vaga.requisitos}', ${vaga.id_vaga})">Ver Match</button>
                     <button class="btn-candidatar" onclick="candidatarVaga(${vaga.id_vaga})">Candidatar-se</button>
                </div>
            `;
            gridVagas.appendChild(card);
        });

    } catch (erro) {
        console.error('Erro ao carregar as vagas do servidor:', erro);
    }
}

// Executa a função assim que a página é totalmente carregada
document.addEventListener('DOMContentLoaded', carregarVagasDoBanco);

// Função responsável por enviar a candidatura para o backend
async function candidatarVaga(idVaga) {
    const candidatoStr = localStorage.getItem('candidatoLogado');

    if (!candidatoStr) {
        alert('Você precisa estar logado para se candidatar a uma vaga.');
        window.location.href = 'index.html';
        return;
    }

    let candidato;
    try {
        candidato = JSON.parse(candidatoStr);
    } catch (e) {
        alert('Erro nos dados do utilizador. Faça login novamente.');
        localStorage.removeItem('candidatoLogado');
        window.location.href = 'index.html';
        return;
    }

    // Procura por qualquer variação possível do ID no objeto guardado
    const idCandidatoReal = candidato.id_candidato || candidato.id || candidato.usuario_id;

    if (!idCandidatoReal) {
        alert('ID do candidato não encontrado. Por favor, faça login novamente na sua conta.');
        localStorage.removeItem('candidatoLogado');
        window.location.href = 'index.html';
        return;
    }

    try {
        const resposta = await fetch('http://localhost:3000/api/candidaturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_candidato: Number(idCandidatoReal), // Garante que é enviado como número
                id_vaga: Number(idVaga)
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            alert(resultado.mensagem);
            window.location.href = 'perfil.html';
        } else {
            alert(resultado.erro || 'Erro ao efetuar a candidatura.');
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
}

// Função para calcular a compatibilidade do candidato com a vaga
function analisarMatch(tituloVaga, setorVaga, requisitosVaga, idVaga) {
    const candidato = JSON.parse(localStorage.getItem('candidatoLogado'));

    if (!candidato) {
        alert('Faça login para verificar o seu nível de match com as vagas.');
        window.location.href = 'index.html';
        return;
    }

    const resumoCandidato = candidato.resumo ? candidato.resumo.toLowerCase() : '';
    
    let pontuacaoMatch = 50; 
    let analiseTexto = "O seu perfil demonstra potencial para integrar esta equipa.";

    if (resumoCandidato.length > 10) {
        pontuacaoMatch += 20;
    }

    const reqs = requisitosVaga.toLowerCase();
    if (resumoCandidato.includes(setorVaga.toLowerCase()) || reqs.split(' ').some(palavra => palavra.length > 3 && resumoCandidato.includes(palavra))) {
        pontuacaoMatch += 25;
        analiseTexto = "Excelente alinhamento! As competências descritas no seu resumo coincidem com os requisitos exigidos para esta vaga.";
    } else if (resumoCandidato === '') {
        pontuacaoMatch = 40;
        analiseTexto = "O seu resumo profissional está vazio. Preencha o seu perfil para aumentar a precisão do Match!";
    }

    if (pontuacaoMatch > 98) pontuacaoMatch = 98;
    if (pontuacaoMatch < 55 && resumoCandidato !== '') pontuacaoMatch = 65;

    const containerResultado = document.getElementById('match-resultado');
    containerResultado.innerHTML = `
        <div style="font-size: 2.5rem; font-weight: bold; color: ${pontuacaoMatch >= 75 ? '#2b8a3e' : '#d97706'}; margin-bottom: 10px;">
            ${pontuacaoMatch}% de Match
        </div>
        <p style="font-weight: bold; color: #444; margin-bottom: 8px;">Vaga: ${tituloVaga}</p>
        <p style="font-size: 0.95rem; color: #666; line-height: 1.4;">${analiseTexto}</p>
    `;

    document.getElementById('btn-candidatar-match').onclick = function() {
        fecharModalMatch();
        candidatarVaga(idVaga);
    };

    const modal = document.getElementById('modal-match');
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
}

function fecharModalMatch() {
    const modal = document.getElementById('modal-match');
    modal.classList.add('oculto');
    modal.style.display = 'none';
}