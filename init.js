$(document).ready(function() {
  function openNav() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.querySelector(".openbtn").classList.add("hidden");
  }

  function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.querySelector(".openbtn").classList.remove("hidden");
  }

  function showASCIITown() {
    document.getElementById('asciiTown').style.display = 'block';
    document.getElementById('content').innerHTML = ''; // Clear other content if needed
  }

  // Function to make a heart float around randomly
  function floatHeart(heart) {
    heart.style.left = Math.random() * window.innerWidth + 'px';
    heart.style.top = Math.random() * window.innerHeight + 'px';
  }

  // Call floatHeart for each heart every 5 seconds and set initial positions
  const hearts = document.querySelectorAll('.heart');
  hearts.forEach((heart) => {
    floatHeart(heart); // Set initial position
    setInterval(() => floatHeart(heart), 5000); // Change position every 5 seconds
  });
});
