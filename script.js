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

// Adiciona um ouvinte para interceptar o envio do formulário de login do RH
document.getElementById('form-login-rh-modal').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email-rh-modal').value.trim();
    const senha = document.getElementById('senha-rh-modal').value.trim();
    try {
        const resposta = await fetch('http://localhost:3000/api/login-rh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json();
        if (resposta.ok) {
            localStorage.setItem('rhLogado', 'true');
            localStorage.setItem('adminLogado', JSON.stringify(dados.admin));
            window.location.href = "rh.html";
        } else {
            alert(dados.erro || 'Credenciais inválidas.');
        }
    } catch (erro) {
        console.error('Erro de conexão:', erro);
        alert('Não foi possível conectar ao servidor backend.');
    }
});

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