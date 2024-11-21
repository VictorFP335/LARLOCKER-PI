// Variável para armazenar o cartão que está sendo editado
let currentEditCard = null;

// Função para carregar os cômodos a partir de um arquivo JSON (comodos.json)
function loadComodos() {
    fetch('comodos.json')
        .then(response => response.json())
        .then(comodos => {
            const comodoContainer = document.getElementById('comodoContainer');
            comodos.forEach(comodo => {
                addRoomCard(comodo.comodo);
            });
        });
}

// Função para mostrar o modal de adicionar cômodo
function showAddRoomForm() {
    document.getElementById("modalRoom").style.display = "block";
}

// Função para cancelar a adição de cômodo e fechar o modal
function cancelAddRoom() {
    document.getElementById("modalRoom").style.display = "none";
    document.getElementById("nomeComodo").value = ""; // Limpa o campo de entrada
}

// Função para adicionar um novo cômodo
function submitNewRoom() {
    const nomeComodo = document.getElementById("nomeComodo").value;
    if (nomeComodo) {
        addRoomCard(nomeComodo); // Adiciona o cartão do cômodo
        cancelAddRoom(); // Fecha o modal
    } else {
        alert("Por favor, insira o nome do cômodo.");
    }
}

// Função para adicionar o cartão do cômodo ao contêiner
function addRoomCard(nomeComodo) {
    const comodoContainer = document.getElementById("comodoContainer");

    // Cria o elemento do cartão
    const card = document.createElement("div");
    card.className = "comodo-card";

    // Adiciona a imagem do cômodo e o nome
    card.innerHTML = `
        <img src="../../img/comodo_temp.png" alt="Imagem do cômodo" width="80%" height="80%">
        <h2 class="comodo-nome">${nomeComodo}</h2>
        <span class="menu-dots" onclick="toggleMenuOptions(this)">⋮</span>
        <div class="menu-options" style="display: none;">
            <button onclick="editRoom(this)">Editar</button>
            <button onclick="deleteRoom(this)">Apagar</button>
        </div>
    `;

    comodoContainer.appendChild(card);
}

// Função para alternar a exibição do menu de opções
function toggleMenuOptions(button) {
    const menu = button.nextElementSibling;
    menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "flex" : "none";
}

// Função para abrir o modal de edição para um cômodo específico
function editRoom(button) {
    const card = button.closest('.comodo-card'); // Seleciona o cartão pai
    openEditModal(card); // Abre o modal de edição para o cartão selecionado
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

// Função para apagar o cômodo
function deleteRoom(button) {
    const card = button.closest('.comodo-card'); // Seleciona o cartão pai
    card.remove(); // Remove o cartão da interface
}

// Carrega os cômodos quando a página é carregada
window.onload = loadComodos;
