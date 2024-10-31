document.addEventListener('DOMContentLoaded', () => {
    const shoppingList = document.getElementById('shopping-list');
    const saveItemButton = document.getElementById('save-item');
    const monthlyButton = document.getElementById('monthly-button');
    const weeklyButton = document.getElementById('weekly-button');
    let currentList = 'Mensal';

    // Função para adicionar um item à lista
    function addItem(name, quantity) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        
        itemElement.innerHTML = `
            <span>${name}</span>
            <div class="d-flex align-items-center">
                <span class="badge badge-pill mr-2">${quantity}x</span>
                <button class="btn btn-sm edit-item mr-1">Editar</button>
                <button class="btn btn-sm delete-item">X</button>
            </div>
        `;
        
        shoppingList.appendChild(itemElement);

        // Event listener para remover o item
        itemElement.querySelector('.delete-item').addEventListener('click', () => {
            itemElement.remove();
        });

        // Event listener para editar a quantidade do item
        itemElement.querySelector('.edit-item').addEventListener('click', () => {
            const newQuantity = prompt('Digite a nova quantidade:', quantity);
            if (newQuantity) {
                itemElement.querySelector('.badge').textContent = `${newQuantity}x`;
            }
        });
    }

    // Alternar entre listas Mensal e Semanal
    function toggleList(type) {
        currentList = type;
        shoppingList.innerHTML = ''; // Limpa a lista atual
        // Aqui pode-se adicionar lógica para carregar a lista específica (ex: fetch de dados salvos)
    }

    monthlyButton.addEventListener('click', () => {
        toggleList('Mensal');
        monthlyButton.classList.add('active');
        weeklyButton.classList.remove('active');
    });

    weeklyButton.addEventListener('click', () => {
        toggleList('Semanal');
        weeklyButton.classList.add('active');
        monthlyButton.classList.remove('active');
    });

    // Salvar o item quando clicar no botão 'Salvar' no modal
    saveItemButton.addEventListener('click', () => {
        const itemName = document.getElementById('item-name').value;
        const itemQuantity = document.getElementById('item-quantity').value;

        if (itemName && itemQuantity) {
            addItem(itemName, itemQuantity);
            
            // Limpa o modal e fecha
            document.getElementById('item-name').value = '';
            document.getElementById('item-quantity').value = '1';
            $('#addItemModal').modal('hide');
        } else {
            alert("Por favor, preencha o nome e a quantidade do item.");
        }
    });
});
