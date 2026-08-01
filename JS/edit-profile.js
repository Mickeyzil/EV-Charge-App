document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    const profileForm = document.getElementById('edit-profile-form');
    const notification = document.getElementById('notification');

    const submitBtn = profileForm ? profileForm.querySelector('.submit-btn') : null;

    const backBtn = document.getElementById('btn-back');
    const modal = document.getElementById('back-modal');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    function showNotification(message, type) {
        if (notification) {
            notification.textContent = message;
            notification.className = `notification-box ${type}`; 
            notification.classList.remove('hidden');
            notification.scrollIntoView({ behavior: 'smooth' });
        }
    }

    if (userId) {
        fetch(`${API_URL}/api/users/${userId}`)
            .then(res => res.json())
            .then(user => {
                document.getElementById('full-name').value = user.full_name || '';
                document.getElementById('email').value = user.email || '';
                document.getElementById('email').disabled = true; 
                document.getElementById('phone').value = user.phone || '';
                
                const carSelect = document.getElementById('car-model');
                if (carSelect && user.car_model) {
                    carSelect.value = user.car_model;
                }
            })
            .catch(err => {
                console.error("Error loading profile:", err);
                showNotification("Failed to load profile data.", "error");
            });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const password = document.getElementById('new-password').value;
            const oldPassword = document.getElementById('old-password').value;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (password && !passwordRegex.test(password)) {
                showNotification('Password must be 8+ chars, with uppercase, lowercase, and a number.', 'error');
                return;
            }

            if (password && password === oldPassword) {
                showNotification('New password cannot be the same as your current password.', 'error');
                return; 
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Updating profile... ⏳';
            }

            const updatedData = {
                full_name: document.getElementById('full-name').value,
                phone: document.getElementById('phone').value,
                car_model: document.getElementById('car-model').value,
                password: password,
                oldPassword: oldPassword
            };

            fetch(`${API_URL}/api/users/update/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message); 
                return data;
            })
            .then(data => {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Profile Updated! 🎉';
                }

                showNotification("Profile updated successfully!", "success");
                
                setTimeout(() => { 
                    window.location.href = 'MainMenu.html'; 
                }, 1500);
            })
            .catch(err => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Changes';
                }
                showNotification(err.message, "error"); 
            });
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (modal) modal.classList.remove('hidden');
        });
    }

    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            window.location.href = 'MainMenu.html';
        });
    }
});