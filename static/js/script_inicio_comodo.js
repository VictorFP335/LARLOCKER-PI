let currentEditCard = null;

document.addEventListener("DOMContentLoaded", function () {
    const mainElement = document.querySelector("main");
    const comodoUrl = mainElement.getAttribute("data-comodourl");

    async function loadComodos() {
        try {
            const response = await fetch('/get_comodos');
            if (!response.ok) throw new Error("Erro ao carregar os cômodos");

            const comodos = await response.json();

            // Adiciona cada cômodo ao container
            comodos.forEach(comodo => {
                addRoomCard(comodo.comodo, comodo.id_comodo);
            });
        } catch (error) {
            console.error("Erro ao carregar os cômodos:", error);
        }
    }

    function cancelAddRoom() {
        document.getElementById("modalRoom").style.display = "none";
        document.getElementById("nomeComodo").value = "";
    }
    
    function addRoomCard(nomeComodo, idComodo) {
        const comodoContainer = document.getElementById("comodoContainer");
        const card = document.createElement("div");
        card.className = "comodo-card";

        card.innerHTML = `
            <a href="${comodoUrl}?comodo=${idComodo}">
                <img src="static/img/img/comodo_temp.png" alt="Imagem do cômodo" width="90%" height="80%">
            </a>
            <h2 class="comodo-nome" id="nome_comodo">${nomeComodo}</h2>
            <span class="menu-dots" onclick="toggleMenuOptions(this)">⋮</span>
            <div class="menu-options" style="display: none;">
                <button onclick="editRoom(this)">Editar</button>
                <button onclick="deleteRoom(this)">Apagar</button>
            </div>
        `;

        comodoContainer.appendChild(card);
    }

    

    function checkValidade(produtos) {
        const hoje = new Date();
        const mensagens = [];

        produtos.forEach(produto => {
            if (produto.validade) {
                const validade = new Date(produto.validade);
                const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));

                if (diasRestantes < 0) {
                    mensagens.push(`<p>O produto <strong>${produto.nome}</strong>está vencido (Validade: <strong>${produto.validade}</strong>)</p>`);
                } else if (diasRestantes <= 7) {
                    mensagens.push(`<p>O produto <strong>${produto.nome}</strong> está próximo ao vencimento. <br> (Validade: <strong>${produto.validade}</strong>)</p>`);
                }
            }
        });

        if (mensagens.length > 0) {
            showAlert(mensagens.join('')); // Mescla os parágrafos sem separadores extras
        }
    }

    function showAddRoomForm() {
        document.getElementById("modalRoom").style.display = "block";
    }

    async function submitNewRoom() {
        const nomeComodo = document.getElementById("nomeComodo").value;
        if (nomeComodo) {
            try {
                // Faz a requisição para obter o último cômodo
                const response1 = await fetch('/get_ultimo_comodo');
                if (!response1.ok) throw new Error("Erro ao carregar os cômodos");
    
                const ultimoComodo = await response1.json();
                let id_comodo;
    
                // Lógica para definir o próximo id do cômodo
                if (ultimoComodo.ultimo_id_comodo === null) {
                    id_comodo = 1; // Primeiro cômodo
                } else {
                    id_comodo = ultimoComodo.ultimo_id_comodo + 1; // Incrementa o ID
                }
    
                // Faz a requisição para adicionar o novo cômodo
                const response = await fetch('/add_comodo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nomeComodo: nomeComodo })
                });
    
                const result = await response.json();
                if (response.ok) {
                    addRoomCard(nomeComodo, id_comodo);  // Atualiza a interface com o novo cômodo
                    cancelAddRoom();  // Fecha o modal corretamente
                    console.log(result.message); // Para depuração
                } else {
                    console.error(result.message);
                    alert(result.message); // Exibe a mensagem de erro
                }
            } catch (error) {
                console.error("Erro ao adicionar o cômodo:", error);
            }
        } else {
            alert("Por favor, insira o nome do cômodo.");
        }
    }
    
    function cancelAddRoom() {
        document.getElementById("modalRoom").style.display = "none"; // Fecha o modal
        document.getElementById("nomeComodo").value = ""; // Limpa o campo
    }
    
    async function deleteRoom(button) {
        const card = button.closest('.comodo-card'); // Seleciona o cartão pai
        const nome = card.querySelector('.comodo-nome').textContent.trim(); // Obtém o nome do cômodo do cartão
    
        if (!nome) {
            alert("Erro: Nome do cômodo não encontrado.");
            return;
        }
    
        try {
            const response = await fetch('/delete_comodo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nomeComodo: nome }) // Envia o nome correto
            });
    
            const result = await response.json();
            if (response.ok) {
                card.remove(); // Remove o cartão da interface
                console.log(result.message); // Para depuração
            } else {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao excluir o cômodo:", error);
        }
    }

    // Função para abrir o modal de edição
    function openEditModal(card) {
        currentEditCard = card;
        const nameElement = card.querySelector('.comodo-nome');
        document.getElementById('editNomeComodo').value = nameElement.textContent; // Preenche o campo com o nome atual
        document.getElementById('editModal').style.display = 'flex'; // Mostra o modal
    }

    // Função para fechar o modal de edição
    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none'; // Esconde o modal
        currentEditCard = null; // Limpa a referência ao cartão
    }

    // Função para salvar a edição do nome do cômodo
    function submitEdit() {
        const newName = document.getElementById('editNomeComodo').value;
        if (newName && currentEditCard) {
            const nameElement = currentEditCard.querySelector('.comodo-nome');
            nameElement.textContent = newName; // Atualiza o nome no cartão
            closeEditModal(); // Fecha o modal após salvar
        } else {
            alert("Por favor, insira o novo nome do cômodo.");
        }
    }

    document.getElementById("comodoContainer").addEventListener("click", function (event) {
        if (event.target.classList.contains("menu-dots")) {
            // Alterna a exibição do menu de opções
            const menu = event.target.nextElementSibling;
            menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "flex" : "none";
        }
    
        if (event.target.textContent === "Editar") {
            // Executa a função de editar
            const card = event.target.closest(".comodo-card");
            openEditModal(card);
        }

    
        if (event.target.textContent === "Apagar") {
            // Executa a função de apagar
            const card = event.target.closest(".comodo-card");
            deleteRoom(card);
        }
    });

    document.getElementById("editModal").addEventListener("click", function (event) {
        if (event.target.classList.contains("close")) {
            closeEditModal();
        }

        if (event.target.textContent === "Salvar") {
            submitEdit();
        }
    });
    
    
    loadComodos();

    // Exponha as funções ao escopo global para serem acessíveis pelo botão do HTML
    window.showAddRoomForm = showAddRoomForm;
    window.cancelAddRoom = cancelAddRoom;
    window.submitNewRoom = submitNewRoom;
});
