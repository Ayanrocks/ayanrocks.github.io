// Replace this URL with your actual Google Apps Script Web App URL
const scriptURL = 'https://script.google.com/macros/s/AKfycbwB8evDzJd3cdU1tP9X1zO0uxZrDU794E6fH6O_pn966GRB2IkmSVnzloUL0GXerQ/exec';
const form = document.forms['submit-to-google-sheet'];
const msgElem = document.getElementById('form-msg');

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        msgElem.className = 'form-status'; // reset

        try {
            // Using FormData makes it easy as the Apps Script parses x-www-form-urlencoded seamlessly when sent this way or via fetch body
            const response = await fetch(scriptURL, {
                method: 'POST',
                body: new FormData(form)
            });

            if (response.ok) {
                msgElem.textContent = 'Message sent successfully! I will get back to you soon.';
                msgElem.classList.add('success');
                form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error!', error.message);
            msgElem.textContent = 'Oops! There was a problem submitting your form. Did you set the Web App URL?';
            msgElem.classList.add('error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}
