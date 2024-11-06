function cadastrar() {
    const usuario = document.getElementById('cadastroUsuario').value;
    const senha = document.getElementById('cadastroSenha').value;

    if (usuario === '' || senha === '') {
        alert('Preencha todos os campos.');
        return;
    }

    // Verifica se o usuário já está cadastrado
    if (localStorage.getItem(usuario)) {
        alert('Usuário já cadastrado.');
        return;
    }

    // Armazena os dados do usuário no localStorage
    localStorage.setItem(usuario, senha);
    alert('Cadastro realizado com sucesso!');
    limparCampos();
}

// Função para logar
function login() {
    const usuario = document.getElementById('loginUsuario').value;
    const senha = document.getElementById('loginSenha').value;

    const senhaArmazenada = localStorage.getItem(usuario);

    if (senhaArmazenada === senha) {
        alert('Login realizado com sucesso!');
        limparCampos();
    } else {
        alert('Usuário ou senha incorretos.');
    }
}

// Função para limpar os campos de texto
function limparCampos() {
    document.getElementById('cadastroUsuario').value = '';
    document.getElementById('cadastroSenha').value = '';
    document.getElementById('loginUsuario').value = '';
    document.getElementById('loginSenha').value = '';
}

// Exemplo de validação de senha no cadastro
document.querySelector('form').addEventListener('submit', function (e) {
    const senha = document.querySelector('input[type="password"]').value;
    const confirmarSenha = document.querySelectorAll('input[type="password"]')[1] ? document.querySelectorAll('input[type="password"]')[1].value : null;

    if (confirmarSenha && senha !== confirmarSenha) {
        e.preventDefault();
        alert('As senhas não coincidem. Por favor, tente novamente.');
    }
});
/*
document.getElementById("enviar").addEventListener("click", function(event) {
    event.preventDefault(); // Evita o envio do formulário para fins de demonstração
    alert("Entrando na pagina!");
    // Aqui você pode adicionar a lógica para o envio do formulário, se necessário
});
*/

// Seleciona a div pela ID
const caixa = document.getElementById("enviar");

// Adiciona evento mouseover
caixa.addEventListener("mouseover", function () {
    caixa.style.backgroundColor = "#0056b3"; // Muda a cor de fundo quando o mouse passa
});

// Adiciona evento mouseout
caixa.addEventListener("mouseout", function () {
    caixa.style.backgroundColor = "#800080"; // Retorna à cor original quando o mouse sai
});


caixa.addEventListener("mousemove", function (event) {
    const rect = caixa.getBoundingClientRect(); // Pega as coordenadas do elemento
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Verifica se o mouse está próximo do centro (uma margem de erro de 10px)
    if (Math.abs(event.clientX - centerX) < 10 && Math.abs(event.clientY - centerY) < 10) {
        caixa.style.backgroundColor = "lightyellow";
        caixa.innerText = "Mouse no Centro!";
    }
});

function showError() {
    var errorBox = document.getElementById('error-box');
    if (errorBox) {
        errorBox.style.display = 'block';
    }
}
