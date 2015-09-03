  var touchScreen = false;
 
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    touchScreen = true;
  }
  
    var enemyTank = function(index, game, player, bullets){
    
    //enemy's coord
    var x = 250 + Math.round(Math.random() * (650-250) + 1);
    var y = 42 + Math.random() * (380 - 42) + 1;
    
    this.game = game;
    this.health = 100;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;
    this.direction = 'down';
   
     // set picture
    this.tank = game.add.sprite(x, y, 'enemy');
    this.tank.anchor.set(0.5, 0.5);
    this.tank.name = index.toString();
    
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    
    this.tank.body.collideWorldBounds = true;
    
    this.tank.animations.add('right', [4,5],10,true);
    this.tank.animations.add('left', [2,3], 10, true);
    this.tank.animations.add('up', [6,7], 10, true);
    this.tank.animations.add('down', [0,1], 10, true);
};

enemyTank.prototype.damage = function(){
    
    //random damage
    this.health -= Phaser.Math.getRandom([25, 50, 100], 0, 3);
    
    if (this.health <= 0)
    {
        this.alive = false;
        this.tank.kill();
        
        return true;
    }
    
    return false;
};

enemyTank.prototype.update = function () {
    
    // choose random direction to move
    if (this.game.time.now > this.nextFire)
        this.direction = Phaser.Math.getRandom(['right', 'left', 'up', 'down'], 0, 4);
    
    //checking distance between enemies and player to begin shooting
    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 400)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            //reloading weapons
            this.nextFire = this.game.time.now + this.fireRate;
            
            var bullet = this.bullets.getFirstDead();
            
            //reset bullet image
            bullet.reset(this.tank.x, this.tank.y);
        
            //checking direction to move enemy and bullet
           if(this.direction == 'left' || this.direction == 'right')
            {
                bullet.body.velocity.x = checkDirection(this.direction, false);
                
                this.tank.animations.play(this.direction);
                this.tank.body.velocity.x = checkDirection(this.direction, true);
                this.tank.body.velocity.y = 0;
            }
            else
            {
                bullet.body.velocity.y = checkDirection(this.direction, false);
                
                this.tank.animations.play(this.direction);
                this.tank.body.velocity.y = checkDirection(this.direction, true);
                this.tank.body.velocity.x = 0;
            }
        }
    }
};

var game;

if (touchScreen){
    
    game = new Phaser.Game(600, 600, Phaser.AUTO, 'battle-city', 
            { preload: preload, create: create, update: update, render:render });
}

else{
        
    game = new Phaser.Game(800, 640, Phaser.AUTO, 'battle-city', 
            { preload: preload, create: create, update: update, render:render });
    }
    

function preload() {
    //load our pictures
    game.load.image('bullet', 'image/bullet.png');
    game.load.image('wall', 'image/wall1.png');
    game.load.image('background', 'image/forest_back.png');
    game.load.spritesheet('tank','image/tank_.png', 32, 32);
    game.load.spritesheet('boom','image/explosions.png', 32, 32);
    game.load.spritesheet('enemy', 'image/enemyTank.png', 32, 32);
    
    //buttons picture
    game.load.image('up', 'image/up.png');
    game.load.image('down', 'image/down.png');
    game.load.image('left', 'image/left.png');
    game.load.image('right', 'image/right.png');
    game.load.image('shoot', 'image/shoot.png');
 
}

var playerTank;
var walls;

var bullets;
var fireRate = 500;
var nextFire = 0;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;

var direction = 'down';
var cursors;
var spacebar;


var score = 0;

function create(){
    
    //enable Arcade physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    game.stage.backgroundColor = '#A2AB58';
    
    walls = game.add.group();
    walls.enableBody = true;
    
    //our top & bottom walls
    var ground = walls.create(0, game.world.height - 32, 'wall');
    
    //set scale to fit the width with game (the original sprite id 400x32 px)
    ground.scale.setTo(2,1);
    ground.body.immovable = true;
    ground = walls.create(0, 0, 'wall');
    ground.scale.setTo(2,1);
    ground.body.immovable = true;
    
    //==========================
    
    var ledge = walls.create(400,400,'wall');
    ledge.body.immovable = true;
    ledge = walls.create(-150,250,'wall');
    ledge.body.immovable = true;
    ledge = walls.create(700,80,'wall');
    ledge.body.immovable = true;
    
    //create our bullets with settings
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(150, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    
    //explosions
    explosions = game.add.group();
    for (var i = 0; i < 150; i++)
    {
       var explosionAnimation = explosions.create(0, 0, 'boom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('boom',[0,1,2,3,4,5], 15, false);
    }
    
    //player and its settings
    playerTank = game.add.sprite(64, 64, 'tank');
    game.physics.arcade.enable(playerTank);
   	playerTank.body.collideWorldBounds = true;
   	playerTank.body.health = 100;
	
    //player's moving animation
    playerTank.animations.add('left',[2,3],10,true);
    playerTank.animations.add('right',[4,5],10,true);
    playerTank.animations.add('up',[6,7],10,true);
    playerTank.animations.add('down',[0,1],10,true);
    
    //create enemy's bullets with settings
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(150, 'bullet');
    
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('checkWorldBounds', true);
    
    enemies = [];
    enemiesTotal = 3;
    enemiesAlive = 3;
    
    for (var i = 0; i < enemiesTotal; i++)
    {
        enemies.push(new enemyTank(i, game, playerTank, enemyBullets));
    }
    
    //add cursors key: UP, DOWN, LEFT, RIGHT, SPACEBAR  
    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    // if touchScreen enabled, create buttons
    if (touchScreen){  
        
        var buttonUp = game.add.button(32, game.world.height - 32, 'up', moveUp, this, 2, 1, 0); 
        var buttonDown = game.add.button(96, game.world.height - 32, 'down', moveDown, this, 2, 1, 0); 
        var buttonLeft = game.add.button(game.world.width - 128, game.world.height - 32, 'left', moveLeft, this, 2, 1, 0); 
        var buttonRight = game.add.button(game.world.width - 64, game.world.height - 32, 'right', moveRight, this, 2, 1, 0); 
        var buttonShoot = game.add.button(game.world.centerX, game.world.height - 32, 'shoot', fire, this, 2, 1, 0);
    }
}

function update() {
    
    //collide the player's tank with walls
    game.physics.arcade.collide(playerTank,walls);
   
    //check if the bullet overlaps with any of walls, if it calls killBullet function
    game.physics.arcade.overlap(bullets, walls, killBullet, null, this);
    game.physics.arcade.overlap(enemyBullets, walls, killBullet, null, this);
    
    //check if the bullet overlaps with player, if it calls bulletHitPlayer function
    game.physics.arcade.overlap(enemyBullets, playerTank, bulletHitPlayer, null, this);
    
    enemiesAlive = 0;
    
    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            
            //collide the player with enemies
            game.physics.arcade.collide(playerTank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, killEnemy, null, this);
            enemies[i].update();
        }
        //collide enemy tanks with walls
        game.physics.arcade.collide(enemies[i].tank, walls);
    }
    
    if (enemiesAlive == 0){
        //YOU ARE WINNER!
        Winner(true);
    }
    if (!touchScreen)
    {
        // reset the player's movement
        playerTank.body.velocity.x = 0;
        playerTank.body.velocity.y = 0;
    }
    // move tank with curors
    if (cursors.left.isDown)
    {
        //moving left 
         moveLeft();
    }
    else if (cursors.right.isDown)
    {
        // moving right
        moveRight();
    	
    }
    else if (cursors.up.isDown)
    {
        //moving up
        moveUp();
    	
    }
    else if (cursors.down.isDown)
    {
        //moving down
        moveDown();
    
    }else{
        playerTank.animations.stop();
    }
    
    if (spacebar.isDown)
        fire();
}

function render () {
    
    // show & update score-text and health-text
    game.debug.text('Score: ' + score, 32, 20);
    game.debug.text('Health: ' + playerTank.body.health, game.world.width - 180, 20);
    game.debug.text('Touch: ' + touchScreen, 200, 20);
}

//=================================
// user functions begin
//=================================

function moveUp(){
    
    playerTank.body.velocity.y = -120;
    playerTank.animations.play('up');
    direction = 'up';
    playerTank.body.velocity.x = 0;
}

function moveDown(){
    
    playerTank.body.velocity.y = 120;
    playerTank.animations.play('down');
    direction = 'down';
    playerTank.body.velocity.x = 0;
}

function moveLeft(){
    
    playerTank.body.velocity.x = -120;
    playerTank.animations.play('left');
    direction = 'left';
    playerTank.body.velocity.y = 0;
}

function moveRight(){
    
    playerTank.body.velocity.x = 120;
	playerTank.animations.play('right');
    direction = 'right';
    playerTank.body.velocity.y = 0;
}

function fire(){   
    if (game.time.now > nextFire)
    {
        nextFire = game.time.now + fireRate;
        
        this.bullet = bullets.getFirstDead();
        
        //choose the position 4 bullet images
        this.bullet.reset(playerTank.x + 11, playerTank.y + 11);
        
        //choose direction to move bullets
        if(direction == 'left' || direction == 'right')
        
            this.bullet.body.velocity.x = checkDirection(direction, false);
        else
            this.bullet.body.velocity.y = checkDirection(direction, false);
            
    }
}

function killBullet(bullet, walls){
    // delete bullet image from canvas
    bullet.kill();
    
    // make animation 'kaboom'
    this.explosion = explosions.getFirstExists(false);
    
    //reset animation
    this.explosion.reset(bullet.x + 5, bullet.y + 5);
    this.explosion.play('boom');
}

function killEnemy(tank, bullet){
    
    bullet.kill();
    
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(bullet.x + 5, bullet.y + 5);
    
    var destroyed = enemies[tank.name].damage();
    //console.log(destroyed);
    
    if (destroyed)
    {
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.scale.setTo(1.5, 1.5);
        
        //update score
        score += 50;
    }
     explosionAnimation.play('boom');
}

function checkDirection(direction, forEnemy){
   
    if (forEnemy)
        return (direction == 'left' || direction == 'up') ? -50 : 50;
        
    else return (direction == 'left' || direction == 'up') ? -300 : 300;
}

function bulletHitPlayer(tank, bullet){
    
    bullet.kill();
    var health = tank.body.health;
   
    //get random damage to player
    health -= Phaser.Math.getRandom([25,50],0,2);
   
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(bullet.x + 5, bullet.y + 5);
    
    if (health <= 0)
    {
        tank.kill();
        explosionAnimation.reset(tank.x, tank.y);
        explosionAnimation.scale.setTo(1.5, 1.5);
        tank.body.health = 0;
        
        //YOU ARE LOOOSER!!!
        Winner(false);
        
    }else tank.body.health = health;
     explosionAnimation.play('boom');
     
}

function Winner (winner){
    
    var stateText = game.add.text(game.world.centerX, game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    
    if (winner)
     stateText.text  =  'WINNER';
        else stateText.text = 'LOOSER!';
    
    stateText.anchor.setTo(0.5, 0.5);
}
//=================================
// user functions end
//=================================
