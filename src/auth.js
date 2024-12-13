import { auth,db,
    googleProvider,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    storageRef,ref,get,update,
    storage,
    uploadBytes,
    getDownloadURL
} from './firebaseConfig'
import { showToast } from './toast';

// Dom elements
const loginForm = document.querySelector(".loginForm");
const signupForm = document.querySelector(".signupForm");
const googleBtn = document.querySelectorAll(".google-btn")
const loadingScreen = document.getElementById("loading-screen");
const mainContent = document.getElementById("main-content");
const logoutBtn = document.querySelector("#logoutButton");

const profileFileInput = document.getElementById("profileFile"); //file input for pp
const updateProfileButton = document.getElementById("updateProfileButton"); // update button
const profilePictureDropdown = document.getElementById("profilePictureDropdown"); // pp on dropdown
const profilePictureMain = document.getElementById("mainProfileImage"); // nav pp
const profilePicture = document.getElementById("profilePicture"); // form pp
const sideBarProfilePicture = document.getElementById("sidebarProfilePicture"); // left side pp
const defaultProfilePicture = 'https://i.imgur.com/3JNYqje.jpeg';

// Add a short delay to display loading screen before auth check
// Add a short delay to display loading screen before auth check
setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
        const currentPage = window.location.pathname.split("/").pop();

        // Check if the user is at the root domain (/)
        if (window.location.pathname === "/") {
            if (user) {
                // If authenticated, redirect to index.html
                window.location.href = "index.html";
            } else {
                // If not authenticated, redirect to form.html (login page)
                window.location.href = "form.html";
            }
        }

        if (user) {
            // Authenticated user
            const userAuthenticatedEvent = new CustomEvent('userAuthenticated', {
                detail: user,
            });
            window.dispatchEvent(userAuthenticatedEvent);

            if (currentPage === "form.html") {
                window.location.href = "index.html";
            } else if(currentPage === "index.html") {
                const name = document.querySelector(".left .handle h4");
                const profileName = document.getElementById("profileName");

                if (name) {
                    name.textContent = user.displayName;
                    profileName.textContent = `Hi, ${user.displayName}`;
                    // Display profile picture if available 
                    if (user.photoURL) { 
                        profilePictureMain.src = user.photoURL; 
                        profilePictureDropdown.src = user.photoURL;
                        sideBarProfilePicture.src = user.photoURL;
                        profilePicture.src = user.photoURL;
                    } else { 
                        profilePictureMain.src = defaultProfilePicture; // Fallback if no profile picture 
                        profilePictureDropdown.src = defaultProfilePicture;
                        sideBarProfilePicture.src = defaultProfilePicture;
                        profilePicture.src = defaultProfilePicture;
                    }
                }
                loadingScreen.classList.add("fade-out");
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
                loadingScreen.classList.add("fade-out");
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    mainContent.style.display = "block";
                }, 500);
            }
        }
    });
}, 1000);

if (updateProfileButton){
    updateProfileButton.addEventListener('click', () => {
        profileFileInput.click()
    })
}
if (profileFileInput){
    profileFileInput.addEventListener('change', async(e) => {
        const file = e.target.files[0]
        if (file){
            const user = auth.currentUser;
            const storageReference = storageRef(storage,`profilePicture/${user.uid}`)
            await uploadBytes(storageReference,file)
            const profileImageUrl = await getDownloadURL(storageReference)
            
            await updateProfile(user, {
                photoURL: profileImageUrl,
            })
            profilePictureDropdown.src = profileImageUrl;
            profilePictureMain.src = profileImageUrl;
            profilePicture.src = profileImageUrl;
            sideBarProfilePicture.src = profileImageUrl;
            updateOldPostsProfilePicture(user.uid, profileImageUrl);
            showToast("Profile picture updated successfully!", "success");
        }
    })
}
async function updateOldPostsProfilePicture(uid, newPhotoURL) {
    try { 
        const postsRef = ref(db, `posts/${uid}`); 
        const snapshot = await get(postsRef); 
        if (snapshot.exists()) { 
            const userPosts = snapshot.val();
            for (let postId in userPosts) { 
                const postRef = ref(db, `posts/${uid}/${postId}`);
                const commentRef = ref(db, `posts/${uid}/${postId}/comments`)
                update(postRef,{photoURL : newPhotoURL})
                update(commentRef, {photoURL : newPhotoURL}) 
            }
        }
    }
    catch (error) { 
        console.error("Error updating old posts profile pictures:", error); 
    } 
}
// Sign up users
if (signupForm){
    signupForm.addEventListener('submit', async(e) => {
        e.preventDefault()
        // Validating input
        let name = signupForm.displayName.value.trim();
        let email = signupForm.email.value.trim();
        let password = signupForm.password.value;
        let passwordCheck = signupForm.passwordCheck.value;
        if (!name || name.trim().length < 2) {
            showToast("Name is required and should be at least 2 characters long", "error");
            return;
        }
        else if (email.length < 2){
            showToast("Email too short","error")
        }
        else if (password.length < 8){
            showToast("Password must contain at least 8 characters","error")
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
                    displayName : name,
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