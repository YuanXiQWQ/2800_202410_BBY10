document.addEventListener('DOMContentLoaded', function () {
    try {
        const languageDataElement = document.getElementById('languageData');
        if (languageDataElement) {
            const languageData = JSON.parse(languageDataElement.textContent);
            const elements = document.querySelectorAll('.lang-text');
            elements.forEach(element => {
                const key = element.getAttribute('data-key');
                if (languageData[key]) {
                    element.textContent = languageData[key];
                }
            });
        } else {
            console.error('No language data element found');
        }
    } catch (error) {
        console.error('Error parsing language data:', error);
    }
});
