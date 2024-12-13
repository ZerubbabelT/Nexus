import { db, ref, onValue, push, update, get, remove, onChildRemoved } from './firebaseConfig';
import { showToast } from './toast';

let currentUser;
window.addEventListener('userAuthenticated', (e) => {
    currentUser = e.detail;
})

// Handle Like/Unlike Functionality
async function handleLike(postId, userId) {
    const postRef = ref(db, `posts/${userId}/${postId}/likes/${currentUser.uid}`);
    const snapshot = await get(postRef);

    if (snapshot.exists()) {
        // User has liked the post, so unlike it
        await remove(postRef);
    } else {
        // User has not liked the post, so like it
        await update(ref(db, `posts/${userId}/${postId}/likes`), { [currentUser.uid]: true });
    }

    // Fetch the updated likes
    const updatedSnapshot = await get(ref(db, `posts/${userId}/${postId}/likes`));
    const likeButton = document.querySelector(`[data-post-id="${postId}"]`);
    const likeCountSpan = document.querySelector(`.like-count[data-post-id="${postId}"]`);
    const likeCount = updatedSnapshot.exists() ? Object.keys(updatedSnapshot.val()).length : 0;
    const userLiked = updatedSnapshot.exists() && updatedSnapshot.hasChild(currentUser.uid);

    // Update the UI
    if (userLiked) {
        likeButton.classList.remove('uil', 'uil-heart');
        likeButton.classList.add('fa-solid', 'fa-heart');
        likeButton.style.color = '#ff0000';
    } else {
        likeButton.classList.remove('fa-solid', 'fa-heart');
        likeButton.classList.add('uil', 'uil-heart');
        likeButton.style.color = '';
    }
    likeCountSpan.textContent = likeCount;
}

// Loading comments in descending order
async function loadComments(postId, userId, commentList) {
    const commentRef = ref(db, `posts/${userId}/${postId}/comments`);
    onValue(commentRef, (snapshot) => {
        const comments = snapshot.val();
        commentList.innerHTML = ''; // Clear previous comments

        if (comments) {
            // Convert comments to an array and sort by `createdAt` in descending order
            const sortedComments = Object.entries(comments)
                .map(([commentId, commentData]) => ({ id: commentId, ...commentData }))
                .sort((a, b) => b.createdAt - a.createdAt);
                // Create and append sorted comment elements
                sortedComments.forEach(comment => {
                const commentElement = document.createElement('div');
                const commentId = comment.id;
                commentElement.className = 'comment';
                commentElement.innerHTML = `
                <span><img class="pp" src='${comment.photoURL || 'https://i.imgur.com/3JNYqje.jpeg'} '/></span>
                <div class="toright">
                    <strong style="font-size=:2.5rem;">${comment.username}</strong>
                    ${
                        currentUser.uid === userId || currentUser.uid === comment.uid
                            ? `<span class="remove" data-comment-id="${commentId}" data-post-id="${postId}" data-user-id="${userId}">remove</span>`
                            : ''
                    }
                    <p>${comment.text}</p>
                </div>
                `;
                // removing comments
                commentList.appendChild(commentElement);
                commentList.addEventListener('click', async(event) => {
                    if (event.target.classList.contains('remove')){
                        const postId = event.target.dataset.postId;
                        const userId = event.target.dataset.userId;
                        const commentId = event.target.dataset.commentId;

                        const commentRef = ref(db, `posts/${userId}/${postId}/comments/${commentId}`)
                        await remove(commentRef)
                        showToast("comment successfully removed",'success')
                    }
                })
            });
        } else {
            commentList.innerHTML = '<p>No comments yet! Be the first to comment!</p>';
        }
    });
}

// adding comments
async function addComment(postId, userId, text){
    const commentRef = ref(db, `posts/${userId}/${postId}/comments/`);
    await push(commentRef, {
        uid: currentUser.uid,
        username: currentUser.displayName,
        photoURL: currentUser.photoURL,
        text: text,
        createdAt: Date.now()
    })
}

// timestamp
function time(createdAt) {
    const agoTime = Date.now() - createdAt;
    const minute = Math.floor(agoTime / 1000 / 60);
    const hour = Math.floor(minute / 60);
    const day = Math.floor(hour / 24);
    const week = Math.floor(day / 7);
    const month = Math.floor(day / 30); // More realistic average for a month
    const year = Math.floor(day / 365); // Approximation for a year

    if (minute < 1) return "Just now";
    else if (minute < 60) return `${minute} minute${minute > 1 ? "s" : ""} ago`;
    else if (hour < 24) return `${hour} hour${hour > 1 ? "s" : ""} ago`;
    else if (day < 7) return `${day} day${day > 1 ? "s" : ""} ago`;
    else if (day < 30) return `${week} week${week > 1 ? "s" : ""} ago`;
    else if (day < 365) return `${month} month${month > 1 ? "s" : ""} ago`;
    else return `${year} year${year > 1 ? "s" : ""} ago`;
}

export {handleLike, loadComments, addComment, time}