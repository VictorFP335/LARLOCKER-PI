function toggleAnswer(element) {

    const faqItem = element.parentElement;
    if (!faqItem.classList.contains('active')) {
        faqItem.classList.add('active');
    }
    else {
        faqItem.classList.toggle('active');
    }
}