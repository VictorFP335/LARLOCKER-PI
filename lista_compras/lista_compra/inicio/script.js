async function loadComodos() {
    // Carrega o arquivo JSON com os dados dos cômodos
    const response = await fetch('listas.json');
    const comodos = await response.json();

    const comodoContainer = document.getElementById('comodoContainer');

    // Cria os cartões dos cômodos
    comodos.forEach(comodo => {
        const card = document.createElement('div');
        card.classList.add('comodo-card');

        // Adiciona a imagem do cômodo (usando um nome de imagem padrão)
        const img = document.createElement('img');
        img.src = `../../img/comodo.png`; // Supondo que o nome da imagem é o nome do cômodo em minúsculas
        img.style.width = '50%';
        img.style.height = '50%';
        img.alt = comodo.comodo;

        // Adiciona o nome do cômodo
        const title = document.createElement('h2');
        title.textContent = comodo.comodo;

        // Adiciona o evento de clique para redirecionar para a página do cômodo
        card.onclick = () => {
            window.location.href = `inicio.html?comodo=${comodo.comodo}`;
        };

        // Adiciona a imagem e o título ao cartão
        card.appendChild(img);
        card.appendChild(title);
        comodoContainer.appendChild(card);
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
        alert("Por favor, insira o nome da lista.");
    }
}

// Função para criar e adicionar o cartão do cômodo
function addRoomCard(nomeComodo) {
    const comodoContainer = document.getElementById("comodoContainer");

    // Cria o elemento do cartão
    const card = document.createElement("div");
    card.className = "comodo-card";

    // Adiciona o conteúdo do cartão (imagem e nome do cômodo)
    card.innerHTML = `
        <img src="../../img/comodo.png" alt="Imagem do cômodo" width = '50%' height = '50%'>
        <h2>${nomeComodo}</h2>
    `;

    // Insere o cartão no contêiner
    comodoContainer.appendChild(card);
}

// Carrega os cômodos quando a página é carregada
window.onload = loadComodos;
