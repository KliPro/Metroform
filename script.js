// Função global para exibir o modal de login/cadastro do candidato na tela
function abrirModalCandidato() {
    document.getElementById('modal-candidato').style.display = 'flex';
}

// Função global para ocultar o modal de candidato
function fecharModalCandidato() {
    document.getElementById('modal-candidato').style.display = 'none';
}

// Função global para exibir o modal de acesso do RH/Gestor
function abrirModalRH() {
    document.getElementById('modal-rh').style.display = 'flex';
}

// Função global para ocultar o modal de RH/Gestor
function fecharModalRH() {
    document.getElementById('modal-rh').style.display = 'none';
}

// Função para abrir o modal de recuperação de senha a partir do link do modal de candidato
function abrirModalRecuperar(event) {
    event.preventDefault();
    document.getElementById('modal-recuperar').style.display = 'flex';
}

// Função para fechar o modal de recuperação de senha
function fecharModalRecuperar() {
    document.getElementById('modal-recuperar').style.display = 'none';
}

// Função para alternar visualmente entre as abas de Entrar e Criar Conta no modal do Candidato
function mudarAbaCand(tipo) {
    const btnEntrar = document.getElementById('aba-cand-entrar');
    const btnCadastrar = document.getElementById('aba-cand-cadastrar');
    const formLogin = document.getElementById('form-login-candidato');
    const formCadastro = document.getElementById('form-cadastro-candidato');

    if (tipo === 'login') {
        btnEntrar.style.background = 'white';
        btnEntrar.style.color = '#7A0000';
        btnCadastrar.style.background = 'transparent';
        btnCadastrar.style.color = '#555';
        formLogin.style.display = 'block';
        formCadastro.style.display = 'none';
    } else {
        btnCadastrar.style.background = 'white';
        btnCadastrar.style.color = '#7A0000';
        btnEntrar.style.background = 'transparent';
        btnEntrar.style.color = '#555';
        formCadastro.style.display = 'block';
        formLogin.style.display = 'none';
    }
}

// Adiciona um ouvinte para interceptar o envio do formulário de cadastro do candidato
document.getElementById('form-cadastro-candidato').addEventListener('submit', async function(e) {
    e.preventDefault();
    const dadosCandidato = {
        nome: document.getElementById('nome-cad-cand').value,
        email: document.getElementById('email-cad-cand').value,
        senha: document.getElementById('senha-cad-cand').value
    };
    try {
        const resposta = await fetch('http://localhost:3000/api/candidatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosCandidato)
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            alert(resultado.mensagem);
            document.getElementById('form-cadastro-candidato').reset();
            mudarAbaCand('login');
        } else {
            alert(resultado.erro);
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor backend.');
    }
});

// Adiciona um ouvinte para interceptar o envio do formulário de login do candidato
document.getElementById('form-login-candidato').addEventListener('submit', async function(e) {
    e.preventDefault();
    const dadosLogin = {
        email: document.getElementById('email-login-cand').value,
        senha: document.getElementById('senha-login-cand').value
    };
    try {
        const resposta = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosLogin)
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            localStorage.setItem('candidatoLogado', JSON.stringify(resultado.candidato));
            window.location.href = 'perfil.html';
        } else {
            alert(resultado.erro);
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor backend.');
    }
});

// Validação rigorosa do login do Gestor RH (E-mail e Senha)
const formLoginRhModal = document.getElementById("form-login-rh-modal");

if (formLoginRhModal) {
    formLoginRhModal.addEventListener("submit", (e) => {
        e.preventDefault();

        const emailInput = document.getElementById("email-rh-modal").value.trim();
        const senhaInput = document.getElementById("senha-rh-modal").value.trim();

        // Valida se o e-mail e a senha correspondem exatamente aos dados permitidos
        if (emailInput === "rh@metroform.com" && senhaInput === "123456") {
            
            // Cria o objeto do gestor logado
            const dadosAdmin = {
                nome: "Gestor RH",
                email: emailInput
            };

            // Salva a sessão correta no navegador
            localStorage.setItem('adminLogado', JSON.stringify(dadosAdmin));
            
            // Redireciona para o painel de RH
            window.location.href = 'rh.html';
            
        } else {
            alert("E-mail ou senha incorretos!");
        }
    });
}

// Adiciona um ouvinte para o envio do formulário de recuperação de senha
document.getElementById('form-modal-recuperar').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email-recuperar').value.trim();
    const novaSenha = document.getElementById('nova-senha-recuperar').value.trim();
    try {
        const resposta = await fetch('http://localhost:3000/api/recuperar-senha', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, novaSenha })
        });
        const resultado = await resposta.json();
        if (resposta.ok) {
            alert(resultado.mensagem);
            fecharModalRecuperar();
            document.getElementById('form-modal-recuperar').reset();
        } else {
            alert(resultado.erro || 'Erro ao redefinir senha.');
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor.');
    }
});

// Função global para terminar sessão de qualquer tipo de utilizador
function logoutGeral() {
    localStorage.removeItem('candidatoLogado');
    localStorage.removeItem('adminLogado');
    localStorage.removeItem('rhLogado');
    window.location.href = 'index.html';
}

// Verificação de sessão ao carregar a página inicial
document.addEventListener('DOMContentLoaded', () => {
    // --- VERIFICAÇÃO DO CANDIDATO ---
    const candidatoLogado = JSON.parse(localStorage.getItem('candidatoLogado'));
    const linkCandidato = document.getElementById('link-candidato-header');

    if (candidatoLogado && linkCandidato) {
        const primeiroNome = candidatoLogado.nome.split(' ')[0];
        linkCandidato.textContent = `Olá, ${primeiroNome}`;
        
        // Redireciona diretamente para o perfil ao clicar
        linkCandidato.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'perfil.html';
        };
        
        linkCandidato.classList.add('usuario-logado');
    }

    // --- VERIFICAÇÃO DO GESTOR RH ---
    const adminLogado = JSON.parse(localStorage.getItem('adminLogado'));
    const linkRh = document.getElementById('link-rh-header');

    if (adminLogado && linkRh) {
        const primeiroNomeAdmin = adminLogado.nome.split(' ')[0];
        linkRh.textContent = `Painel: ${primeiroNomeAdmin}`;
        
        // Redireciona diretamente para o painel de RH ao clicar
        linkRh.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'rh.html';
        };
        
        linkRh.classList.add('usuario-logado');
    }
});

// Carrega as vagas cadastradas pelo RH na Página Inicial
document.addEventListener("DOMContentLoaded", () => {
    carregarVagasNaHome();
});

async function carregarVagasNaHome() {
    const gridVagas = document.querySelector(".grid-vagas");
    if (!gridVagas) return;

    try {
        const resposta = await fetch("http://localhost:3000/api/vagas");
        if (resposta.ok) {
            const vagas = await resposta.json();

            if (vagas.length === 0) {
                gridVagas.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #666;">Nenhuma vaga ativa no momento.</p>`;
                return;
            }

            gridVagas.innerHTML = "";
            // Exibe por exemplo as últimas 3 vagas cadastradas na página principal
            vagas.slice(0, 3).forEach(vaga => {
                const card = document.createElement("div");
                card.style.cssText = "background: white; padding: 25px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border-left: 4px solid #8B0000;";
                
                card.innerHTML = `
                    <h3 style="margin-top: 0; color: #1a1a1a; font-size: 18px;">${vaga.titulo}</h3>
                    <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Setor:</strong> ${vaga.setor}</p>
                    <p style="color: #666; font-size: 14px; margin: 5px 0;"><strong>Local:</strong> ${vaga.localizacao || "Guarulhos / SP"}</p>
                    <p style="color: #555; font-size: 13px; margin: 15px 0 0 0;">${vaga.requisitos || ""}</p>
                `;
                gridVagas.appendChild(card);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar vagas na home:", erro);
    }
}