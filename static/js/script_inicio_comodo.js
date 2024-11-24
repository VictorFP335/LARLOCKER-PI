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

    function cancelAddRoom() {
        document.getElementById("modalRoom").style.display = "none";
        document.getElementById("nomeComodo").value = "";
    }

    async function submitNewRoom() {
        const nomeComodo = document.getElementById("nomeComodo").value;
        if (nomeComodo) {
            try {
                const response = await fetch('/add_comodo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nomeComodo: nomeComodo })
                });

                const result = await response.json();
                if (response.ok) {
                    addRoomCard(nomeComodo);  // Atualiza a interface com o novo cômodo
                    cancelAddRoom();  // Fecha o modal
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

    function addRoomCard(nomeComodo, idComodo) {
        const comodoContainer = document.getElementById("comodoContainer");
        const card = document.createElement("div");
        card.className = "comodo-card";

        card.innerHTML = `
            <a href="${comodoUrl}?comodo=${idComodo}">
                <img src="../../img/comodo_temp.png" alt="Imagem do cômodo" width="70%" height="90%">
            </a>
            <h2>${nomeComodo}</h2>
        `;

        comodoContainer.appendChild(card);
    }

    loadComodos();

    // Exponha as funções ao escopo global para serem acessíveis pelo botão do HTML
    window.showAddRoomForm = showAddRoomForm;
    window.cancelAddRoom = cancelAddRoom;
    window.submitNewRoom = submitNewRoom;
});
