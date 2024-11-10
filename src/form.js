const forms = document.querySelector(".forms"),
  links = document.querySelectorAll(".link");

// Select all password fields and eye icons
const passwordFields = document.querySelectorAll(".field input[type='password']");
const eyeIcons = document.querySelectorAll(".eye-icon");

// Loop through each eye icon and attach event listeners
eyeIcons.forEach((eyeIcon, index) => {
  eyeIcon.addEventListener("click", () => {
    // Get the corresponding password field
    const passwordField = passwordFields[index];

    // Toggle the password visibility
    if (passwordField.type === "password") {
      passwordField.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
    } else {
      passwordField.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
    }
  });
});

// Add click event listener to each link to toggle between forms
links.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault(); // Prevent default link behavior
    forms.classList.toggle("show-signup");
  });
});
