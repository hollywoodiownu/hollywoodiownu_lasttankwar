document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('startButton');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // Game variables
  let gameActive = false;
  let level = 1;
 let score = 0;
let levelStartTime;
const levelDuration = 30000; // 30 seconds in milliseconds
  let nextLevelTime = Date.now() + levelDuration;
  let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    color: 'green',
    moveLeft: false,
    moveRight: false,
    canShoot: true,
    bulletCooldown: 500 // milliseconds
  };
  let aliens = [];
  let bullets = [];
  let lastBulletTime = Date.now();

let alienSpawnRate = 5000; // Spawn an alien every 5000 milliseconds (5 seconds)

window.onload = function() {
  drawStartOverlay(); // Draw the start overlay image
  startButton.style.display = 'block'; // Show the start button
};


function addAliens() {
  // Calculate the number of aliens to add based on the level
  let baseAliens = 5; // Start with 5 aliens
  let additionalAliensPerLevel = 1; // Increase by 1 alien per level
  let maxAliensAtLevelTen = 15; // Maximum of 15 aliens at level 10
  let numberOfAliens = baseAliens + Math.min(level - 1, 10) * additionalAliensPerLevel;

  // If the level is greater than 10, keep the number of aliens constant
  if (level > 10) {
    numberOfAliens = maxAliensAtLevelTen;
  }

  for (let i = 0; i < numberOfAliens; i++) {
    aliens.push({
      x: Math.random() * (canvas.width - 40),
      y: -50 - Math.random() * canvas.height,
      width: 40,
      height: 40,
      color: 'red',
      speed: 0.5 + Math.random() * (0.5 + level * 0.05), // Increase speed slightly with each level
      delay: Math.random() * 10000 // Up to 10 seconds delay
    });
  }
}


function spawnAlien() {
  // Calculate the time left in the level
  let timeLeftInLevel = nextLevelTime - Date.now();

  // Calculate the number of aliens that should be present based on the level and time left
  let maxAliensForLevel = 5 + (level - 1) * 2; // For example, 5 on level 1, 7 on level 2, etc.
  let aliensToSpawn = maxAliensForLevel - aliens.length; // Number of aliens left to spawn

  // Calculate the interval at which to spawn the remaining aliens
  let spawnInterval = timeLeftInLevel / aliensToSpawn;

  // If it's time to spawn another alien and we haven't reached the max for this level
  if (Date.now() - levelStartTime >= spawnInterval && aliens.length < maxAliensForLevel) {
    aliens.push({
      x: Math.random() * (canvas.width - 40),
      y: -50 - Math.random() * canvas.height,
      width: 40,
      height: 40,
      color: 'red',
      speed: 0.5 + Math.random() * (0.5 + level * 0.1), // Increase speed slightly with each level
      delay: 0 // No delay since we're controlling spawn rate
    });
  }
}


// Call this function at intervals within your update loop
function update() {
  // ...existing update code...

  if (Math.random() < 0.1) { // 10% chance to spawn an alien each frame
    spawnAlien();
  }

  // ...existing update code...
}



  // Initialize the game
  function init() {
    gameActive = true;
   level = 1;
  score = 0;
  levelStartTime = Date.now();
  gameActive = true;
  nextLevelTime = levelStartTime + levelDuration;
    player.x = canvas.width / 2 - 25;
    player.y = canvas.height - 60;
    aliens = [];
    bullets = [];
    addAliens(); // Add initial aliens for level 1
    startButton.style.display = 'none'; // Hide start button
    requestAnimationFrame(update);
  }





// Modify your `nextLevel` function to increase the level
function nextLevel() {
  level++;
  levelStartTime = Date.now();
  nextLevelTime = levelStartTime + levelDuration;
  // ...rest of your nextLevel code...
}

// Move the player left or right based on the input
function movePlayer() {
  if (player.moveLeft && player.x > 0) {
    player.x -= 5;
  }
  if (player.moveRight && player.x < canvas.width - player.width) {
    player.x += 5;
  }
}

function moveAliens() {
  const currentTime = Date.now();
  aliens.forEach((alien) => {
    if (currentTime >= levelStartTime + alien.delay) {
      alien.y += alien.speed; // Use the alien's speed for movement

      if (alien.y > canvas.height) {
        alien.x = Math.floor(Math.random() * (canvas.width - alien.width));
        alien.y = -alien.height;
        alien.delay = Math.random() * 10000; // reset delay for next drop
        alien.speed = 1 + Math.random(); // reset speed for next drop
      }
    }
  });
}




// Shooting bullets
function shootBullet() {
  if (!player.canShoot) return;
  let now = Date.now();
  if (now - lastBulletTime > player.bulletCooldown) {
    let bullet = {
      x: player.x + player.width / 2 - 5,
      y: player.y,
      width: 10,
      height: 20,
      color: 'yellow'
    };
    bullets.push(bullet);
    lastBulletTime = now;
  }
}
  // Bullet movement function
  function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].y -= 2;
      if (bullets[i].y < 0) {
        bullets.splice(i, 1);
        i--;
      }
    }
  }

// At the top of your script, declare the variable
let animationFrameId;



// Update the `checkBulletAlienCollisions` function to increase the score
function checkBulletAlienCollisions() {
  for (let i = 0; i < bullets.length; i++) {
    for (let j = 0; j < aliens.length; j++) {
      if (bullets[i].x < aliens[j].x + aliens[j].width &&
          bullets[i].x + bullets[i].width > aliens[j].x &&
          bullets[i].y < aliens[j].y + aliens[j].height &&
          bullets[i].y + bullets[i].height > aliens[j].y) {
        aliens.splice(j, 1);
        bullets.splice(i, 1);
        score += 10; // Increase score by 10 for each alien killed
        i--; // Adjust the index since we removed a bullet
        break;
      }
    }
  }
}

function gameOver() {
  gameActive = false; // Stop the game from running further updates
  let blinkTimes = 3; // We need more blinks because we're fading in and out
  let opacityDelta = 1 / blinkTimes; // This will determine how much to fade each time
  let currentOpacity = 0; // Start fully transparent
  let increasing = true; // This flag determines whether we're increasing or decreasing opacity

  let blinkInterval = setInterval(function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update the current opacity based on the direction of the fade
    if (increasing) {
      currentOpacity += opacityDelta;
      if (currentOpacity >= 1) { // We've fully faded in, start fading out
        increasing = false;
      }
    } else {
      currentOpacity -= opacityDelta;
      if (currentOpacity <= 0) { // We've fully faded out
        increasing = true;
        blinkTimes--; // Decrease the number of blinks remaining
      }
    }

    // Set the global alpha for the fade effect
    ctx.globalAlpha = currentOpacity;

    // Draw the "GAME OVER" text
    ctx.fillStyle = "red";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);

    // Reset the global alpha
    ctx.globalAlpha = 1.0;
     drawOverlay(); // Draw the overlay image when the game is over

    // If we've blinked the desired number of times, clear the interval
    if (blinkTimes <= 0) {
      clearInterval(blinkInterval);
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas one last time
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOverlay(); // Draw the overlay image
  drawStartOverlay(); // Draw the start overlay image
      startButton.style.display = 'block'; // Show the start button again
    }
  }, 5000 / 60); // Run this interval at 60fps for a smoother fade effect
}

// Make sure to call drawStartOverlay when you are showing the start button
startButton.addEventListener('click', function() {
  startButton.style.display = 'none'; // Hide the button when the game starts
  resetGame(); // Call resetGame to restart the game
});


function resetGame() {
  // Reset game variables
  gameActive = true;
  level = 1;
  score = 0;
  levelStartTime = Date.now();
  nextLevelTime = levelStartTime + levelDuration;
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 60;
  aliens = [];
  bullets = [];
  addAliens(); // Add initial aliens for level 1

  // Clear the canvas and draw the overlay image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawOverlay(); // Draw the overlay image for the restart
  drawStartOverlay(); // Draw the start overlay image

  startButton.style.display = 'none'; // Hide the start button again
  requestAnimationFrame(update); // Start the game loop again
}

// Update game state
function update() {
  if (!gameActive) return;
  
  // ...existing update code...
  
  // Check for collisions with aliens
  checkPlayerCollisions();

  // ...existing update code...
}


function checkPlayerCollisions() {
  for (let i = 0; i < aliens.length; i++) {
    let alien = aliens[i];
    if (player.x < alien.x + alien.width &&
        player.x + player.width > alien.x &&
        player.y < alien.y + alien.height &&
        player.y + player.height > alien.y) {
      // Collision detected
      gameOver();
      break; // Exit the loop as the game is over
    }
  }
}




// Define image variables
let playerImage = new Image();
let enemyImage = new Image();// Define the bullet image variable
let bulletImage = new Image();


// Set the source of the images
playerImage.src = 'https://shorturl.at/noyQX'; // Replace with the path to your player image
enemyImage.src = 'https://shorturl.at/przCI'; // Replace with the path to your enemy image

// Set the source of the image
bulletImage.src = 'https://shorturl.at/iklG0'; // Replace with the path to your bullet image

// Make sure the images are loaded before starting the game
playerImage.onload = function() {
  enemyImage.onload = function() {
    // Images are loaded, you can start the game now
    startButton.addEventListener('click', init);
  };
};

// Make sure the bullet image is loaded before starting the game
// This can be added to the existing image loading checks for player and enemy
bulletImage.onload = function() {
  // Bullet image is loaded, you can start the game now
  // Ensure this is coordinated with the loading of other images
};


function drawPlayer() {
  ctx.save(); // Save the current state of the canvas
  ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

  // If the spacebar is pressed, draw the flame at the front
  if (spacePressed) {
    // Create a gradient for the flame
    var flameGradient = ctx.createLinearGradient(player.x + player.width / 2, player.y - 10, player.x + player.width / 2, player.y);
    flameGradient.addColorStop(0, 'red');
    flameGradient.addColorStop(0.5, 'orange');
    flameGradient.addColorStop(1, 'yellow');

    // Draw the flame as a small triangle with gradient
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width / 2 - 5, player.y - 10);
    ctx.lineTo(player.x + player.width / 2 + 5, player.y - 10);
    ctx.closePath();
    ctx.fillStyle = flameGradient;
    ctx.fill();
  }

  ctx.restore(); // Restore the state to prevent shadows on other elements
}



function drawAliens() {
  ctx.save(); // Save the current state of the canvas
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'; // Darker shadow color
  ctx.shadowBlur = 20; // How much the shadow will blur
  ctx.shadowOffsetX = 5; // Horizontal distance of the shadow
  ctx.shadowOffsetY = 5; // Vertical distance of the shadow
  aliens.forEach(alien => {
    ctx.drawImage(enemyImage, alien.x, alien.y, alien.width, alien.height);
  });
  ctx.restore(); // Restore the state to prevent shadows on other elements
}

// Bullet drawing function with shadow
function drawBullets() {
  ctx.save(); // Save the current state of the canvas
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)'; // Darker shadow color
  ctx.shadowBlur = 20; // How much the shadow will blur
  ctx.shadowOffsetX = 5; // Horizontal distance of the shadow
  ctx.shadowOffsetY = 5; // Vertical distance of the shadow
  for (const bullet of bullets) {
    ctx.drawImage(bulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
  }
  ctx.restore(); // Restore the state to prevent shadows on other elements
}


// Global variable to track if the spacebar is pressed
let spacePressed = false;

function keyDownHandler(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    player.moveRight = true;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    player.moveLeft = true;
  } else if (event.key === " " || event.key === "Spacebar") {
    event.preventDefault(); // Prevent the default action to stop scrolling the page
    spacePressed = true; // Set the spacePressed flag to true
    shootBullet();
  }
}

function keyUpHandler(event) {
  if (event.key === "Right" || event.key === "ArrowRight") {
    player.moveRight = false;
  } else if (event.key === "Left" || event.key === "ArrowLeft") {
    player.moveLeft = false;
  } else if (event.key === " " || event.key === "Spacebar") {
    spacePressed = false; // Clear the spacePressed flag when the spacebar is released
  }
}
let startOverlayImage = new Image();
startOverlayImage.src = 'https://raw.githubusercontent.com/hollywoodiownu/hollywoodiownu_lasttankwar/main/image/lasttankwar_background.png';


function drawStartOverlay() {
  if (startOverlayImage.complete) {
    ctx.drawImage(startOverlayImage, 0, 0, canvas.width, canvas.height);
  } else {
    startOverlayImage.onload = function() {
      ctx.drawImage(startOverlayImage, 0, 0, canvas.width, canvas.height);
    };
  }
}




// Define the overlay image
let overlayImage = new Image();
overlayImage.src = 'https://raw.githubusercontent.com/hollywoodiownu/hollywoodiownu_lasttankwar/main/image/lasttankwar.png';


// Draw the overlay image function
function drawOverlay() {
  ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
}

// Ensure the overlay image is loaded before starting the game loop
overlayImage.onload = function() {
  drawOverlay(); // Draw the overlay image as soon as it's loaded
  requestAnimationFrame(update); // Now that the image is loaded, you can start the game loop
};

function update() {
  // Clear the canvas first
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the overlay image immediately after clearing the canvas
  drawOverlay();

  // Check if the game is active, if not, you can return early or draw additional game over screen elements
  if (!gameActive) {
    // Draw game over or start screen elements here if needed
    // ...
    return; // Exit the function early
  }

  // Rest of your game update logic
  let currentTime = Date.now();
  if (currentTime > nextLevelTime) {
    nextLevel();
  }

  movePlayer();
  moveAliens();
  moveBullets();
  checkBulletAlienCollisions();
  checkPlayerCollisions();
  spawnAlien(); // Spawn aliens at a controlled rate

  // Draw the game elements
  drawPlayer();
  drawAliens();
  drawBullets();
  displayLevelAndScore();
  displayTimer(); // Display the timer

  // Call the next frame update
  requestAnimationFrame(update);
}



function displayTimer() {
  let currentTime = Date.now();
  let timeLeft = (nextLevelTime - currentTime) / 1000; // Convert milliseconds to seconds
  timeLeft = Math.max(timeLeft, 0); // Ensure time left doesn't go below 0

  // Adjust the position to move the "Time:" display up
  let xPositionTime = canvas.width - 25; // Align with the "Level:" and "Score:" displays
  let yPositionTime = 40; // Move "Time:" up

  // Draw shadow for embossed effect
  ctx.fillStyle = "#000"; // Shadow color
  ctx.fillText("Time: " + timeLeft.toFixed(1), xPositionTime + 2, yPositionTime + 2); // Shadow offset

  ctx.fillStyle = "#FFF"; // Text color
  ctx.font = "bold 20px Arial"; // Make the font bold
  ctx.textAlign = "right"; // Align text to the right
  ctx.fillText("Time: " + timeLeft.toFixed(1), xPositionTime, yPositionTime); // Display one decimal place
}

function displayLevelAndScore() {
  // Adjust the x position to move the "Level:" and "Score:" displays to the right
  let xPosition = canvas.width - 30; // Move "Level:" and "Score:" to the right
  let yPositionLevel = 60; // Move "Level:" up
  let yPositionScore = 80; // Move "Score:" up

  // Draw shadow for embossed effect
  ctx.fillStyle = "#000"; // Shadow color
  ctx.fillText("Level: " + level, xPosition + 2, yPositionLevel + 2); // Shadow offset for "Level:"
  ctx.fillText("Score: " + score, xPosition + 2, yPositionScore + 2); // Shadow offset for "Score:"

  ctx.fillStyle = "#FFF"; // Text color
  ctx.font = "bold 20px Arial"; // Make the font bold
  ctx.textAlign = "right"; // Align text to the right
  ctx.fillText("Level: " + level, xPosition, yPositionLevel);
  ctx.fillText("Score: " + score, xPosition, yPositionScore);
}




// Initialize the game when the start button is clicked
startButton.addEventListener('click', init);

// Event listeners for keyboard input
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);

  // Function to move to the next level
  function nextLevel() {
    level++;
    nextLevelTime = Date.now() + levelDuration;
    addAliens();
  }
});





