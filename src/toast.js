// show toast message
export function showToast(message, type = "error") {
    const toast = document.getElementById('toast');
    const progressBar = toast.querySelector('.progress-bar');
    const icon = toast.querySelector('.icon');
    const closeButton = toast.querySelector('.close-btn');

    // Set message and type (either 'success' or 'error')
    toast.querySelector('.message').textContent = message;
    if (type === "success") {
        toast.classList.add("success");
        toast.classList.remove("error");
        icon.textContent = "✔️"; // Success icon
    } else {
        toast.classList.add("error");
        toast.classList.remove("success");
        icon.textContent = "❗"; // Error icon
    }

    // Show the toast
    toast.classList.add('show');

    // Start the progress bar transition
    progressBar.style.width = '100%';

    // Automatically hide the toast after 3 seconds unless closed by user
    setTimeout(() => {
        if (toast.classList.contains('show')) {
            hideToast();
        }
    }, 3000);

    // Add click event listener to the close button
    closeButton.addEventListener('click', hideToast);
}



// hide toast message
export function hideToast() {
    const toast = document.getElementById('toast');
    const progressBar = toast.querySelector('.progress-bar');

    // Hide the toast
    toast.classList.remove('show');

    // Reset the progress bar for the next toast display
    progressBar.style.width = '0%';
}