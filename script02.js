// Alternância do Modo Claro/Escuro
const toggle = document.getElementById('toggle-dark-mode');
const body = document.body;

toggle.addEventListener('change', function() {
    if (this.checked) {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }
});
