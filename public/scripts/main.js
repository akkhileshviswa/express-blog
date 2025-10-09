const form = document.getElementById("signupForm");
const lettersAndDigitsOnly = /^[a-zA-Z0-9]+$/;
const hasLetter = /[a-zA-Z]/;
const hasDigit = /[0-9]/;

if (form) {
    const errorSpan = document.getElementsByClassName("error");
    errorSpan[0].style.color = 'red';
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        var name = formData.get("name");
        var city = formData.get("city");
        var mobile = formData.get("mobile") ? formData.get("mobile") : '';
        var username = formData.get("username");
        var password = formData.get("password");
        var confirm_password = formData.get("confirm_password");

        if (!name || !city || !username || !password || !confirm_password) {
            errorSpan[0].textContent = "(*) fields are required!";
            return;
        }

        if (!lettersAndDigitsOnly.test(username) ||
            !hasLetter.test(username) || !hasDigit.test(username) || username.length < 5) {
            errorSpan[0].textContent = "Username should contain atleast one digit and letter and 5 characters in length!";
            return;
        }

        if (password !== confirm_password) {
            errorSpan[0].textContent = "Password doesn't match!";
            return;
        }

        const data = {
            name: name,
            city: city,
            mobile: mobile,
            username: username,
            password: password
        };

        try {
            const res = await fetch("/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (!res.ok) {
                errorSpan[0].textContent = result.error;
            } else {
                errorSpan[0].style.color = 'green';
                errorSpan[0].textContent = "Signup successful! Login To Continue!";
                window.location.href = "/signin";
            }
        } catch (err) {
            errorSpan[0].textContent = "Something went wrong";
        }
    });
}

function hideErrorElement(node) {
    if (node.textContent.trim() !== "") {
        setTimeout(() => {
            node.style.transition = "opacity 0.5s";
            node.style.opacity = '0';
            setTimeout(() => {
                node.style.display = 'none';
            }, 500);
        }, 3000);
    }
}

document.querySelectorAll('.error').forEach(hideErrorElement);

const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        mutation.addedNodes.forEach(node => {
            if (node.classList && node.classList.contains('error')) {
                hideErrorElement(node);
            }
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true });

const successMsg = document.getElementById("successMessage");
if (successMsg) {
    setTimeout(() => {
    successMsg.style.transition = "opacity 0.5s ease";
    successMsg.style.opacity = "0";
    setTimeout(() => successMsg.remove(), 500); // remove from DOM
    }, 3000);
}
