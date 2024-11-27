// Variável para armazenar o cartão que está sendo editado
let currentEditCard = null;

document.addEventListener("DOMContentLoaded", function () {
    const mainElement = document.querySelector("main");
    const listaUrl = mainElement.getAttribute("data-listaurl");

    async function loadListas() {
        try {
            const response = await fetch('/get_lista');
            if (!response.ok) throw new Error("Erro ao carregar as listas");

            const listas = await response.json();

            // Adiciona cada cômodo ao container
            listas.forEach(lista => {
                addRoomCard(lista.lista, lista.id_lista);
            });
        } catch (error) {
            console.error("Erro ao carregar as listas:", error);
        }
    }

    function cancelAddRoom() {
        document.getElementById("modalRoom").style.display = "none";
        document.getElementById("nomeLista").value = "";
    }

    function addRoomCard(nomeLista, idLista) {
        const comodoContainer = document.getElementById("listaContainer");
        const card = document.createElement("div");
        card.className = "lista-card";

        card.innerHTML = `
            <a class="id-lista" href="${listaUrl}?lista=${idLista}">
                <img src="static/img/lista_temp.png" alt="Imagem do cômodo" width="90%" height="80%">
            </a>
            <h2 class="lista-nome" id="nome_lista">${nomeLista}</h2>
            <span class="menu-dots" onclick="toggleMenuOptions(this)">⋮</span>
            <div class="menu-options" style="display: none;">
                <button onclick="editRoom(this)">Editar</button>
                <button onclick="deleteRoom(this)">Apagar</button>
            </div>
        `;

        comodoContainer.appendChild(card);
    }

    function showAddRoomForm() {
            document.getElementById("modalRoom").style.display = "block";
    }

    async function submitNewRoom() {
        const nomeLista = document.getElementById("nomeLista").value;
        if (nomeLista) {
            try {
    
                // Faz a requisição para adicionar o novo cômodo
                const response = await fetch('/add_lista', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nomeLista: nomeLista })
                });
    
                const result = await response.json();
                if (response.ok) {
                    const response1 = await fetch('/get_ultima_lista');
                    if (!response1.ok) throw new Error("Erro ao carregar as listas");
        
                    const ultimaLista = await response1.json();
                    let id_lista = ultimaLista.ultimo_id_lista;
        
                    addRoomCard(nomeLista, id_lista );  // Atualiza a interface com o novo cômodo
                    cancelAddRoom();  // Fecha o modal corretamente
                    console.log(result.message); // Para depuração
                } else {
                    console.error(result.message);
                    alert(result.message); // Exibe a mensagem de erro
                }
            } catch (error) {
                console.error("Erro ao adicionar a lista:", error);
            }
        } else {
            alert("Por favor, insira o nome da lista.");
        }
    }

    function cancelAddRoom() {
        document.getElementById("modalRoom").style.display = "none"; // Fecha o modal
        document.getElementById("nomeComodo").value = ""; // Limpa o campo
    }

    async function deleteRoom(button) {
        const card = button.closest('.lista-card'); // Seleciona o cartão pai
        const idLink = card.querySelector('.id-lista'); // Seleciona o link que contém o ID
        const idLista= new URL(idLink.href).searchParams.get('lista'); // Extrai o ID do parâmetro "comodo" na URL
    
        try {
            const response = await fetch('/delete_lista', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idLista: parseInt(idLista) }) // Envia o ID do cômodo para o servidor
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
            console.error("Erro ao excluir a lista, verifique se não há produtos dentro da lista antes de excluí-la: ", error);
        }
    }

    // Função para abrir o modal de edição
    function openEditModal(card) {
        currentEditCard = card;
        const nameElement = card.querySelector('.lista-nome');
        document.getElementById('editNomeLista').value = nameElement.textContent; // Preenche o campo com o nome atual
        document.getElementById('editModal').style.display = 'flex'; // Mostra o modal
    }

    // Função para fechar o modal de edição
    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none'; // Esconde o modal
        currentEditCard = null; // Limpa a referência ao cartão
    }

    async function submitEdit() {
        const newName = document.getElementById('editNomeLista').value;
        const idLink = currentEditCard.querySelector('.id-lista'); // Seleciona o link que contém o ID
        const idLista = new URL(idLink.href).searchParams.get('lista'); // Extrai o ID do parâmetro "comodo" na URL
        try {
            const response = await fetch('/update_lista', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ idLista: parseInt(idLista), nomeLista: newName }) // Envia o ID do cômodo para o servidor
            });
    
            const result = await response.json();
            if (response.ok) {
                if (newName && currentEditCard) {
            
                    const nameElement = currentEditCard.querySelector('.lista-nome');
                    nameElement.textContent = newName; // Atualiza o nome no cartão
                    closeEditModal(); // Fecha o modal após salvar
                } else {
                    alert("Por favor, insira o novo nome da lista.");
                }
            } else {
                console.error(result.message);
                alert(result.message); // Exibe a mensagem de erro
            }
        } catch (error) {
            console.error("Erro ao excluir a lista, verifique se não há produtos dentro da lista antes de excluí-la: ", error);
        }

    }

    document.getElementById("listaContainer").addEventListener("click", function (event) {
        if (event.target.classList.contains("menu-dots")) {
            // Alterna a exibição do menu de opções
            const menu = event.target.nextElementSibling;
            menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "flex" : "none";
        }
    
        if (event.target.textContent === "Editar") {
            // Executa a função de editar
            const card = event.target.closest(".lista-card");
            openEditModal(card);
        }

    
        if (event.target.textContent === "Apagar") {
            // Executa a função de apagar
            const card = event.target.closest(".lista-card");
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
    
    loadListas();

    window.showAddRoomForm = showAddRoomForm;
    window.cancelAddRoom = cancelAddRoom;
    window.submitNewRoom = submitNewRoom;
});