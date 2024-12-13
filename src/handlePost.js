import { db, ref, onValue, push, update, get, remove, onChildRemoved } from './firebaseConfig';
import { storage, storageRef, uploadBytes, getDownloadURL, uploadBytesResumable } from './firebaseConfig';
import { showToast } from './toast';
import { handleLike, addComment, loadComments, time } from './commentLikes';

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
            const newPostRef = push(userPostRef);
            await update(newPostRef, {
                uid: currentUser.uid,
                username: currentUser.displayName,
                caption: caption,
                fileURL: fileURL,
                fileType: file.type,
                photoURL: currentUser.photoURL, // Add profile picture URL
                createdAt: Date.now(),
                likes: {}, // Initialize likes as an empty object
                comments : {}
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
                    allPosts.push({ ...userPosts[postId], postId, userId });
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
                    userPosts.forEach(post => displayPost(post.username, post.caption, post.fileType, post.fileURL, post.photoURL, post.postId, post.likes, post.uid, post.comments, post.createdAt));
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
        displayPost(post.username, post.caption, post.fileType, post.fileURL, post.photoURL, post.postId, post.likes, post.uid, post.comments, post.createdAt);
    });

    newPosts.length = 0; // Clear the new posts list
}

// Display All Posts in Feed
function displayAllPosts(posts) {
    const feedsContainer = document.querySelector('.feeds');
    feedsContainer.innerHTML = ''; // Clear existing posts
    posts.forEach((postData) => {
        displayPost(postData.username, postData.caption, postData.fileType, postData.fileURL, postData.photoURL, postData.postId, postData.likes, postData.uid, postData.comments, postData.createdAt);
    });
}

// Display Single Post
function displayPost(name, caption, fileType, fileUrl, photoUrl, postId, likes, userId, comments, timestamp) {
    const feedsContainer = document.querySelector('.feeds');
    // like count
    const likeCount = likes ? Object.keys(likes).length : '';
    const userLiked = likes && currentUser.uid in likes;
    // comment count
    const commentCount = comments ? Object.keys(comments).length : '';
    const userCommented = comments && currentUser.uid in comments; 

    // Create the feed element
    const feed = document.createElement('div');
    feed.className = 'feed';
    feed.setAttribute('data-main-post-id', postId);

    // Construct the feed's inner HTML
    feed.innerHTML = `
        <div class="head" id="head">
            <div class="user">
                <div class="profile-photo">
                    <img src="${photoUrl || 'https://i.imgur.com/3JNYqje.jpeg'}" alt="${name}'s profile picture">
                </div>
                <div class="info">
                    <h3>${name}</h3>
                    <small>${time(timestamp)}</small>
                </div>
            </div>
            <span class="edit">
                <div class="containerd">
                    <div class="more" data-post-more-id="${postId}">
                        <button class="more-btn">
                            <span class="more-dot"></span>
                            <span class="more-dot"></span>
                            <span class="more-dot"></span>
                        </button>
                        <div class="more-menu hiddenD">
                            <div class="more-menu-caret">
                                <div class="more-menu-caret-outer"></div>
                                <div class="more-menu-caret-inner"></div>
                            </div>
                            <ul class="more-menu-items" tabindex="-1" role="menu" aria-labelledby="more-btn">
                            <li class="more-menu-item" data-post-del-id="${postId}"  role="presentation">
                            ${  currentUser.uid === userId 
                                ? `<button type="button" class="more-menu-btn" role="menuitem" id="deleteBtn">Delete</button>
                            ` : ''}
                            </li>
                                <li class="more-menu-item" role="presentation">
                                    <button type="button" class="more-menu-btn" role="menuitem" id="blockBtn">Block</button>
                                </li>
                                <li class="more-menu-item" role="presentation">
                                    <button type="button" class="more-menu-btn" role="menuitem" id="reportBtn">Report</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
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
                <span>
                    <i class="like ${userLiked ? 'fa-solid fa-heart' : 'uil uil-heart'}" 
                        style="${userLiked ? 'color: #ff0000;' : ''}"
                        data-post-id="${postId}"
                        data-user-id="${userId}"    
                    ></i>
                </span>
                <span class="like-count" data-post-id="${postId}">${likeCount}</span>

                <span class="comments-toggle" data-post-id="${postId}" data-user-id="${userId}">
                    <i class="uil uil-comment-dots"></i>
                </span>
                <span class="comment-count" data-post-id="${postId}">${commentCount}</span>

                <span><i class="uil uil-share-alt"></i></span>
            </div>
            <div class="bookmark">
                <span class="share" data-post-id="${postId}" data-user-id="${userId}">
                    <i class="uil uil-bookmark-full"></i>
                </span>
            </div>
        </div>
        <div class="caption">
            <p><b>${name}</b> ${caption}
            <span class="harsh-tag">#hashtag</span></p>
            <br/>
        </div>

        <div class="comments-section" data-post-id="${postId}" style="display: none;">
            <div class="add-comment">
                <input maxlength="250" type="text" class="comment-input" placeholder="Add a comment..." data-post-id="${postId}">
                <button class="submit-comment" data-post-id="${postId}">Add</button>
            </div>
            <br/>
            <div class="comments-list">
                
            </div>
        </div>
    `;

    // Append the new feed to the feeds container
    feedsContainer.prepend(feed);
    
    // Add event listener to like button
    const likeButton = feed.querySelector(`.like[data-post-id="${postId}"]`);
    likeButton.addEventListener('click', () => {
        handleLike(postId, userId);
    });
    // toggling button
    const commentsToggle = feed.querySelector(`.comments-toggle[data-post-id="${postId}"]`);
    const commentsSection = feed.querySelector(`.comments-section[data-post-id="${postId}"]`);
    commentsToggle.addEventListener('click', () => {
        const isVisible = commentsSection.style.display === "block";
        commentsSection.style.display = isVisible ? 'none' : 'block';
        if (!isVisible){
            loadComments(postId, userId, commentsSection.querySelector(".comments-list"));
        }
    })
    // adding comments
    const commentInput = feed.querySelector(`.comment-input[data-post-id="${postId}"]`);
    const submitCommentButton = feed.querySelector(`.submit-comment[data-post-id="${postId}"]`);
    submitCommentButton.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText){
            addComment(postId, userId, commentText);
            commentInput.value = '';
        }
    })
    // More button functionality
    var el = document.querySelector(`.more[data-post-more-id="${postId}"]`);
    var btn = el.querySelector('.more-btn');
    var menu = el.querySelector('.more-menu');
    var visible = false;

    function showMenu(e) {
        e.preventDefault();
        if (!visible) {
            visible = true;
            menu.classList.remove('hiddenD'); // Show menu
            document.addEventListener('mousedown', hideMenu, false);
        }
    }

    function hideMenu(e) {
        if (btn.contains(e.target)) {
            return; // Ignore clicks on the button
        }
        if (menu.contains(e.target)) {
            return; // Ignore clicks inside the menu
        }
        if (visible) {
            visible = false;
            menu.classList.add('hiddenD'); // Hide menu
            document.removeEventListener('mousedown', hideMenu);
        }
    }
    btn.addEventListener('click', showMenu);
 
    const delBtn = document.querySelector(`[data-post-del-id="${postId}"]`);
    delBtn.addEventListener('click', () => {
        deletePost(userId,postId)
    })
    // Real-time listener to update UI when a post is removed
    function listenForPostChanges(userId) {
        const postsRef = ref(db, `posts/${userId}`);

        // Listen for post changes (including post deletions)
        onChildRemoved(postsRef, (snapshot) => {
            const removedPostId = snapshot.key;
            const removedPostElement = document.querySelector(`.feed[data-main-post-id="${removedPostId}"]`);
            if (removedPostElement) {
                removedPostElement.remove(); // Remove post element from the feed
            }
        });
    }
    listenForPostChanges(userId);
    // Selecting necessary elements
    const feeds = document.querySelector(".feeds");
    const backBtn = document.querySelector(".backBtn");
    const stories = document.querySelector(".stories");
    const messageForm = document.querySelector(".messageForm");
    const profileHeader = document.querySelector(".ph");
    const profileHeaderImage = document.getElementById("profileHeaderImage");
    const profileHeaderName = document.getElementById("profileHeaderName");
    const profileHeaderBio = document.getElementById("profileHeaderBio");

    // Add event listener for each post head
    document.querySelectorAll(".feed .user").forEach((head) => {
        head.addEventListener("click", () => {
            // Get user info from the clicked post
            const userName = head.querySelector("h3").textContent.trim();
            const profileImage = head.querySelector(".profile-photo img").src;

            // Hide stories and post form
            stories.style.display = "none";
            messageForm.style.display = "none";

            // Show "Back to Home" button
            backBtn.style.display = "block";

            // Show profile header and populate data
            profileHeader.style.display = "block";
            profileHeaderName.textContent = userName;
            profileHeaderImage.src = profileImage;

            // Example bio (replace with real data if available)
            profileHeaderBio.textContent = `Welcome to ${userName}'s profile!`;

            // Filter posts
            const allFeeds = feeds.querySelectorAll(".feed");
            allFeeds.forEach((feed) => {
                const feedUserName = feed.querySelector(".head h3").textContent.trim();
                if (feedUserName !== userName) {
                    feed.style.display = "none";
                } else {
                    feed.style.display = "block";
                }
            });
        });
    });

    // Add event listener for "Back to Home" button
    backBtn.addEventListener("click", () => {
        // Show stories and post form
        stories.style.display = "flex";
        messageForm.style.display = "flex";

        // Hide "Back to Home" button
        backBtn.style.display = "none";

        // Hide profile header
        profileHeader.style.display = "none";

        // Show all posts
        const allFeeds = feeds.querySelectorAll(".feed");
        allFeeds.forEach((feed) => {
            feed.style.display = "block";
        });
    });


}

// deleting posts
async function deletePost(userId, postId){
    const postRef = ref(db, `posts/${userId}/${postId}`);
    await remove(postRef);
    const postElement = document.querySelector(`.feed[data-main-post-id="${postId}"]`); 
    if (postElement) {
        postElement.remove();
    }
    showToast("Post removed successfully",'success')
}

