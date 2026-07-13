console.log("JS collegato!");

const cursorText = document.getElementById("cursor-text");

document.addEventListener("mousemove", (e) => {
  cursorText.style.top = e.clientY + "px";
  cursorText.style.left = e.clientX + "px";
});

document.addEventListener("click", () => {
  window.location.href = "me.html";
});