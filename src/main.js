document.addEventListener('DOMContentLoaded', () => {
    // Sidebar
    const menuItems = document.querySelectorAll('.menu-item');

    // Messages 
    const messageNotification = document.querySelector('#messages-notifications');
    const messages = document.querySelector('.messages');
    const message = messages ? messages.querySelectorAll('.message') : [];
    const messageSearch = document.querySelector('#message-search');

    //Theme
    const theme = document.querySelector('#theme');
    const themeModal = document.querySelector('.customize-theme');
    const fontSize = document.querySelectorAll('.choose-size span');
    var root = document.querySelector(':root');
    const colorPalette = document.querySelectorAll('.choose-color span');
    const Bg1 = document.querySelector('.bg-1');
    const Bg2 = document.querySelector('.bg-2');
    const Bg3 = document.querySelector('.bg-3');

    // ============== SIDEBAR ============== 

    // Remove active class from all menu items
    const changeActiveItem = () => {
        menuItems.forEach(item => {
            item.classList.remove('active');
        })
    }

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            changeActiveItem();
            item.classList.add('active');
            if(item.id != 'notifications') {
                document.querySelector('.notifications-popup').
                style.display = 'none';
            } else {
                document.querySelector('.notifications-popup').
                style.display = 'block';
                document.querySelector('#notifications .notification-count').
                style.display = 'none';
            }
        })
    })

    // ============== MESSAGES ============== 

    //Searches messages
    const searchMessage = () => {
        const val = messageSearch.value.toLowerCase();
        message.forEach(user => {
            let name = user.querySelector('h5').textContent.toLowerCase();
            if(name.indexOf(val) != -1) {
                user.style.display = 'flex'; 
            } else {
                user.style.display = 'none';
            }
        })
    }

    //Search for messages
    if (messageSearch) {
        messageSearch.addEventListener('keyup', searchMessage);
    }

    //Highlight messages card when messages menu item is clicked
    if (messageNotification) {
        messageNotification.addEventListener('click', () => {
            messages.style.boxShadow = '0 0 1rem var(--color-primary)';
            messageNotification.querySelector('.notification-count').style.display = 'none';
            setTimeout(() => {
                messages.style.boxShadow = 'none';
            }, 2000);
        });
    }

    // ============== THEME / DISPLAY CUSTOMIZATION ============== 

    // Opens Modal
    const openThemeModal = () => {
        themeModal.style.display = 'grid';
    }

    // Closes Modal
    const closeThemeModal = (e) => {
        if(e.target.classList.contains('customize-theme')) {
            themeModal.style.display = 'none';
        }
    }

    if (themeModal) {
        themeModal.addEventListener('click', closeThemeModal);
    }

    if (theme) {
        theme.addEventListener('click', openThemeModal);
    }

    // ============== FONT SIZE ============== 

    // remove active class from spans or font size selectors
    const removeSizeSelectors = () => {
        fontSize.forEach(size => {
            size.classList.remove('active');
        })
    }

    fontSize.forEach(size => { 
       size.addEventListener('click', () => {
            removeSizeSelectors();
            let fontSize;
            size.classList.toggle('active');

            if(size.classList.contains('font-size-1')) { 
                fontSize = '10px';
                root.style.setProperty('----sticky-top-left', '5.4rem');
                root.style.setProperty('----sticky-top-right', '5.4rem');
            } else if(size.classList.contains('font-size-2')) { 
                fontSize = '13px';
                root.style.setProperty('----sticky-top-left', '5.4rem');
                root.style.setProperty('----sticky-top-right', '-7rem');
            } else if(size.classList.contains('font-size-3')) {
                fontSize = '16px';
                root.style.setProperty('----sticky-top-left', '-2rem');
                root.style.setProperty('----sticky-top-right', '-17rem');
            } else if(size.classList.contains('font-size-4')) {
                fontSize = '19px';
                root.style.setProperty('----sticky-top-left', '-5rem');
                root.style.setProperty('----sticky-top-right', '-25rem');
            } else if(size.classList.contains('font-size-5')) {
                fontSize = '22px';
                root.style.setProperty('----sticky-top-left', '-12rem');
                root.style.setProperty('----sticky-top-right', '-35rem');
            }

            // change font size of the root html element
            document.querySelector('html').style.fontSize = fontSize;
       })
    })

    // Remove active class from colors
    const changeActiveColorClass = () => {
        colorPalette.forEach(colorPicker => {
            colorPicker.classList.remove('active');
        })
    }

    // Change color primary
    colorPalette.forEach(color => {
        color.addEventListener('click', () => {
            let primary;
            changeActiveColorClass(); 

            if(color.classList.contains('color-1')) {
                primaryHue = 252;
            } else if(color.classList.contains('color-2')) {
                primaryHue = 52;
            } else if(color.classList.contains('color-3')) {
                primaryHue = 352;
            } else if(color.classList.contains('color-4')) {
                primaryHue = 152;
            } else if(color.classList.contains('color-5')) {
                primaryHue = 202;
            }

            color.classList.add('active');
            root.style.setProperty('--primary-color-hue', primaryHue);
        })
    })

    //Theme Background Values
    let lightColorLightness;
    let whiteColorLightness;
    let darkColorLightness;

    // Changes background color
    const changeBG = () => {
        root.style.setProperty('--light-color-lightness', lightColorLightness);
        root.style.setProperty('--white-color-lightness', whiteColorLightness);
        root.style.setProperty('--dark-color-lightness', darkColorLightness);
    }

    if (Bg1) {
        Bg1.addEventListener('click', () => {
            // add active class
            Bg1.classList.add('active');
            // remove active class from the others
            Bg2.classList.remove('active');
            Bg3.classList.remove('active');
            //remove customized changes from local storage
            window.location.reload();
        });
    }

    if (Bg2) {
        Bg2.addEventListener('click', () => {
            darkColorLightness = '95%';
            whiteColorLightness = '20%';
            lightColorLightness = '15%';

            // add active class
            Bg2.classList.add('active');
            // remove active class from the others
            Bg1.classList.remove('active');
            Bg3.classList.remove('active');
            changeBG();
        });
    }

    if (Bg3) {
        Bg3.addEventListener('click', () => {
            darkColorLightness = '95%';
            whiteColorLightness = '10%';
            lightColorLightness = '0%';

            // add active class
            Bg3.classList.add('active');
            // remove active class from the others
            Bg1.classList.remove('active');
            Bg2.classList.remove('active');
            changeBG();
        });
    }
});
// Modal elements
const mediaModal = document.getElementById('media-modal');
const closeModalBtn = document.querySelector('#media-modal .close-btn');
const modalImage = mediaModal.querySelector('img');

// Add click event listener to posted images only
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.feed .photo')) {
        // Check if the clicked image is inside a post
        const fileUrl = e.target.src;

        // Show the modal
        mediaModal.classList.add('show');
        modalImage.src = fileUrl;
    }
    else if (e.target === mediaModal ){
        mediaModal.classList.remove('show');
        modalImage.src = '';
    }
});

// Close modal on button click
if (closeModalBtn){
    closeModalBtn.addEventListener('click', () => {
        mediaModal.classList.remove('show');
        modalImage.src = '';
    });    
}
// profile view dropdown
const profilePicture = document.querySelector(".mainProfilePicture");
const profileDropdown = document.getElementById("profileDropdown");
const closeDropdown = document.getElementById("closeDropdown");

// Toggle Dropdown on Profile Picture Click
if (profilePicture){
    profilePicture.addEventListener("click", () => {
        profileDropdown.classList.toggle("hidden");
    });    
}

// Close Dropdown on Close Button Click
if (closeDropdown){
    closeDropdown.addEventListener("click", () => {
        profileDropdown.classList.add("hidden");
    });
}
