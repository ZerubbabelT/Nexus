import { auth, googleProvider, onAuthStateChanged} from './firebaseConfig'

// Dom elements
const loginForm = document.querySelector(".loginForm");
const signupForm = document.querySelector(".signupForm");
const googleBtn = document.querySelectorAll(".google-btn")
const loadingScreen = document.getElementById("loading-screen");
const mainContent = document.getElementById("main-content");

// Add a short delay to display loading screen before auth check
setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split("/").pop();

        if (user) {
            // Authenticated user
            if (currentPage === "form.html") {
                window.location.href = "index.html";
            } else {
                loadingScreen.classList.add("fade-out"); // Add fade-out animation
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    mainContent.style.display = "block";
                }, 500); // Match with fade-out duration
            }
        } else {
            // Not authenticated
            if (currentPage === "index.html") {
                window.location.href = "form.html";
            } else {
                loadingScreen.classList.add("fade-out"); // Add fade-out animation
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    mainContent.style.display = "block";
                }, 500); // Match with fade-out duration
            }
        }
    });
}, 1000);