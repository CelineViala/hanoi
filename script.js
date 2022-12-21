const app={
    n:3,//nb of Disks
    minMoves:7, // (2^n)-1
    towerHeight:null,
    moves:[],
    pause:false,
    interval:null,
    nbMoves:0,
    domElem:{
        counterText:document.querySelector('.textCounter'),
        pauseBtn:document.querySelector('.pause'),
        counter:document.querySelector('.movesNb'),
        msg:document.querySelector('.msg'),
        towers: document.querySelectorAll(".tower"),
        solveBtn: document.querySelector(".settings__solve"),
        restartBtn: document.querySelector(".settings__restart"),
        rangeInput: document.querySelector("#nbDisks"),
        nbChoosen: document.querySelector(".valueNbDisks"),
    },
    rules: `But du jeu : Reconstituer la tour la troisième barre en un minimum de déplacements.
    On ne peut déplacer que le premier disque d'une pile.
    Un disque ne peut être posé que sur un disque de plus grande taille ou sur une barre vide. Pour déplacer un disque : cliquez dessus et faites-le glisser.`,
    drake:null, //the instance of Dragula (drag and drop library)
    handleDragNDrop(){
        this.drake=dragula(Array.from(this.domElem.towers), {
            revertOnSpills: true,
            //only a smaller disk can be placed on another disk 
            // a disk can always be placed on a free vertical bar
            //the disk with the smallest index is the biggest one
            accepts: function (el, _, _, sibling) {
                return ((Number(sibling?.dataset.position) < Number(el.dataset.position)) || !sibling);
            },
            // only the first disk can be moved
            moves: function (el) {
                return !el.previousElementSibling;
            }
        }).on('drop', (el) => {
            //if a disk try to go under another disk we cancel the move, it can only be put on the top of the stack
            if (el.previousElementSibling) {
                this.drake.cancel(true);
            } else {
                this.nbMoves++;
                this.handleTextCounter();
            }
            el.classList.remove("gu-hide")
            if (this.domElem.towers[2].childElementCount === Number(this.n)) {
                this.domElem.msg.textContent = `Gagné en ${this.nbMoves} déplacements ! `;
                if (this.nbMoves > this.minMoves) {
                    this.domElem.msg.textContent += "Mais ce n'est pas le nombre de déplacements minimum.";
                } else {
                    this.domElem.msg.textContent += "Bravo ! C'est une solution optimale !";
                }  
            }
        }).on('shadow', (el) => {
            // disable the shadows because is pretty confusing for users 
            el.classList.add("gu-hide");
        }).on('cancel', (el) => {
            //displays the disk because we had previously hidden shadow which indeed was the disk
            el.classList.remove("gu-hide");
        })
    },
    handleTextCounter() {
        this.domElem.counter.textContent = this.nbMoves;
        if (this.nbMoves > 1) this.domElem.counterText.textContent = 'déplacements';
        else this.domElem.counterText.textContent = 'déplacement';
    },
    hanoi(n, start, free, goal) {
        if (!n) return;
    
        this.hanoi(n - 1, start, goal, free);
        this.moves.push([start, goal]);
        //console.log(("le jeton de la tour n°" + start + " est déplacé vers la tour n°" + goal))
        this.hanoi(n - 1, free, start, goal);
    },
    takeOffFromBar(bar,disk){
        bar.removeChild(disk);
    },
    appendToBar(bar,disk){
        bar.prepend(disk);
    },
    solve() {
        this.domElem.msg.textContent = `La solution optimale est en ${this.minMoves} déplacements`;
        this.hanoi(this.n, 0, 1, 2);
        let i = 0; //counter for moves
        this.interval = setInterval(() => {
            if (!this.pause) {
                const [start,goal ]= this.moves[i];
                const disk = this.domElem.towers[start].firstElementChild;
                this.takeOffFromBar(this.domElem.towers[start],disk);
                this.appendToBar(this.domElem.towers[goal],disk);
                this.nbMoves++;
                this.handleTextCounter();
                i++;
            }
            if (i == this.moves.length) {
                clearInterval(this.interval);
                this.domElem.pauseBtn.textContent = "";
            }
        }, 600);
    },
    addEvents(){
        this.domElem.solveBtn.addEventListener("click", () => {
            this.init(true);
            this.domElem.pauseBtn.textContent = "⏸";
            this.solve();
        })
        this.domElem.restartBtn.addEventListener("click", () => {
            this.init(true);
        })
        this.domElem.rangeInput.addEventListener("change", () => {
            this.n = this.domElem.rangeInput.value;
            this.domElem.nbChoosen.textContent = this.n;
            this.minMoves = Math.pow(2, this.n) - 1;
            this.init(true);
        
        })
        this.domElem.pauseBtn.addEventListener("click", () => {
            if (!this.pause) {
                this.domElem.pauseBtn.textContent = "⏵";
                this.pause = true;
            } else {
                this.domElem.pauseBtn.textContent = "⏸";
                this.pause = false;
            }
        })
    },
    init(reset=false) {
        if(!reset) //useful only for the first initialization
        {   
            this.addEvents();
            this.handleDragNDrop(); 
        }
        this.pause=false;
        this.domElem.pauseBtn.textContent = "";
        clearInterval(this.interval);
        this.moves = [];
        this.nbMoves = 0;
        this.domElem.msg.textContent = this.rules;
        this.handleTextCounter();
        this.domElem.towers.forEach(tower => {
            tower.innerHTML = "";
        })
        // creation of the disks according to the n (number of disks) 
        for (let i = this.n; i >= 1; i--) {
            const diskElm = document.createElement('img');
            diskElm.setAttribute("src", `hanoi1.png`);
            diskElm.setAttribute("data-position", i);
            diskElm.classList.add("part");
            diskElm.classList.add("part" + i);
            this.domElem.towers[0].appendChild(diskElm);
        }
        //config the height of vertical bar
        this.towerHeight = document.querySelector(".tower").scrollHeight;
        this.domElem.towers.forEach(tower => {
            tower.style.minHeight = `${this.towerHeight}px`;
        })
    }
}
app.init();
