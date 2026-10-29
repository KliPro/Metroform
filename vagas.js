// ==========================================
// FUNÇÃO PARA CARREGAR VAGAS DO BANCO DE DADOS
// ==========================================
// Função responsável por buscar as vagas diretamente da API do servidor MySQL e aplicar o filtro de busca via URL
async function carregarVagasDoBanco() {
    try {
        // Faz uma requisição HTTP GET assíncrona para a rota de vagas no servidor Node.js
        const resposta = await fetch('http://localhost:3000/api/vagas');
        // Converte a resposta recebida para o formato JSON (lista de vagas)
        let vagas = await resposta.json();

        // Seleciona o elemento HTML onde os cartões de vagas serão injetados
        const gridVagas = document.querySelector('.grid-vagas-completa');
        if (!gridVagas) return; // Se o elemento não existir na página, interrompe a execução

        // 1. Captura o termo de busca enviado pela URL (ex: ?busca=tecnico) para filtrar resultados
        const urlParams = new URLSearchParams(window.location.search);
        const termoBusca = urlParams.get('busca') ? urlParams.get('busca').toLowerCase().trim() : '';

        // 2. Se houver um termo de pesquisa na URL, filtra a lista de vagas recebida do banco
        if (termoBusca) {
            vagas = vagas.filter(vaga => 
                vaga.titulo.toLowerCase().includes(termoBusca) || 
                vaga.setor.toLowerCase().includes(termoBusca) || 
                (vaga.requisitos && vaga.requisitos.toLowerCase().includes(termoBusca)) ||
                (vaga.localizacao && vaga.localizacao.toLowerCase().includes(termoBusca))
            );
        }

        // Limpa o conteúdo atual do grid antes de preencher com os dados atualizados
        gridVagas.innerHTML = '';

        // Se após o filtro nenhuma vaga for encontrada, exibe uma mensagem informativa ao utilizador
        if (vagas.length === 0) {
            gridVagas.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666; font-size: 16px; padding: 20px;">Não foram encontradas vagas para "${termoBusca}".</p>`;
            return;
        }

        // Cria os cartões dinamicamente em loop para cada vaga filtrada do MySQL
        vagas.forEach(vaga => {
            const card = document.createElement('div');
            card.className = 'card-vaga';

            // Injeta a estrutura HTML do cartão com os dados reais da vaga
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
            // Adiciona o cartão gerado dentro do container principal (grid)
            gridVagas.appendChild(card);
        });

    } catch (erro) {
        // Captura e exibe eventuais erros de conexão com o servidor na consola
        console.error('Erro ao carregar as vagas do servidor:', erro);
    }
}

// Executa a função de carregamento assim que a estrutura da página HTML é totalmente carregada
document.addEventListener('DOMContentLoaded', carregarVagasDoBanco);


// ==========================================
// FUNÇÃO DE CANDIDATURA À VAGA
// ==========================================
// Função responsável por validar o login do utilizador e enviar a candidatura para o backend
async function candidatarVaga(idVaga) {
    // Recupera os dados do candidato armazenados no navegador (LocalStorage)
    const candidatoStr = localStorage.getItem('candidatoLogado');

    // Se o candidato não estiver logado, exibe um alerta e redireciona para a página de login/início
    if (!candidatoStr) {
        alert('Você precisa estar logado para se candidatar a uma vaga.');
        window.location.href = 'index.html';
        return;
    }

    let candidato;
    try {
        // Tenta converter a string guardada no LocalStorage para um objeto JavaScript
        candidato = JSON.parse(candidatoStr);
    } catch (e) {
        // Se houver corrupção nos dados, limpa o registo e obriga novo login
        alert('Erro nos dados do utilizador. Faça login novamente.');
        localStorage.removeItem('candidatoLogado');
        window.location.href = 'index.html';
        return;
    }

    // Procura por qualquer variação possível do ID no objeto guardado para garantir compatibilidade
    const idCandidatoReal = candidato.id_candidato || candidato.id || candidato.usuario_id;

    // Se o ID não for encontrado, força o reenvio para a tela de autenticação
    if (!idCandidatoReal) {
        alert('ID do candidato não encontrado. Por favor, faça login novamente na sua conta.');
        localStorage.removeItem('candidatoLogado');
        window.location.href = 'index.html';
        return;
    }

    try {
        // Envia uma requisição HTTP POST para registrar a candidatura no servidor
        const resposta = await fetch('http://localhost:3000/api/candidaturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_candidato: Number(idCandidatoReal), // Garante que o ID do candidato é enviado como número
                id_vaga: Number(idVaga)               // Garante que o ID da vaga é enviado como número
            })
        });

        const resultado = await resposta.json();

        // Se a candidatura for bem-sucedida, avisa o utilizador e redireciona para o perfil
        if (resposta.ok) {
            alert(resultado.mensagem);
            window.location.href = 'perfil.html';
        } else {
            // Caso contrário, exibe a mensagem de erro retornada pela API (ex: candidatura duplicada)
            alert(resultado.erro || 'Erro ao efetuar a candidatura.');
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
}


// ==========================================
// FUNÇÃO DE ANÁLISE DE COMPATIBILIDADE (MATCH)
// ==========================================
// Função para calcular a compatibilidade com base no resumo profissional do candidato e nos requisitos da vaga
function analisarMatch(tituloVaga, setorVaga, requisitosVaga, idVaga) {
    const candidato = JSON.parse(localStorage.getItem('candidatoLogado'));

    // Valida se o utilizador está autenticado antes de calcular o match
    if (!candidato) {
        alert('Faça login para verificar o seu nível de match com as vagas.');
        window.location.href = 'index.html';
        return;
    }

    // Normaliza o resumo do candidato para letras minúsculas para facilitar a comparação por palavras-chave
    const resumoCandidato = candidato.resumo ? candidato.resumo.toLowerCase() : '';
    
    let pontuacaoMatch = 50; // Pontuação inicial base
    let analiseTexto = "O seu perfil demonstra potencial para integrar esta equipa.";

    // Bonifica o candidato caso o seu resumo tenha conteúdo relevante
    if (resumoCandidato.length > 10) {
        pontuacaoMatch += 20;
    }

    const reqs = requisitosVaga.toLowerCase();
    // Verifica correspondências entre as competências do resumo e os requisitos/setor da vaga
    if (resumoCandidato.includes(setorVaga.toLowerCase()) || reqs.split(' ').some(palavra => palavra.length > 3 && resumoCandidato.includes(palavra))) {
        pontuacaoMatch += 25;
        analiseTexto = "Excelente alinhamento! As competências descritas no seu resumo coincidem com os requisitos exigidos para esta vaga.";
    } else if (resumoCandidato === '') {
        pontuacaoMatch = 40;
        analiseTexto = "O seu resumo profissional está vazio. Preencha o seu perfil para aumentar a precisão do Match!";
    }

    // Limites de segurança para a pontuação de match percentual
    if (pontuacaoMatch > 98) pontuacaoMatch = 98;
    if (pontuacaoMatch < 55 && resumoCandidato !== '') pontuacaoMatch = 65;

    // Seleciona o container do modal e injeta o resultado formatado dinamicamente com cores baseadas na pontuação
    const containerResultado = document.getElementById('match-resultado');
    containerResultado.innerHTML = `
        <div style="font-size: 2.5rem; font-weight: bold; color: ${pontuacaoMatch >= 75 ? '#2b8a3e' : '#d97706'}; margin-bottom: 10px;">
            ${pontuacaoMatch}% de Match
        </div>
        <p style="font-weight: bold; color: #444; margin-bottom: 8px;">Vaga: ${tituloVaga}</p>
        <p style="font-size: 0.95rem; color: #666; line-height: 1.4;">${analiseTexto}</p>
    `;

    // Configura a ação do botão de candidatura direta dentro do próprio modal de match
    document.getElementById('btn-candidatar-match').onclick = function() {
        fecharModalMatch();
        candidatarVaga(idVaga);
    };

    // Abre e exibe o modal de match na tela removendo a classe de ocultação
    const modal = document.getElementById('modal-match');
    modal.classList.remove('oculto');
    modal.style.display = 'flex';
}

// Função para fechar o modal de análise de Match
function fecharModalMatch() {
    const modal = document.getElementById('modal-match');
    modal.classList.add('oculto');
    modal.style.display = 'none';
}