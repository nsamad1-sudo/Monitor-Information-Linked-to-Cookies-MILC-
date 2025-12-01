// Function to display current cookies
function displayCookies() {
    const cookieList = document.getElementById('cookieList');
    cookieList.innerHTML = '';    // Clear previous list

    const cookies = document.cookie.split(';');
    if (cookies[0] === "") { // No cookies present
        cookieList.innerHTML = '<li>No cookies found.</li>';
        return;
    }

    cookies.forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        const listItem = document.createElement('li');
        listItem.textContent = `${decodeURIComponent(name)}: ${decodeURIComponent(value || '')}`;
        cookieList.appendChild(listItem);
    });
}


// Function to add or modify a cookie
function addOrModifyCookie() {
    const name = document.getElementById('cookieName').value;
    const value = document.getElementById('cookieValue').value;
    const expiryDays = parseInt(document.getElementById('cookieExpiry').value);

    if (!name) {
        alert('Cookie name cannot be empty.');
        return;
    }

    const d = new Date();
    d.setTime(d.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/`;
    
    alert('Cookie set/modified successfully!');
    displayCookies(); // Update the displayed list
}


// Function to delete a cookie
function deleteCookie() {
    const name = document.getElementById('deleteCookieName').value;

    if (!name) {
        alert('Cookie name to delete cannot be empty.');
        return;
    }

    // Set expiry to a past date to delete the cookie
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    alert('Cookie deleted successfully!');
    displayCookies(); // Update the displayed list
}


// Initial display of cookies when the page loads
window.onload = displayCookies;

