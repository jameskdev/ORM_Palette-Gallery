// Map of current images
let aMap = new Map();

// Variable for maintaining current number of images
let numOfImages = 0;

// Number of columns (how many imgs to display in a row)
let numOfColumns = 5;

// Preview height and width
const imgDefaultHeight = 100;
const imgDefaultWidth = 100;

// Size of zoomed in image.
const bigSizeX = 500;
const bigSizeY = 500;

// Gap (padding) between images
const gapBtwnImages = 10;

// The top & left offset values for the images
const imgLeftOffset = 100;
const imgTopOffset = 100;

// When set to false,opening  animation will be disabled
let animateEffects = true;

class GalleryObject {
    #mNodeId;
    #mPosX;
    #mPosY;
    #mSizeX;
    #mSizeY;
    #mImgSrc;
    mImageElement;
    #mIsBig = false;
    #prevDragX = 0;
    #prevDragY = 0;
    constructor(nodeId, posX, posY, sizeX, sizeY, imgSrc) {
        this.#mNodeId = nodeId;
        this.#mPosX = posX;
        this.#mPosY = posY;
        this.#mSizeX= sizeX;
        this.#mSizeY = sizeY;
        this.#mImgSrc = imgSrc;
        this.isAnimating = false;
        this.isMoving = false;
        this.mImageElement = document.createElement("img");
        this.mImageElement.id = this.#mNodeId;
        this.mImageElement.src = this.#mImgSrc;
        this.mImageElement.style.position = "absolute";
        this.mImageElement.style.width = this.#mSizeX + "px";
        this.mImageElement.style.height = this.#mSizeY + "px";
        this.mImageElement.style.left = this.#mPosX + "px";
        this.mImageElement.style.top = this.#mPosY + "px";
        this.mImageElement.addEventListener("dragstart", ev => { console.log("DRAG_START " + ev.clientX + " " + ev.clientY); this.#prevDragX = ev.clientX; this.#prevDragY = ev.clientY; } );
        this.mImageElement.addEventListener("dragend", ev => { console.log("DRAG_END " + ev.clientX + " " + ev.clientY + "  " + ev.screenX + " " + ev.screenY); 
            if (!this.#mIsBig) {
                this.setPosX(this.#mPosX + (ev.clientX - this.#prevDragX)); 
                this.setPosY(this.#mPosY + (ev.clientY - this.#prevDragY)); 
                this.#prevDragX = ev.clientX; 
                this.#prevDragY = ev.clientY;
            }
        } );
        this.mImageElement.addEventListener("dblclick", async (ev) => {
            console.log("dblclick"); 
            if ((!this.#mIsBig) && animateEffects) {
                await this.gAnimate().finished; 
                this.toggleBig();
            } else {
                this.toggleBig();
            }
        });

        // Below are the codes for experimenting and tampering. May be used in the future (albeit with heavy modifications)
        //this.mImageElement.addEventListener("drag", ev => {
        //    console.log((ev.clientX - this.#prevDragX) + " " + (ev.clientY - this.#prevDragY)); 
        //    this.setPosX(this.#mPosX + (ev.clientX - this.#prevDragX)); 
        //    this.setPosY(this.#mPosY + (ev.clientY - this.#prevDragY)); 
        //    this.#prevDragX = ev.clientX; 
        //    this.#prevDragY = ev.clientY; 
        //} );
        //this.mImageElement.addEventListener("pointerdown", ev => { console.log("PTDOWN"); });
        //this.mImageElement.addEventListener("pointerup", ev => { console.log("PT_UP"); });
        //this.mImageElement.addEventListener("pointercancel", ev => { console.log("PT_CANCEL"); });
        //this.mImageElement.addEventListener("pmousedown", ev => { console.log("mdown"); });
        //this.mImageElement.addEventListener("mouseupup", ev => { console.log("mup"); });
        //this.mImageElement.addEventListener("mouseleave", ev => { console.log("mleave"); });
        //this.mImageElement.addEventListener("drop", ev => { console.log("DROP " + ev.clientX + " " + ev.clientY + "  " + ev.screenX + " " + ev.screenY); this.#prevDragX = ev.clientX; this.#prevDragY = ev.clientY; } );
    }

    toggleBig() {
        if (this.#mIsBig) {
            this.#mIsBig = false;
            this.mImageElement.style.left = this.#mPosX + "px";
            this.mImageElement.style.top = this.#mPosY + "px";
            this.mImageElement.style.width = this.#mSizeX + "px";
            this.mImageElement.style.height = this.#mSizeY + "px";
        } else {
            this.#mIsBig = true;
            this.mImageElement.style.left = (((window.innerWidth / 2) - (bigSizeX / 2))  + "px");
            this.mImageElement.style.top = (((window.innerHeight / 2) - (bigSizeY / 2))  + "px");
            this.mImageElement.style.width = bigSizeX + "px";
            this.mImageElement.style.height = bigSizeY + "px";
        }
    }

    setPosX(posToSet) {
        this.#mPosX = posToSet;
        this.mImageElement.style.left = this.#mPosX + "px";
    }

    setPosY(posToSet) {
        this.#mPosY = posToSet;
        this.mImageElement.style.top = this.#mPosY + "px";
    }

    setSizeX(sizeToSet) {
        this.#mSizeX = sizeToSet;
        this.mImageElement.style.width = this.#mSizeX + "px";
    }

    setSizeY(sizeToSet) {
        this.#mSizeY = sizeToSet;
        this.mImageElement.style.height = this.#mSizeY + "px";
    }

    getPosX() {
        return this.#mPosX;
    }

    getPosY() {
        return this.#mPosY;
    }

    getSizeX() {
        return this.#mSizeX;
    }

    getSizeY() {
        return this.#mSizeY;
    }

    setImgSrc(srcToSet) {
        this.#mImgSrc = srcToSet;
        this.mImageElement.src = this.#mImgSrc;
    }

    gAnimate() {
        let growX = bigSizeX / this.#mSizeX;
        let growY = bigSizeY / this.#mSizeY;
        let panX = (window.innerWidth / 2) - (this.#mPosX + (this.#mSizeX / 2))
        let panY = (window.innerHeight / 2) - (this.#mPosY + (this.#mSizeY / 2))
        return this.mImageElement.animate([
            { transform: "translateX(0px) translateY(0px) scale(1)"}, 
            { transform: "translateX(" + panX + "px) translateY(" + panY + "px) scaleX(" + growX + ") scaleY(" + growY + ")"}
        ], 250);
    }

    
}

function addNewImage(uri) {
    let currItemCol = numOfImages % numOfColumns;
    let currItemRow = (numOfImages - currItemCol) / numOfColumns;
    if (numOfImages < 25) {
        const ita = new GalleryObject(numOfImages, 
            (((imgDefaultWidth + gapBtwnImages) * currItemCol) + imgLeftOffset), 
            (((imgDefaultHeight + gapBtwnImages) * currItemRow) + imgTopOffset), 
            imgDefaultWidth, imgDefaultHeight, uri);
        aMap.set(numOfImages, ita);
        document.body.appendChild(ita.mImageElement);
        numOfImages++;
    }
}

function removeImage() {
    if (numOfImages > 0 && aMap.size > 0) {
        numOfImages--;
        const itr = aMap.get(numOfImages).mImageElement;
        document.body.removeChild(itr);
        aMap.delete(numOfImages);
    }
}

document.getElementById("click_to_add_img").addEventListener("click", () => { 
    const pickImg = document.createElement("input");
    pickImg.setAttribute("type", "file");
    pickImg.setAttribute("accept", "image/*");
    pickImg.setAttribute("multiple", "");
    pickImg.addEventListener("change", (ev) => { for (fz of ev.target.files) { addNewImage(URL.createObjectURL(fz)) } })
    pickImg.showPicker();
 });
document.getElementById("click_to_rm_img").addEventListener("click", removeImage);