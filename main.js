var config = {
    type: Phaser.AUTO,
    width: 1122,
    height: 540,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
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
var bombs;
var cursors;
var gameOver = false;
let enemyCount = 0;
let jumped = false;

function preload ()
{
    this.load.image('bg', 'assets/jungle.jpg');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('enemy', 
    'assets/krool-jump.png',
    { frameWidth: 50, frameHeight: 48}
    );
    // this.load.spritesheet('dude',
    //     'assets/test.png',
    //     { frameWidth: 32, frameHeight: 48 }
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
}

function create ()
{
    this.add.image(0, 0, 'bg').setOrigin(0, 0);

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');


    player = this.physics.add.sprite(100, 450, 'krool');

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setGravityY(100);

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

    this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('jump', { start: 0, end: 8 }),
        frameRate: 10,
        repeat: 1
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })

    enemies = this.physics.add.group({
        key: 'enemy',
        repeat: enemyCount,
        setXY: { x: 12, y: 0, stepX: 70 }
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

    bombs = this.physics.add.group();
    
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000'});

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.collider(bombs, platforms);
    
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // this.physics.add.overlap(player, enemies, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.physics.add.collider(player, enemies, playerOnEnemy, null, this);

}

function update ()
{

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            if (gameOver == false) {
                player.anims.play('left', true);
            }
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            if (gameOver == false) {
                player.anims.play('right', true);
            }
        // } else if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // if (player.body.touching.down) {
                // player.anims.play('up', true);
                // player.setVelocityY(-330);
            // }
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-350);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            let jumped = true;
        }

        if (jumped) {
            player.anims.play('up', true);
        }

    // if (cursors.up.isDown) {
    //     player.anims.play('up', true);
    // }
    // cursors.up.onDown.play('up', true);
    // if (cursors.up.isDown && player.body.touching.down != false) {
    //     player.anims.play('up', true);
    // }

    enemies.children.iterate(function (child) {
        if (child.getBounds().x <= 0 || child.getBounds().x >= game.config.width) {
            child.setVelocityX(child.body.velocity.x *= -1);
            child.body.x += 5; 
        }
    })
}

    function collectStar (player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);

        if (stars.countActive(true) === 0) {
            stars.children.iterate(function (child) {
                child.enableBody(true, child.x, 0, true, true);
            });

            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    function playerOnEnemy(player, enemy) {
        if (player.body.touching.down && player.y < enemy.y) {
            enemy.disableBody(true, true);
        } else {
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn');
            gameOver = true;
        }

        if (enemies.countActive(true) === 0) {
            enemyCount++;
            enemies.repeat = enemyCount;
            // enemies.children.iterate(function (child) {
            //     child.enableBody(true, Phaser.Math.Between(0, game.config.width), 0, true, true);
            // });

            // enemies.clear(true, true);

            // enemies = this.physics.add.group({
            //     key: 'enemy',
            //     repeat: enemyCount,
            //     setXY: { x: 12, y: 0, stepX: 70 }
            // });
    
            // enemies.children.iterate(function (child) {
            //     child.setCollideWorldBounds(true);
            //     child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
            // });

            enemies.clear(true, true);

            
            if (enemyCount == 1) {
                winText = this.add.text(100, 100, 'YOU WIN!!!!', { fontSize: '50px', fill: '#fff'});
            } else {
                enemies = this.physics.add.group({
                    key: 'enemy',
                    repeat: enemyCount,
                    setXY: { x: (Phaser.Math.Between(0, game.config.width)), y: 0, stepX: 70 }
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
        }


        }

        // if (enemies.countActive(true) === 0) {
        //     enemyCount++;
        //     for (let i = 0; i < enemyCount; i++) {
        //         // Create new enemies based on the updated enemyCount
        //         let newEnemy = enemies.create(Phaser.Math.Between(0, game.config.width), 0, 'enemy');
        //         // Set properties for the new enemy
        //         newEnemy.setCollideWorldBounds(true);
        //         newEnemy.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
        //     }
        //     console.log(enemyCount);
        // }
    }

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff000);

    player.anims.play('turn');

    gameOver = true;
}