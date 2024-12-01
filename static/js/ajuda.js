function toggleAnswer(element) {

    const faqItem = element.parentElement;
    if (!faqItem.classList.contains('active')) {
        faqItem.classList.add('active');
    }
    else {
        faqItem.classList.toggle('active');
    }
}

const chk = document.getElementById('chk');
const imagem = document.getElementById('imagem');

chk.addEventListener('change', () => {
    document.body.classList.toggle('white'); // Alterna o modo claro/escuro

    // Alterna a imagem da logo com base no modo
    if (document.body.classList.contains('white')) {
        imagem.setAttribute('src', 'static/img/larlocker_branco.png'); // Logo modo claro
    } else {
        imagem.setAttribute('src', 'static/img/larlocker.png'); // Logo modo escuro
    }
});