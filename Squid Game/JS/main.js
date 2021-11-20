const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xb7c3f3,1);

const light=new THREE.AmbientLight(0xffffff);
scene.add(light)

//global variable
const start_position=3
const end_position=-start_position;
const text=document.querySelector(".text")
const TIMIT_LIMIT=10;
let  gameStart="loading"
let isLookingBackward=true

function createCube(size,positionX,rotY=0,color=0xfbc851){
    const geometry=new THREE.BoxGeometry(size.w,size.h,size.d);
const material=new THREE.MeshBasicMaterial({color:color});
const cube=new THREE.Mesh(geometry,material);
cube.position.x=positionX;
cube.rotation.y =rotY;
scene.add(cube);
return cube;
}

camera.position.z = 5;

const loader=new THREE.GLTFLoader()

function delay(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}

class Doll{
    constructor(){
        loader.load("../models/scene.gltf",  (gltf)=> {
            scene.add(gltf.scene);
            gltf.scene.scale.set(.4, .4, .4);
            gltf.scene.position.set(0, -1, 0);
            this.doll=gltf.scene;
        })
    }

    lookBackward(){
      gsap.to(this.doll.rotation,{y:-3.15,duration:.5})
      setTimeout(() => isLookingBackward=true,150)
    }

    lookForward(){
       gsap.to(this.doll.rotation,{y:0,duration:.5})
        setTimeout(() => isLookingBackward = false, 450)
    }

    start(){
        this.lookBackward()
        await delay((Math.random()*1000)+1000)
        this.lookForward()
        await delay((Math.random()*750)+750)
        this.start()
    }
}

function createTrack(){
    createCube({ w: start_position * 2+.2, h: 1.5, d: 1 }, 0, 0).position.z = -1;
    createCube({w:.2,h:1.5,d:1},start_position,-.35);
    createCube({ w: .2, h: 1.5, d: 1 },end_position, .35);
}
createTrack()

class Player{
    constructor(){
        const geometry=new THREE.SphereGeometry(.3,32,16);
        const material=new THREE.MeshBasicMaterial({color:0xffffff});
        const sphere=new THREE.Mesh(geometry,material);
        sphere.position.z=1;
        sphere.position.x=start_position
        scene.add(sphere)
        this.player=sphere
        this.playerInfo={
            positionX:start_position,
            velocity:0.1
        }
    }

   run(){
        this.playerInfo.velocity=.03
   } 

   stop(){
       gsap.to(this.playerInfo,{velocity:0,duration:.1})
   }

   check(){
    if(this.playerInfo.velocity>0 && ! isLookingBackward){
        text.innerText="You lose !"
        gameStart="Over"
    }
    if(this.playerInfo.positionX < end_position +.4){
        text.innerText="You win !"
        gameStart="Over"
    }
   }

   update(){
       this.check()
       this.playerInfo.positionX+=this.playerInfo.velocity
       this.player.position.x=this.playerInfo.positionX
   }
}

const player=new Player()
let doll=new Doll()

async function init(){
   await delay(500) 
   text.innerText="Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "GO  !!!"
    startGame()
}

function startGame(){
    gameStart="started"
    let progressBar=createCube({w:5,h:.1,d:1},0)
    progressBar.position.y=3.35
    gsap.to(progressBar.scale,{x:0,duration:TIMIT_LIMIT,ease:"none"})
    doll.start()
    setTimeout(() => {
        if(gameStart!="Over"){
            text.innerText="You ran out of time!"
            gameStart="Over"
        }
    }, TIMIT_LIMIT*1000);
}

init()

function animate() {
    if(gameStart=="Over")return
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    player.update()
}
animate();

window.addEventListener('resize',onWindowResize,false);

function onWindowResize(){
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);

}

window.addEventListener('keydown',(e)=>{
    if(gameStart!="started")return
    if(e.key=='ArrowUp'){
        player.run()
    }
})
window.addEventListener('keyup', (e) => {
    if (e.key == 'ArrowUp') {
        player.stop()
    }
})