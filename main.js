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
var gameOver = false;
let gameWin = false;
let enemyCount = 0;
let jumped = false;
let hasDoubleJump = true;
let facingLeft = false;
let lastShotTime = 0;
const fireDelay = 1000;
let bananaCount = 11;
let hasBlunderBuss = false;

function preload ()
{
    this.load.image('bg', 'assets/jungle.jpg');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('enemy', 
    'assets/krool-jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('jump', 
    'assets/jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    // this.load.spritesheet('jumpR', 
    // 'assets/jumpR.png',
    // { frameWidth: 50, frameHeight: 48}
    // );
    this.load.spritesheet('krool', 
    'assets/krool-idle.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('walkR',
    'assets/krool-walk-right.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('walkL',
    'assets/krool-walk-left.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('jump',
    'assets/krool-jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    this.load.spritesheet('spin',
    'assets/banana.png',
    { frameWidth: 40, frameHeight: 45}
    );
}

function create ()
{
    this.add.image(0, 0, 'bg').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(4).refreshBody();

    platforms.create(700, 350, 'ground');
    platforms.create(50, 300, 'ground');
    platforms.create(750, 220, 'ground');


    player = this.physics.add.sprite(100, 450, 'krool');
    // player.setScale(1.2);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(200);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('walkL', { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'krool', frame: 0 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('walkR', { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    // this.anims.create({
    //     key: 'jumpL',
    //     frames: this.anims.generateFrameNumbers('jumpL', { start: 0, end: 9 }),
    //     frameRate: 10,
    //     repeat: 0
    // });

    this.anims.create({
        key: 'jump',
        frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 9 }),
        frameRate: 13,
        repeat: 0
    });

    this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('spin', { start: 0, end: 8 }),
        frameRate: 13,
        repeat: -1
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

    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: enemyCount,
        setXY: { x: game.config.width / 2, y: 0, stepX: 70 }
    });

    
        enemies.children.iterate(function (child) {
            let directionLeft;
            child.setCollideWorldBounds(true);
            let directionBool = Math.floor(Math.random() * 2);
            if (directionBool == 0) {
                directionLeft = false;
            } else {
                directionLeft = true;
            }
            child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
            let randomTime = Math.floor(Math.random() * 1000) + 1000;
            setInterval(function () {
                let speed = Math.floor(Math.random() * 200) + 50;
                // let speed = -100;
                directionLeft = !directionLeft;
                if (directionLeft) {
                    child.setVelocityX(speed *= -1);
                    child.anims.play('left', true);
                } else {
                    child.setVelocityX(speed);
                    child.anims.play('right', true);
                }
            }, randomTime);
        })

    cannonBalls = this.physics.add.group();
    
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff'});

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(bananas, platforms);
    this.physics.add.collider(enemies, platforms);
    
    this.physics.add.overlap(player, bananas, collectBanana, null, this);


    // this.physics.add.overlap(player, enemies, collectStar, null, this);

    // this.physics.add.collider(player, cannonBalls, cannonCollision, null, this);

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
                jumped == false) {
                    player.anims.play('turn', true);
                }
            if (cursors.left.isDown) {
                player.setVelocityX(-160);
                if (gameOver == false && jumped == false) {
                    player.anims.play('right', true);
                }
                facingLeft = true;
            } else if (cursors.right.isDown) {
                player.setVelocityX(160);
                if (gameOver == false && jumped == false) {
                    player.anims.play('right', true);
                }
                facingLeft = false;
            } else {
                player.setVelocityX(0);
            }
        
            if (cursors.up.isDown && player.body.touching.down) {
                player.setVelocityY(-350);
                player.anims.play('jump', true);
                setTimeout(function () {
                    player.anims.play('turn', true);
                }, 760)
            }
    
            if (Phaser.Input.Keyboard.JustDown(cursors.down) && !player.body.touching.down) {
                player.setGravityY(0);
                player.setVelocityY(0);
                setTimeout(function () {
                    player.setVelocityY(400);
                    player.body.setGravityY(200);
                }, 500)
                // if (player.body.velocity.y < 0) {
                //     player.setVelocityY(player.body.velocity.y *= -1.1);
                // } else {
                //     player.setVelocityY(player.body.velocity.y *= 1.1);
                // }
            }
    
            if (Phaser.Input.Keyboard.JustDown(cursors.up) && !player.body.touching.down) {
                if (hasDoubleJump) {
                    player.setVelocityY(-300);
                    player.anims.stop('jump');
                    player.anims.play('jump', true);
                    setTimeout(function () {
                        player.anims.play('turn', true);
                    }, 760)
                    hasDoubleJump = false;
                }
            }
    
            if (Phaser.Input.Keyboard.JustDown(cursors.left)) {
                facingLeft = true;
            }
    
            if (player.body.touching.down) {
                player.setBounceY(0);
                hasDoubleJump = true;
                jumped = false;
            }
    
            if (player.body.velocity.y != 0) {
                jumped = true;
            }

            if (Phaser.Input.Keyboard.JustDown(cursors.space) && (this.time.now - lastShotTime) > fireDelay && hasBlunderBuss) {
                shootCannon();
                lastShotTime = this.time.now;
            }

        }

    }

    enemies.children.iterate(function (child) {
        if (gameOver) {
            child.setVelocityX(0);
            child.anims.play('turn', true);
        }
        if (child.getBounds().x <= 0 || child.getBounds().x >= game.config.width) {
            // child.setVelocityX(child.body.velocity.x *= -1);
            // child.body.x += 5; 
        }
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
        if (player.body.touching.down && player.y < enemy.y) {
            enemy.disableBody(true, true);
            player.setVelocityY(-200);
        } else {
            player.setVelocity(0);
            player.setTint(0xff0000);
            player.anims.play('turn');
            gameOver = true;
        }

        if (enemies.countActive(true) === 0) {
            enemyCount++;
            enemies.repeat = enemyCount;

            if (enemyCount == 3) {
                blunderBuss = this.physics.add.group({
                    key: 'spin',
                    repeat: 1,
                    setXY: { x: 120, y: 0}
                });
    
            this.physics.add.collider(blunderBuss, platforms);
            this.physics.add.overlap(player, blunderBuss, collectBlunderBuss, null, this);
            }
            

            // boss = this.physics.add.sprite(100, 450, 'krool');
            // boss.setCollideWorldBounds(true);
            // this.physics.add.collider(boss, platforms);
            // this.physics.add.collider(boss, cannonBalls, cannonBallOnBoss, null, this);
            // this.physics.add.collider(boss, player, playerOnBoss, null, this);

            // let directionLeftBoss;
            // let directionBoolBoss = Math.floor(Math.random() * 2);
            // if (directionBoolBoss == 0) {
            // directionLeftBoss = false;
            // } else {
            //     directionLeftBoss = true;
            // }
            // let randomTime = Math.floor(Math.random() * 1000) + 1000;
            // setInterval(function () {
            //     let speed = Math.floor(Math.random() * 200) + 50;
            //     // let speed = -100;
            //     directionLeftBoss = !directionLeftBoss;
            //     if (directionLeftBoss) {
            //         boss.setVelocityX(speed *= -1);
            //         boss.anims.play('left', true);
            //     } else {
            //         boss.setVelocityX(speed);
            //         boss.anims.play('right', true);
            //     }
            // }, randomTime);


            if (enemyCount == 4) {
                winText = this.add.text(100, 100, 'YOU WIN!!!!', { fontSize: '50px', fill: '#fff'});
            } else {
                enemies = this.physics.add.group({
                    key: 'enemy',
                    repeat: enemyCount,
                    setXY: { x: game.config.width / enemyCount, y: 0, stepX: 70 }
                });
                
                enemies.children.iterate(function (child) {
                    child.setCollideWorldBounds(true);
                    this.physics.add.collider(enemies, platforms);
                    this.physics.add.collider(player, enemies, playerOnEnemy, null, this);
                    child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
        
                    let directionLeft;
                    let directionBool = Math.floor(Math.random() * 2);
                    if (directionBool == 0) {
                    directionLeft = false;
                    } else {
                        directionLeft = true;
                    }
                    child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
                    let randomTime = Math.floor(Math.random() * 1000) + 1000;
                    setInterval(function () {
                        let speed = Math.floor(Math.random() * 200) + 50;
                        // let speed = -100;
                        directionLeft = !directionLeft;
                        if (directionLeft) {
                            child.setVelocityX(speed *= -1);
                            child.anims.play('left', true);
                        } else {
                            child.setVelocityX(speed);
                            child.anims.play('right', true);
        
                        }
                    }, randomTime);
                }, this);
            this.physics.add.collider(enemies, cannonBalls, cannonOnEnemy, null, this);

        }

        }
    }

function shootCannon() {
    let bomb = cannonBalls .create(player.x - 20, player.y, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(-100);
    if (facingLeft) {
        bomb.setVelocityX(-400);
    } else {
        bomb.setVelocityX(400);
    }
}

function cannonOnEnemy(enemy, cannonBall) {
    enemy.disableBody(true, true);
    cannonBall.disableBody(true, true);

    if (enemies.countActive(true) === 0) {
        enemyCount++;
        enemies.repeat = enemyCount;
        
        if (enemyCount == 10) {
            winText = this.add.text(100, 100, 'YOU WIN!!!!', { fontSize: '50px', fill: '#fff'});
        } else {
            enemies = this.physics.add.group({
                key: 'enemy',
                repeat: enemyCount,
                setXY: { x: game.config.width / (enemyCount + 2), y: 0, stepX: game.config.width / (enemyCount + 2) }
            });
            
            enemies.children.iterate(function (child) {
                child.setCollideWorldBounds(true);
                this.physics.add.collider(enemies, platforms);
                this.physics.add.collider(player, enemies, playerOnEnemy, null, this);
                child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    
                let directionLeft;
                let directionBool = Math.floor(Math.random() * 2);
                if (directionBool == 0) {
                directionLeft = false;
                } else {
                    directionLeft = true;
                }
                child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
                let randomTime = Math.floor(Math.random() * 1000) + 1000;
                setInterval(function () {
                    let speed = Math.floor(Math.random() * 200) + 50;
                    // let speed = -100;
                    directionLeft = !directionLeft;
                    if (directionLeft) {
                        child.setVelocityX(speed *= -1);
                        child.anims.play('left', true);
                    } else {
                        child.setVelocityX(speed);
                        child.anims.play('right', true);
    
                    }
                }, randomTime);
            }, this);
           this.physics.add.collider(enemies, cannonBalls, cannonOnEnemy, null, this);
        }

    }
}

function collectBlunderBuss(player, blunderBuss) {
    hasBlunderBuss = true;
    blunderBuss.disableBody(true, true);
}

function destroyCannonBall(cannonBall, platform) {
    cannonBall.disableBody(true, true);
}