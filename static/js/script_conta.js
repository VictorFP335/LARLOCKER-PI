// Função para carregar dados do JSON e preencher os campos do formulário
async function loadUserData() {
    try {
        const response = await fetch('/get_account');
        if (!response.ok) throw new Error("Erro ao carregar os cômodos");

        const user = await response.json();
        document.getElementById('userName').value = user.name;  // Atualize para `value`
        document.getElementById('email').value = user.user;

    } catch (error) {
        console.error("Erro ao carregar os dados do usuário", error);
    }
}

async function saveChanges() {
    const nome_user = document.getElementById('userName').value;
    const email_user = document.getElementById('email').value;

    const response = await fetch('/update_account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: nome_user,
            user: email_user,
        })
    });

    const result = await response.json();
    if (!response.ok) {
        console.error(result.message);
        alert(result.message);
    } else {
        alert("Alterações salvas com sucesso!");
    }
    closePopup();
}


// Função para fechar o popup
function closePopup() {
    document.getElementById("confirmPopup").style.display = "none";
}

// Chama a função de carregamento quando a página é carregada
window.onload = loadUserData;
