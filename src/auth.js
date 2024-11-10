import { auth,
    googleProvider,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from './firebaseConfig'
import { showToast } from './toast';

// Dom elements
const loginForm = document.querySelector(".loginForm");
const signupForm = document.querySelector(".signupForm");
const googleBtn = document.querySelectorAll(".google-btn")
const loadingScreen = document.getElementById("loading-screen");
const mainContent = document.getElementById("main-content");
const logoutBtn = document.querySelector(".logout");

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

// login
if (loginForm){
    loginForm.addEventListener("submit", async(e) => {
        e.preventDefault()
        // validating input
        let email = loginForm.email.value
        let password = loginForm.password.value

        try {
            const userCred = await signInWithEmailAndPassword(auth,email,password)
            loginForm.reset()
            const user = userCred.user
            window.location.href = "index.html";
            showToast(`Welcome, ${user.displayName}`,"success")
        }
        catch (error) {
            // Handle specific error codes
            if (error.code === 'auth/wrong-password') {
                showToast("Incorrect password. Please try again.", "error");
            } else if (error.code === 'auth/user-not-found') {
                showToast("No account found with this email.", "error");
            } else if (error.code === 'auth/invalid-credential') {
                showToast("Invalid credentials. Please check your email and password format.", "error");
            } else {
                showToast(`Error: ${error.message}`, "error");
            }
        }
    })
        
}

// google sign in
googleBtn.forEach(button => {
    button.addEventListener("click", () => {
        signInWithPopup(auth,googleProvider)
        .then((result) => {
            const user = result.user
            // after loging in show them the main page
            window.location.href = "index.html";
            showToast(`Welcome, ${user.displayName}`,"success")
        }).catch((err) =>  showToast(err.message,"error"))
    })
});

// sign out
if (logoutBtn){
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            // after loging out show the form page
            showToast("You have Signed out succefully","success")
            window.location.href = "form.html";
        })
    })
}