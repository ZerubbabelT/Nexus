import { db, ref, onValue, push } from './firebaseConfig';
import { storage, storageRef, uploadBytes, getDownloadURL, uploadBytesResumable } from './firebaseConfig';
import { showToast } from './toast';

// Fetch the user input
const fileInput = document.querySelector(".fileInput");
const messageInput = document.querySelector(".messageInput");
const messageForm = document.querySelector(".messageForm");

let currentUser; // Holds the current authenticated user
const newPosts = []; // Temporarily store new posts
let latestPostTimestamp = 0; // Tracks the most recent displayed post timestamp
let isFirstLoad = true; // Tracks if it's the user's first visit

// Event Listener for when the user is authenticated
window.addEventListener("userAuthenticated", (event) => {
    currentUser = event.detail;
    const userPostRef = ref(db, `posts/${currentUser.uid}`); // Store posts under user-specific path

    // Form submission handler
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let caption = messageInput.value.trim();
        let file = fileInput.files[0];
        if (file && caption) {
            const fileRef = storageRef(storage, `${currentUser.uid}/${file.name}`);
            const uploadTask = uploadBytesResumable(fileRef, file);

            // Progress indicator
            uploadTask.on('state_changed', (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                document.querySelector("em#progress").textContent = `${Math.floor(progress)}%`;
            });

            await uploadBytes(fileRef, file);
            const fileURL = await getDownloadURL(fileRef);

            // Save the post under the user's folder
            push(userPostRef, {
                uid: currentUser.uid,
                username: currentUser.displayName,
                caption: caption,
                fileURL: fileURL,
                fileType: file.type,
                photoURL: currentUser.photoURL, // Add profile picture URL
                createdAt: Date.now(),
            });

            messageForm.reset();
            document.querySelector("em#progress").textContent = '';
        } else {
            showToast("You need to add caption and image/video", 'error');
        }
    });

    // Real-time listener for posts
    const postsRef = ref(db, 'posts'); // Root 'posts' node
    onValue(postsRef, (snapshot) => {
        const postsData = snapshot.val();
        if (postsData) {
            const allPosts = [];
            Object.keys(postsData).forEach((userId) => {
                const userPosts = postsData[userId];
                Object.keys(userPosts).forEach((postId) => {
                    allPosts.push(userPosts[postId]);
                });
            });

            // Sort posts by createdAt (newest first)
            allPosts.sort((a, b) => a.createdAt - b.createdAt);

            // Handle first load
            if (isFirstLoad) {
                displayAllPosts(allPosts); // Display all posts on the first load
                latestPostTimestamp = Math.max(...allPosts.map(post => post.createdAt), 0); // Update the latest timestamp
                isFirstLoad = false; // Mark the first load as completed
            } else {
                // Separate posts by current user and others
                const recentPosts = allPosts.filter(post => post.createdAt > latestPostTimestamp);
                const userPosts = recentPosts.filter(post => post.uid === currentUser.uid);
                const otherPosts = recentPosts.filter(post => post.uid !== currentUser.uid);

                // Display current user's posts instantly
                if (userPosts.length > 0) {
                    userPosts.forEach(post => displayPost(post.username, post.caption, post.fileType, post.fileURL, post.photoURL));
                }

                // Notify about new posts from others
                if (otherPosts.length > 0) {
                    newPosts.push(...otherPosts); // Add to new posts list
                    latestPostTimestamp = Math.max(...recentPosts.map(post => post.createdAt)); // Update the latest timestamp
                    displayNotification(); // Show the notification button
                }
            }
        }
    });
});

// Display Notification Button
function displayNotification() {
    const notificationBtn = document.querySelector(".new-posts-notification");
    notificationBtn.style.display = 'block';

    // Ensure listener is only added once
    if (!notificationBtn.dataset.listenerAttached) {
        notificationBtn.addEventListener('click', () => {
            notificationBtn.style.display = "none";
            appendNewPosts(); // Add new posts to the feed
        });
        notificationBtn.dataset.listenerAttached = true;
    }
}

// Append New Posts to Feed
function appendNewPosts() {
    // Add new posts to the top of the feed
    newPosts.forEach(post => {
        displayPost(post.username, post.caption, post.fileType, post.fileURL, post.photoURL);
    });

    newPosts.length = 0; // Clear the new posts list
}

// Display All Posts in Feed
function displayAllPosts(posts) {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = ''; // Clear existing posts
    posts.forEach((postData) => {
        displayPost(postData.username, postData.caption, postData.fileType, postData.fileURL, postData.photoURL);
    });
}

// Display Single Post
function displayPost(name, caption, fileType, fileUrl, photoUrl) {
    const feedsContainer = document.querySelector('.feeds');

    // Create the feed element
    const feed = document.createElement('div');
    feed.className = 'feed';

    // Construct the feed's inner HTML
    feed.innerHTML = `
        <div class="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${photoUrl || '../src/css/images/defaultProfile.webp'}" alt="${name}'s profile picture">
                </div>
                <div class="info">
                    <h3>${name}</h3>
                    <small>Just now</small>
                </div>
            </div>
            <span class="edit">
                <i class="uil uil-ellipsis-h"></i>
            </span>
        </div>
        ${fileType.startsWith("image/") ? `
        <div class="photo">
            <img src="${fileUrl}" alt="Post image">
        </div>` : fileType.startsWith("video/") ? `
        <div class="photo">
            <video controls="true">
                <source src="${fileUrl}" type="video/mp4">
            </video>
        </div>` : ''}
        <div class="action-buttons">
            <div class="interaction-buttons">
                <span><i class="uil uil-heart"></i></span>
                <span><i class="uil uil-comment-dots"></i></span>
                <span><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span><i class="uil uil-bookmark-full"></i></span>
            </div>
        </div>
        <div class="caption">
            <p><b>${name}</b> ${caption}
            <span class="harsh-tag">#hashtag</span></p>
        </div>
        <div class="comments text-muted">
            View all comments
        </div>
    `;

    // Append the new feed to the feeds container
    feedsContainer.prepend(feed);
}
