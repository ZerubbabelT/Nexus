import { auth,
    googleProvider,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from './firebaseConfig'
import { showToast } from './toast';

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


// Sign up users
if (signupForm){
    signupForm.addEventListener('submit', async(e) => {
        e.preventDefault()
        // Validating input
        let name = signupForm.displayName.value.trim()
        let email = signupForm.email.value
        let password = signupForm.password.value
        let passwordCheck = signupForm.passwordCheck.value
        if (name.length < 2){
            showToast("Name too short","error")
        }
        else if (email.length < 2){
            showToast("Email too short","error")
        }
        else if (password.length < 8){
            showToast("Password must atleast contain 8 characters","error")
        }
        else if (password !== passwordCheck){
            showToast("password Doesn\'t match","error")            
        }
        else {
            // Create account
            try {
                const userCred = await createUserWithEmailAndPassword(auth, email, password)
                const user = userCred.user

                await updateProfile(user,{
                    displayName : name
                })
                showToast(`${name}, You have now created an account successfully!!`,"success")    
                signupForm.reset()
                
            }
            catch(error) {
                showToast(`Error creating account: ${error.message}`,"error")
            }
            
        }
    })
}
