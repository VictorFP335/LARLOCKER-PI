function toggleAnswer(element) {
    const allFaqItems = document.querySelectorAll('.faq-item');

    allFaqItems.forEach(item => {
        item.classList.remove('active');
    });

    const faqItem = element.parentElement;
    if (!faqItem.classList.contains('active')) {
        faqItem.classList.add('active');
    }
}
