// Highlight active nav link
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("nav ul li a");
    const currentPath = window.location.pathname.split("/").pop();
  
    navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  
    // Scroll to top on page load
    window.scrollTo(0, 0);
  });
  