document.addEventListener("DOMContentLoaded", function () {
    const mainElement = document.querySelector("main");
    const comodoUrl = mainElement.getAttribute("data-comodourl");
    const imgPath = mainElement.getAttribute("data-imgpath");

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
                <img src="${imgPath}" alt="Imagem do cômodo" width="70%" height="90%">
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
