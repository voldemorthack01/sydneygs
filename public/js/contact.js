document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        full_name: document.getElementById('full_name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    // Basic validation
    if (!formData.full_name || !formData.message || (!formData.phone && !formData.email)) {
        formMessage.textContent = 'Please fill in all required fields.';
        formMessage.className = 'form-message error';
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            formMessage.textContent = 'Thank you! Your message has been received. We will contact you soon.';
            formMessage.className = 'form-message success';
            e.target.reset();
        } else {
            formMessage.textContent = result.message || 'An error occurred. Please try again.';
            formMessage.className = 'form-message error';
        }
    } catch (error) {
        console.error('Submission error:', error);
        formMessage.textContent = 'Connection error. Please try again later.';
        formMessage.className = 'form-message error';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }
});
