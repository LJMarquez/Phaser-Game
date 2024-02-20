var config = {
    type: Phaser.AUTO,
    width: 1122,
    height: 540,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var score = 0;
var scoreText;
var winText;
var cannonBalls;
var cursors;
let blunderBuss;
var gameOver = false;
let gameWin = false;
let enemyCount = 0;
let jumped = false;
let hasDoubleJump = true;
let facingLeft = false;
let lastShotTime = 0;
const fireDelay = 2000;
let bananaCount = 11;
let hasBlunderBuss = false;
let isGroundPounding = false;
let isShooting = false;
let bossActive = false;
let loseText;
let bossHealth = 3;
let bossDown = true;
let bossInterval;
let directionLeftBoss;

function preload ()
{
    this.load.image('bg', 'assets/jungle.jpg');
    this.load.image('ground', 'assets/jungle-platform.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('kroolIdle', 
    'assets/krool-idle.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('kroolWalk',
    'assets/krool-walk.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('kroolJump', 
    'assets/krool-jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('kroolDeath',
    'assets/krool-death.png',
    { frameWidth: 65, frameHeight: 52}
    );
    this.load.spritesheet('kroolCrouch',
    'assets/krool-crouch.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('kroolShoot',
    'assets/krool-shoot.png',
    { frameWidth: 85, frameHeight: 60}
    );
    this.load.spritesheet('kroolTaunt',
    'assets/krool-taunt.png',
    { frameWidth: 55, frameHeight: 50}
    );


    this.load.spritesheet('enemyIdle',
    'assets/enemy-idle.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('enemyWalk',
    'assets/enemy-walk.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('enemyJump', 
    'assets/enemy-jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('enemyDeath',
    'assets/enemy-death.png',
    { frameWidth: 65, frameHeight: 55}
    );
    this.load.spritesheet('enemyTaunt',
    'assets/enemy-taunt.png',
    { frameWidth: 50, frameHeight: 50}
    );


    this.load.spritesheet('bossWalk',
    'assets/boss-walk.png',
    { frameWidth: 55, frameHeight: 50}
    );
    this.load.spritesheet('bossJump',
    'assets/boss-jump.png',
    { frameWidth: 60, frameHeight: 60}
    );
    this.load.spritesheet('bossDeath',
    'assets/boss-death.png',
    { frameWidth: 60, frameHeight: 60}
    );


    this.load.spritesheet('spin',
    'assets/banana.png',
    { frameWidth: 40, frameHeight: 45}
    );
    this.load.spritesheet('barrel',
    'assets/barrel.png',
    { frameWidth: 48, frameHeight: 50}
    );
    this.load.spritesheet('blunderbuss',
    'assets/blunderbuss.png',
    { frameWidth: 150, frameHeight: 60}
    );
    this.load.spritesheet('cannonball',
    'assets/cannonball.png',
    { frameWidth: 22, frameHeight: 24}
    );
    this.load.spritesheet('explosion',
    'assets/explosion.png',
    { frameWidth: 100, frameHeight: 100}
    );
}

function create ()
{
    this.add.image(0, 0, 'bg').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();

    platforms.create(0, 500, 'ground').setOrigin(0, 0).refreshBody();
    platforms.create(384, 500, 'ground').setOrigin(0, 0).refreshBody();
    platforms.create(768, 500, 'ground').setOrigin(0, 0).refreshBody();


    platforms.create(600, 350, 'ground');
    platforms.create(50, 270, 'ground');
    platforms.create(950, 200, 'ground');


    player = this.physics.add.sprite(100, 450, 'kroolIdle');
    // player.setScale(1.2);
    // player.setSize(player.displayWidth, player.displayHeight, true);
    // player.setOrigin(0, 0);
    // player.setOffset(0, 0);
    player.setSize(player.body.width, player.body.height);


    // player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(200);

    this.anims.create({
        key: 'playerWalk',
        frames: this.anims.generateFrameNumbers('kroolWalk', { start: 0, end: 7 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'playerIdle',
        frames: [ { key: 'kroolIdle', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'playerCrouchDown',
        frames: this.anims.generateFrameNumbers('kroolCrouch', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'playerCrouchUp',
        frames: this.anims.generateFrameNumbers('kroolCrouch', { start: 2, end: 4 }),
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'playerJump',
        frames: this.anims.generateFrameNumbers('kroolJump', { start: 0, end: 8 }),
        frameRate: 13,
        repeat: 0
    });
    
    this.anims.create({
        key: 'playerFall',
        frames: [ { key: 'kroolJump', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'playerShoot',
        frames: this.anims.generateFrameNumbers('kroolShoot', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'playerTaunt1',
        frames: this.anims.generateFrameNumbers('kroolTaunt', { start: 0, end: 6 }),
        frameRate: 13,
        repeat: -1
    });

    this.anims.create({
        key: 'playerTaunt2',
        frames: this.anims.generateFrameNumbers('kroolTaunt', { start: 0, end: 6 }),
        frameRate: 13,
        repeat: 0
    });

    this.anims.create({
        key: 'playerDeath',
        frames: this.anims.generateFrameNumbers('kroolDeath', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0
    });


    this.anims.create({
        key: 'enemyWalk',
        frames: this.anims.generateFrameNumbers('enemyWalk', { start: 0, end: 7 }),
        frameRate: 13,
        repeat: -1
    });

    this.anims.create({
        key: 'enemyJump',
        frames: this.anims.generateFrameNumbers('enemyJump', { start: 0, end: 7 }),
        frameRate: 13,
        repeat: -1
    });

    this.anims.create({
        key: 'enemyFall',
        frames: [ { key: 'enemyDeath', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'enemyDeath',
        frames: this.anims.generateFrameNumbers('enemyDeath', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: 0,
        hideOnComplete: true
    });

    this.anims.create({
        key: 'enemyTaunt',
        frames: this.anims.generateFrameNumbers('enemyTaunt', { start: 0, end: 6 }),
        frameRate: 13,
        repeat: -1
    });


    this.anims.create({
        key: 'bossIdle',
        frames: [ { key: 'bossWalk', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'bossWalk',
        frames: this.anims.generateFrameNumbers('bossWalk', { start: 2, end: 9 }),
        frameRate: 13,
        repeat: -1
    });

    this.anims.create({
        key: 'bossJump',
        frames: this.anims.generateFrameNumbers('bossJump', { start: 0, end: 9 }),
        frameRate: 13,
        repeat: 0
    });

    this.anims.create({
        key: 'bossDeath',
        frames: this.anims.generateFrameNumbers('bossDeath', { start: 0, end: 7 }),
        frameRate: 13,
        repeat: 0
    });

    this.anims.create({
        key: 'bossRecover',
        frames: this.anims.generateFrameNumbers('bossDeath', { start: 7, end: 1 }),
        frameRate: 13,
        repeat: 0,
        reverse: true
    });


    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('spin', { start: 0, end: 7 }),
        frameRate: 13,
        repeat: -1
    });

    this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 24 }),
        frameRate: 20,
        repeat: 0,
        hideOnComplete: true
    });

    this.anims.create({
        key: 'barrel',
        frames: this.anims.generateFrameNumbers('barrel', { frame: 0}),
        frameRate: 20
    });

    this.anims.create({
        key: 'blunderbuss',
        frames: this.anims.generateFrameNumbers('blunderbuss', { frame: 0}),
        frameRate: 20
    });

    this.anims.create({
        key: 'cannonball',
        frames: this.anims.generateFrameNumbers('cannonball', { frame: 0}),
        frameRate: 20
    });

    cursors = this.input.keyboard.createCursorKeys();

    bananas = this.physics.add.group({
        key: 'spin',
        repeat: 11,
        // setXY: { x: 12, y: 0, stepX: 70 }
        setXY: { x: 20, stepX: game.config.width / 11}
    });


    // bananas = this.physics.add.group();

    // for (let i = 0; i < 12; i++) {
    //     let banana = bananas.create(Phaser.Math.Between(12, 800), Phaser.Math.Between(0, 400), 'banana');
    //     banana.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // }

    bananas.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
        child.y = Phaser.Math.FloatBetween(0, game.config.height - 50);
    })

    populateEnemies(this);

    cannonBalls = this.physics.add.group();
    
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff'});

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(bananas, platforms);
    this.physics.add.collider(enemies, platforms);
    
    this.physics.add.overlap(player, bananas, collectBanana, null, this);


    // this.physics.add.overlap(player, enemies, collectStar, null, this);

    this.physics.add.collider(enemies, cannonBalls, cannonOnEnemy, null, this);



    this.physics.add.collider(player, enemies, playerOnEnemy, null, this);

    this.physics.add.collider(cannonBalls, platforms, destroyCannonBall, null, this);


}

function update ()
{
    if (gameWin == false) {
        if (gameOver == false) {
            if (facingLeft) {
                player.setFlipX(true);
            } else {
                player.setFlipX(false);
            }
    
            if (cursors.left.isUp &&
                cursors.right.isUp &&
                cursors.up.isUp &&
                cursors.down.isUp &&
                jumped == false &&
                isGroundPounding == false
                && isShooting == false
                ) {
                    player.anims.play('playerIdle', true);
                }
            if (cursors.left.isDown && isShooting == false) {
                player.setVelocityX(-160);
                if (gameOver == false && jumped == false) {
                    player.anims.play('playerWalk', true);
                }
                facingLeft = true;
            } else if (cursors.right.isDown && isShooting == false) {
                player.setVelocityX(160);
                if (gameOver == false && jumped == false) {
                    player.anims.play('playerWalk', true);
                }
                facingLeft = false;
            } else {
                player.setVelocityX(0);
            }
        
            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-350);
                player.anims.play('playerJump', true);
                setTimeout(function () {
                    if (isGroundPounding == false && isShooting == false && gameOver == false) {
                        player.anims.play('playerFall', true);
                    }
                }, 760)
            }
    
            if (Phaser.Input.Keyboard.JustDown(cursors.down) && !player.body.touching.down) {
                isGroundPounding = true;
                player.setGravityY(0);
                player.setVelocityY(0);
                player.anims.play('playerCrouchDown', true);
                setTimeout(function () {
                    player.setVelocityY(400);
                    player.body.setGravityY(200);
                }, 200)
                // if (player.body.velocity.y < 0) {
                //     player.setVelocityY(player.body.velocity.y *= -1.1);
                // } else {
                //     player.setVelocityY(player.body.velocity.y *= 1.1);
                // }
            }
    
            if (Phaser.Input.Keyboard.JustDown(cursors.up) && !player.body.touching.down) {
                if (hasDoubleJump) {
                    player.setVelocityY(-300);
                    player.anims.stop('playerJump');
                    player.anims.play('playerJump', true);
                    setTimeout(function () {
                        if (isGroundPounding == false && isShooting == false && gameOver == false) {
                            player.anims.play('playerFall', true);
                        }
                    }, 760)
                    hasDoubleJump = false;
                }
            }
    
            // if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
            //     facingLeft = true;
            // }
    
            if (player.body.touching.down) {
                player.setBounceY(0);
                hasDoubleJump = true;
                jumped = false;
            }
    
            if (player.body.velocity.y != 0) {
                jumped = true;
            }

            if (player.body.touching.down) {
                isGroundPounding = false;
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.space) && (this.time.now - lastShotTime) > fireDelay && hasBlunderBuss && player) {
                isShooting = true;
                const currentAnimKey = player.anims.currentAnim.key;
                player.anims.play('playerShoot', true);
                shootCannon(player);
                lastShotTime = this.time.now;
                player.once('animationcomplete', function (animation) {
                    if (animation.key === 'playerShoot') {
                        player.anims.play(currentAnimKey, true);
                        player.setVelocityY(-100);
                        isShooting = false;
                        player.setVelocityX(0);
                    }
                });
            
                lastShotTime = this.time.now;
            }

            if (isShooting) {
                if (facingLeft) {
                    player.setVelocityX(100);
                } else {
                    player.setVelocityX(-100);
                }
            }

            if (bossActive) {
                if (boss.x + boss.body.width >= game.config.width) {
                    boss.setVelocityX(-150);
                    boss.setFlipX(true);
                }
                if (boss.x <= 0) {
                    boss.setVelocityX(150);
                    boss.setFlipX(false);
                }
                if (directionLeftBoss) {
                    boss.setFlipX(true);
                } else {
                    boss.setFlipX(false);
                }
            }

        }

    }

    enemies.children.iterate(function (child) {
        if (child.x + 70 >= game.config.width) {
            child.setVelocityX(-150);
            child.setFlipX(true);
        }
        if (child.x <= 0) {
            child.setVelocityX(150);
            child.setFlipX(false);
        }
        // if (child.getData('dead')) {
        //     child.setVelocityX(0);
        // }
    })

    bananas.children.iterate(function (child) {
        if (child.body.touching.down) {
            child.anims.play('spin', true);
        }
    });

    cannonBalls.children.iterate(function (child) {
        if (child.x + child.body.width > game.config.width - 1 || child.x < child.body.width) {
            child.disableBody(true, true)
        }
    });

    if (bossActive) {
        this.physics.add.collider(boss, cannonBalls, cannonBallOnBoss, null, this);
    }

}

    function collectBanana (player, banana) {
        banana.disableBody(true, true);
        bananaCount--;

        score += 10;
        scoreText.setText('Score: ' + score);
    
        if (bananaCount == 0) {
            bananas.children.iterate(function (child) {
                child.enableBody(true, Phaser.Math.Between(0, game.config.width), Phaser.Math.Between(0, game.config.height - 50), true, true);
                child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
                bananaCount = 11;
            });
        }
    }

    function playerOnEnemy(player, enemy) {
        if (!gameOver) {
            if (player.body.touching.down && player.y < enemy.y) {+
                player.setVelocityY(-200);
                player.anims.play('playerJump', true);
                // enemy.setData('dead', true);
                enemy.disableBody(true, true);
                enemy.anims.play('enemyDeath', true);
                const deathAnim = this.add.sprite(enemy.x + enemy.body.width / 2, enemy.y + enemy.body.height / 2, 'enemyDeath');
                deathAnim.anims.play('enemyDeath', true);
            } else {
                clearIntervalAllEnemies();
                player.setVelocity(0);
                player.setTint(0xff0000);
                player.anims.play('playerDeath');
                gameOver = true;
            }
    
            if (enemies.countActive(true) === 0) {
                    console.log(enemies.countActive(true));
                    enemyCount++;
                    enemies.repeat = enemyCount;
                    
                    if (enemyCount == 2) {
                        blunderBuss = this.physics.add.group({
                            key: 'blunderbuss',
                            repeat: 1,
                            setXY: { x: 120, y: 0}
                        });
                        this.physics.add.collider(blunderBuss, platforms);
                        this.physics.add.overlap(player, blunderBuss, collectBlunderBuss, null, this);
                    }
                    
                    populateEnemies(this);
                    
                }
        }
    }

function shootCannon(player) {
    let bomb = cannonBalls.create(player.x - 20, player.y + 20, 'cannonball');
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(-100);
    if (facingLeft) {
        bomb.setVelocityX(-400);
        // player.setVelocityX(100);
        player.setVelocityY(-50);
    } else {
        bomb.setVelocityX(400);
        // player.setVelocityX(-100);
        player.setVelocityY(-50);
    }
}

function cannonOnEnemy(enemy, cannonBall) {
    enemy.setVelocity(0);
    const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
    explosion.anims.play('explosion', true);
    enemy.disableBody(true, true);
    cannonBall.disableBody(true, true);
    if (enemies.countActive(true) === 0) {
        enemyCount++;
        enemies.repeat = enemyCount;
        populateEnemies(this);
    }
}

function collectBlunderBuss(player, blunderBuss) {
    hasBlunderBuss = true;
    blunderBuss.disableBody(true, true);
}

function destroyCannonBall(cannonBall, platform) {
    cannonBall.disableBody(true, true);
}

function populateEnemies(scene) {
     if (enemyCount == 7) {
        bossActive = true;
        platforms.children.iterate(function (child) {
            child.disableBody(true, true);
        })
        platforms.create(0, 500, 'ground').setOrigin(0, 0).refreshBody();
        platforms.create(384, 500, 'ground').setOrigin(0, 0).refreshBody();
        platforms.create(768, 500, 'ground').setOrigin(0, 0).refreshBody();
        boss = scene.physics.add.sprite(game.config.width / 2, 0, 'barrel');
        boss.setOrigin(0, 0);
        boss.setScale(2);
        boss.setSize(boss.body.width, boss.body.height);
        boss.setCollideWorldBounds(true);
        scene.physics.add.collider(boss, platforms);
        scene.physics.add.collider(boss, player, playerOnBoss, null, this);
        
        let directionBoolBoss = Math.floor(Math.random() * 2);
        if (directionBoolBoss == 0) {
            directionLeftBoss = false;
        } else {
            directionLeftBoss = true;
        }
        let randomTime;
        setInterval(function () {
            randomTime = Math.floor(Math.random() * 1000) + 1000;
        }, 500);
        setTimeout(function () {
            bossDown = false;
            boss.anims.play('bossWalk', true);
            boss.setVelocityX(150);
            let bossInterval = setInterval(function () {
                if (boss.body.touching.down) {
                    boss.setVelocityY(-250);
                }
                let speed = Math.floor(Math.random() * 200) + 200;
                // directionLeftBoss = !directionLeftBoss;
                boss.setVelocityX(speed);
                if (player.x < boss.x) {
                    boss.setVelocityX(-speed);
                    directionLeftBoss = true;
                } else {
                    boss.setVelocityX(speed);
                    directionLeftBoss = false;
                }
            }, randomTime);

            boss.setData('bossInterval', bossInterval);
        }, 2000)
    } else {
        enemies = scene.physics.add.group({
            key: 'enemy',
            repeat: enemyCount,
            setXY: { x: game.config.width / (enemyCount + 2), y: 50, stepX: game.config.width / (enemyCount + 2) }
        });
        
        enemies.children.iterate(function (child) {
            child.setCollideWorldBounds(true);
            scene.physics.add.collider(enemies, platforms);
            scene.physics.add.collider(player, enemies, playerOnEnemy, null, this);
            scene.physics.add.collider(enemies, cannonBalls, cannonOnEnemy, null, this);
            child.setOrigin(0, 0);
            child.setSize(child.body.width, child.body.height + 20);
            child.anims.play('enemyWalk', true);
            // child.setData('dead', false);

            let directionLeft;
            let directionBool = Math.floor(Math.random() * 2);
            if (directionBool == 0) {
            directionLeft = false;
            } else {
                directionLeft = true;
            }
            child.setBounceY(0.1);
            let randomTime = Math.floor(Math.random() * 1000) + 1000;
            let enemyInterval = setInterval(function () {
                let speed = Math.floor(Math.random() * 150) + 100;
                directionLeft = !directionLeft;
                if (directionLeft) {
                    child.setVelocityX(speed *= -1);
                    child.setFlipX(true);
                } else {
                    child.setVelocityX(speed);
                    child.setFlipX(false);
                }
            }, randomTime);

            child.setData('enemyInterval', enemyInterval);
        }, scene);

    }   
}

function clearIntervalAllEnemies() {
    enemies.children.iterate(function (child) {
        child.setVelocityX(0);
        let enemyInterval = child.getData('enemyInterval');
        if (enemyInterval) {
            clearInterval(enemyInterval);
            child.setData('enemyInterval', null);
            child.anims.play('enemyTaunt', true)
        }
    });
}

function cannonBallOnBoss(cannonball, scene) {
    cannonBalls.children.iterate(function (child) {
            child.disableBody(true, true)
    });
    if (bossDown == false) {
        if (bossHealth <= 0) {
            let bossInterval = boss.getData('bossInterval');
            clearInterval(bossInterval);
            boss.anims.play('bossDeath', true);
            bossDown = true;
            boss.setVelocityX(0);
            const explosion = this.add.sprite(boss.x - 50, boss.y - 50, 'explosion');
            explosion.setScale(2);
            explosion.setOrigin(0, 0);
            explosion.anims.play('explosion', true);
            gameOver = true;
            player.anims.play('playerTaunt1', true);
            player.setVelocityX(0);
            boss.setVelocityX(0);
            winText = this.add.text(game.config.width / 2, game.config.height / 2, 'YOU LOSE', { fontSize: '100px', fill: '#00ff00', backgroundColor: '#ff0000', padding: { x: 20, y: 10 }});
        } else {
            let bossInterval = boss.getData('bossInterval');
            clearInterval(bossInterval);
            boss.anims.play('bossDeath', true);
            
            bossDown = true;
            bossHealth--;
            boss.setVelocityX(0);
            
            const explosion = this.add.sprite(boss.x - 50, boss.y - 50, 'explosion');
            explosion.setScale(2);
            explosion.setOrigin(0, 0);
            explosion.anims.play('explosion', true);
            if (gameOver == false) {
                setTimeout(function () {
                    boss.anims.play('bossRecover', true);
                    setTimeout(function () {
                            boss.clearTint();
                            bossDown = false;
                        }, 2000)
        
                    let randomTime = 2000;
                    let directionLeftBoss = true;
                    setInterval(function () {
                        randomTime = Math.floor(Math.random() * 1000) + 1000;
                    }, 10);
                    setTimeout(function () {
                        boss.anims.play('bossWalk', true);
                        boss.setTint(0xFFD700);
                        boss.setFlipX(true);
                        boss.setVelocityX(-200);
                        let bossInterval = setInterval(function () {
                            if (boss.body.touching.down) {
                                boss.setVelocityY(-250);
                            }
                            let speed = Math.floor(Math.random() * 200) + 200;
                            // directionLeftBoss = !directionLeftBoss;
                            if (player.x < boss.x) {
                                boss.setVelocityX(-speed);
                                directionLeftBoss = true;
                            } else {
                                boss.setVelocityX(speed);
                                directionLeftBoss = false;
                            }
                        }, randomTime);
                        boss.setData('bossInterval', bossInterval);
                    }, 540)
                    
                    
                }, 2000);
            }
        }
    } else {
        if (player.x < boss.x) {
            boss.setVelocityX(-200);
        } else {
            boss.setVelocityX(200);
        }
    }

}

function playerOnBoss(scene) {
    if (bossHealth > 0) {
        let bossInterval = boss.getData('bossInterval');
        player.setVelocity(0);
        player.setTint(0xff0000);
        player.anims.play('playerDeath');
        gameOver = true;
        boss.setVelocityX(0);
        boss.anims.play('bossIdle', true);
        clearInterval(bossInterval);
    }
}