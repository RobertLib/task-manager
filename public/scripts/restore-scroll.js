"use strict";

// Save scroll position when navigating
document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    sessionStorage.setItem(
      "scrollPosition",
      window.scrollY || document.documentElement.scrollTop
    );
  });
});

// Restore scroll position
window.onload = () => {
  if (sessionStorage.getItem("scrollPosition")) {
    window.scrollTo(0, sessionStorage.getItem("scrollPosition"));
    sessionStorage.removeItem("scrollPosition");
  }
};
