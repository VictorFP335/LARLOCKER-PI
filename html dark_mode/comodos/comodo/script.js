// Função para carregar o JSON e popular a tabela
async function loadItems() {
    try {
        const response = await fetch('produtos.json'); // Carrega o arquivo JSON
        const data = await response.json();

        // Exibe o nome do cômodo
        const comodoName = data.comodo;
        document.getElementById('comodoTitle').textContent = comodoName;

        // Adiciona os produtos à tabela
        const tableBody = document.querySelector('#itemTable tbody');
        tableBody.innerHTML = ''; // Limpa o conteúdo existente

        data.produtos.forEach(item => {
            addRow(item.nome, item.quantidade, item.tipo, item.validade);
        });
    } catch (error) {
        console.error("Erro ao carregar os itens:", error);
    }
}

// Função para mostrar o formulário de adição de itens
function showAddItemForm() {
    document.getElementById('modal').style.display = 'block'; // Exibe o modal
    document.getElementById('nomeProduto').value = ''; // Limpa o campo de nome
    document.getElementById('quantidadeProduto').value = ''; // Limpa o campo de quantidade
    document.getElementById('validade').value = ''; // Limpa o campo de validade
    document.getElementById('perecivel').checked = false;
    document.getElementById('naoPerecivel').checked = false;
}

// Função para cancelar a adição de um novo item
function cancelAddItem() {
    document.getElementById('modal').style.display = 'none'; // Esconde o modal
}

// Função para submeter o novo item
function submitNewItem() {
    const nomeProduto = document.getElementById('nomeProduto').value;
    const quantidadeProduto = parseInt(document.getElementById('quantidadeProduto').value) || 0;
    const perecivel = document.getElementById('perecivel').checked;
    const naoPerecivel = document.getElementById('naoPerecivel').checked;
    const validade = document.getElementById('validade').value;

    // Valida o nome do produto (não permite vazio)
    if (!nomeProduto) {
        alert("O nome do produto não pode estar vazio!");
        return;
    }

    // Valida que apenas uma opção entre perecível e não perecível esteja marcada
    if (!perecivel && !naoPerecivel) {
        alert("Por favor, selecione o tipo de produto (Perecível ou Não Perecível).");
        return;
    } else if (perecivel && naoPerecivel) {
        alert("Por favor, selecione apenas uma opção: Perecível ou Não Perecível.");
        return;
    }

    // Se for perecível, valida que a data de validade foi preenchida
    if (perecivel && !validade) {
        alert("Por favor, informe a validade do produto perecível.");
        return;
    }

    const tipo = perecivel ? "Perecível" : "Não Perecível";

    // Adiciona o novo item à tabela
    addRow(nomeProduto, quantidadeProduto, tipo, validade);
    cancelAddItem(); // Esconde o modal após a adição
}

// Função para adicionar uma linha na tabela
function addRow(nome, quantidade, tipo, validade) {
    const tableBody = document.querySelector('#itemTable tbody');
    const row = document.createElement('tr');

    // Coluna de Produto (nome)
    const nomeCell = document.createElement('td');
    nomeCell.textContent = nome;
    row.appendChild(nomeCell);

    // Coluna de Quantidade com imagens de adição e subtração
    const quantidadeCell = document.createElement('td');
    quantidadeCell.className = 'quantidade-col';
    quantidadeCell.style.display = 'flex';
    quantidadeCell.style.alignItems = 'center';
    quantidadeCell.style.justifyContent = 'space-between';
    quantidadeCell.style.height = '40px'

    const quantityContainer = document.createElement('div');
    quantityContainer.style.display = 'flex';
    quantityContainer.style.alignItems = 'center';

    const minusButton = document.createElement('img');
    minusButton.src = '../../img/menos.png';
    minusButton.style.width = '20px';
    minusButton.style.height = '20px';
    minusButton.style.cursor = 'pointer';
    minusButton.onclick = () => updateQuantity(row, -1); // Passa a linha como referência

    const quantityText = document.createElement('span');
    quantityText.textContent = quantidade;
    quantityText.className = 'quantity-text';
    quantityText.style.margin = '0 10px';

    const plusButton = document.createElement('img');
    plusButton.src = '../../img/mais.png';
    plusButton.style.width = '20px';
    plusButton.style.height = '20px';
    plusButton.style.cursor = 'pointer';
    plusButton.onclick = () => updateQuantity(row, 1); // Passa a linha como referência

    quantityContainer.appendChild(minusButton);
    quantityContainer.appendChild(quantityText);
    quantityContainer.appendChild(plusButton);

    const deleteButton = document.createElement('img');
    deleteButton.src = '../../img/lixo.png';
    deleteButton.style.width = '20px';
    deleteButton.style.height = '20px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.marginLeft = '10px';
    deleteButton.onclick = () => row.remove(); // Remove a linha

    quantidadeCell.appendChild(quantityContainer);
    quantidadeCell.appendChild(deleteButton);
    row.appendChild(quantidadeCell);

    // Coluna de Tipo
    const tipoCell = document.createElement('td');
    tipoCell.textContent = tipo;
    row.appendChild(tipoCell);

    // Coluna de Validade (vazia se não for perecível)
    const validadeCell = document.createElement('td');
    validadeCell.textContent = validade ? validade : "";
    row.appendChild(validadeCell);

    tableBody.appendChild(row);
}

// Função para atualizar a quantidade do item
function updateQuantity(row, change) {
    const quantityText = row.querySelector('.quantity-text');
    let currentQuantity = parseInt(quantityText.textContent);

    // Atualiza a quantidade e evita valores negativos
    currentQuantity = Math.max(0, currentQuantity + change);
    quantityText.textContent = currentQuantity;

    // Se a quantidade for zero, remove a linha
    if (currentQuantity === 0) {
        row.remove();
    }
}

// Fecha o modal quando o usuário clicar fora dele
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

function toggleTipo(selectedId) {
    const perecivelCheckbox = document.getElementById('perecivel');
    const naoPerecivelCheckbox = document.getElementById('naoPerecivel');

    if (selectedId === 'perecivel') {
        naoPerecivelCheckbox.checked = false;
    } else {
        perecivelCheckbox.checked = false;
    }
}


// Carrega os itens ao abrir a página
window.onload = loadItems;

// Modo claro e escuro
const chk = document.getElementById('chk')

chk.addEventListener('change', () => {
  document.body.classList.toggle('dark')
})