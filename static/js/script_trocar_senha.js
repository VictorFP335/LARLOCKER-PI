async function update_senha() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmSenha = document.getElementById('confirmSenha').value;

    // Validação de campos vazios
    if (!email || !senha || !confirmSenha) {
        alert('Todos os campos são obrigatórios.');
        return;
    }

    // Verifica se as senhas coincidem
    if (senha !== confirmSenha) {
        alert('As senhas não coincidem.');
        return;
    }

    try {
        const response = await fetch('/update_senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha, confirmSenha }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Mostra mensagem de sucesso
            window.location.href = '/login'; // Redireciona para a página de login
        } else {
            alert(result.message); // Mostra mensagem de erro
        }
    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao tentar atualizar a senha.');
    }
}
