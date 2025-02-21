// MVC-Model based implementation

class GalleryItem {
    #mNodeId;
    #mPosX;
    #mPosY;
    #mSizeX;
    #mSizeY;
    #mImgSrc;
    #mImageTitle;
    #mImageDescription;
    #mCurrPressedPosX;
    #mCurrPressedPosY;
    mIsOpened;
    #mIsMoveMode;
    #mFlaggedForDeletion;

    constructor (nodeId, posX, posY, sizeX, sizeY, imgSrc, imageTitle, imageDescription) {
        this.#mNodeId = nodeId;
        this.#mPosX = posX;
        this.#mPosY = posY;
        this.#mSizeX = sizeX;
        this.#mSizeY = sizeY;
        this.#mImgSrc = imgSrc;
        this.#mImageTitle = imageTitle;
        this.#mImageDescription = imageDescription;
        this.#mCurrPressedPosX = 0;
        this.#mCurrPressedPosY = 0;
        this.mIsOpened = false;
        this.#mIsMoveMode = false;
        this.#mFlaggedForDeletion = false;
    }

    setImgDescription(descToSet) {
        this.#mImageDescription = descToSet;
    }

    setImgDescription(titleToSet) {
        this.#mImageTitle = titleToSet;
    }

    setIsMoveMode(modeToSet) {
        this.#mIsMoveMode = modeToSet;
        if (!modeToSet) {
            this.#mCurrPressedPosX = 0;
            this.#mCurrPressedPosY = 0;
        }
    }

    setFlaggedForDeletion(flag) {
        this.#mFlaggedForDeletion = flag;
    }

    setPosX(posToSet) {
        this.#mPosX = posToSet;
    }

    setPosY(posToSet) {
        this.#mPosY = posToSet;
    }

    setCurrPressedPosX(posToSet) {
        this.#mCurrPressedPosX = posToSet;
    }

    setCurrPressedPosY(posToSet) {
        this.#mCurrPressedPosY = posToSet;
    }

    setSizeX(sizeToSet) {
        this.#mSizeX = sizeToSet;
    }

    setSizeY(sizeToSet) {
        this.#mSizeY = sizeToSet;
    }

    getIsMoveMode() {
        return this.#mIsMoveMode;
    }

    getNodeId() {
        return this.#mNodeId;
    }

    getPosX() {
        return this.#mPosX;
    }

    getPosY() {
        return this.#mPosY;
    }

    getCurrPressedPosX() {
        return this.#mCurrPressedPosX;
    }

    getCurrPressedPosY() {
        return this.#mCurrPressedPosY;
    }

    getFlaggedForDeletion() {
        return this.#mFlaggedForDeletion;
    }

    getSizeX() {
        return this.#mSizeX;
    }

    getSizeY() {
        return this.#mSizeY;
    }

    getSrc() {
        return this.#mImgSrc;
    }

    getImgDescription() {
        return this.#mImageDescription;
    }

    getImgTitle() {
        return this.#mImageTitle;
    }
}

class ImageSource {
    registerImage(fImage) {
        return new Promise((res, rej) => {
            // As of now, we locally check whether the file is a valid image file, get its natural height / width, and return the image's natural height and width.
            // However, in the future (if this app ever grows beyond a project for a training course), this will be handled by the backend server.
            const imageObj = new Image();
            const imageUrl = URL.createObjectURL(fImage);
            const imgLoadCb = function (ev) {
                res({ mResultURL: imageUrl, mImageNaturalWidth: imageObj.naturalWidth, mImageNaturalHeight: imageObj.naturalHeight });
            }
            const imgErrorCb = function (ev) {
                rej();
            }
            imageObj.src = imageUrl;
            imageObj.onload = imgLoadCb;
            imageObj.onerror = imgErrorCb;
        });
    }

    deleteImage(galleryItemObj) {
        URL.revokeObjectURL(galleryItemObj.mImgSrc);
        // Again, in the future, this function will send a REST API call to the server to delete the image
    }
}

class GalleryView {
    mImageGalleryController;
    mPreviewSizeX;
    mPreviewSizeY;
    mIconAreaSizeX;
    mIconAreaSizeY;
    mBaseDiv;
    mTrackerSquare;
    mRows;
    mCols;

    constructor(previewSizeX, previewSizeY) {
        // Set dimensions needed for this application
        this.mPreviewSizeX = previewSizeX;
        this.mPreviewSizeY = previewSizeY;

        // The base HTML element
        this.mBaseDiv = document.createElement("div");
        this.mBaseDiv.setAttribute("id", "base_div");
        this.mBaseDiv.style.position = "absolute";
        this.mBaseDiv.style.top = "0px";
        this.mBaseDiv.style.left = "0px";
        this.mBaseDiv.style.zIndex = "-2";
        this.mBaseDiv.style.backgroundImage = "url(\"default_bg.png\")";
        this.mBaseDiv.style.backgroundSize = "cover";
        this.mBaseDiv.style.display = "grid";

        // The tracker square (visible only when an element is being dragged)
        this.mTrackerSquare = document.createElement("div");
        this.mTrackerSquare.style.display = "none";
        this.mTrackerSquare.style.gridColumn = "1";
        this.mTrackerSquare.style.gridRow = "1";
        this.mTrackerSquare.style.border = "5px solid"
        this.mTrackerSquare.style.borderColor = "#00FFFF";
        this.mBaseDiv.appendChild(this.mTrackerSquare);

        // Set the dimensions (that are constantly updated throughout the session)
        this.updateScreenDimennsions();
        
        if (navigator.maxTouchPoints > 0) {
            this.mBaseDiv.addEventListener("contextmenu", (ev) => { 
                ev.preventDefault();
                this.onAddNewImage(ev.pageX, ev.pageY);
            });
        } else {
            this.mBaseDiv.addEventListener("mousedown", (ev) => { 
                const longPress = window.setTimeout(() => { this.onAddNewImage(ev.pageX, ev.pageY); }, 2000);
                window.onmouseup = function () { window.clearTimeout(longPress); }
            });
        }

        window.addEventListener("resize", (ev) => { 
            this.updateScreenDimennsions();
         });
        document.body.appendChild(this.mBaseDiv);
    }

    updateScreenDimennsions() {
        // Set the dimensions (that are constantly updated throughout the session)
        this.mCols = this.getOptimalCols(this.mPreviewSizeX * 1.25);
        this.mRows = this.getOptimalRows(this.mPreviewSizeY * 1.25);
        this.mIconAreaSizeX = window.innerWidth / this.mCols;
        this.mIconAreaSizeY = window.innerHeight / this.mRows;
        this.mBaseDiv.style.height = window.innerHeight + "px";
        this.mBaseDiv.style.width = window.innerWidth + "px";
        this.mBaseDiv.style.gridTemplateColumns = "repeat(" + this.mCols + ", " + this.mIconAreaSizeX + "px)";
        this.mBaseDiv.style.gridTemplateRows= "repeat(" + this.mRows + ", " + this.mIconAreaSizeY + "px)";
    }

    getOptimalCols(iWidth) {
        return (window.innerWidth - (window.innerWidth % iWidth)) / iWidth;
    }

    getOptimalRows(iHeight) {
        return (window.innerHeight - (window.innerHeight % iHeight)) / iHeight;
    }

    onAddNewImage(clickPosX, clickPosY) {
        const pickImg = document.createElement("input");
        pickImg.setAttribute("type", "file");
        pickImg.setAttribute("accept", "image/*");
        pickImg.setAttribute("multiple", "");
        pickImg.addEventListener("change", (ev) => { 
            for (let fz of ev.target.files) { 
            this.mImageGalleryController.onAddNewItem(fz, clickPosX, clickPosY);
            }
        })
        pickImg.showPicker();
    }

    addNewGalleryImage(nid, imgSrc, posX, posY) {
        const ita = document.createElement("img");
        ita.id = nid;
        ita.src = imgSrc;
        ita.style.position = "absolute";
        ita.style.width = this.mPreviewSizeX + "px";
        ita.style.height = this.mPreviewSizeY + "px";
        ita.style.left = posX + "px";
        ita.style.top = posY + "px";
        ita.draggable = false;
        ita.addEventListener("dblclick", (ev) => {
            this.mImageGalleryController.onItemClicked(nid);
        });
        if (navigator.maxTouchPoints > 0) {
            ita.addEventListener("touchstart", (ev) => {
                console.log("TSTART");
                const longPress = window.setTimeout(() => { 
                    this.mImageGalleryController.enableMoveMode(nid, ev.touches[0].pageX, ev.touches[0].pageY); 
                }, 2000);
                ita.ontouchcancel = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid);}
                ita.ontouchend = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); }
            })
            ita.addEventListener("touchmove", (ev) => {
                this.mImageGalleryController.moveIfMoveMode(nid, ev.touches[0].pageX, ev.touches[0].pageY);
            })
            ita.addEventListener("contextmenu", (ev) => { ev.preventDefault(); })
        } else {
            ita.addEventListener("mousedown", (ev) => {
                const longPress = window.setTimeout(() => { 
                    this.mImageGalleryController.enableMoveMode(nid, ev.pageX, ev.pageY); 
                }, 2000);
                ita.onmouseup = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTUP"); }
                ita.onmouseout = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTOUT"); }
            })
            ita.addEventListener("mousemove", (ev) => {
                this.mImageGalleryController.moveIfMoveMode(nid, ev.pageX, ev.pageY);
            })
        }
        document.body.appendChild(ita);
    }

    itemInDeleteZone(inDeleteZone) {
        if (inDeleteZone) {
            this.mTrackerSquare.style.borderColor = "#FF0000";
        } else {
            this.mTrackerSquare.style.borderColor = "#00FFFF";
        }
    }

    closeImage(nid, posX, posY) {
        const itemElement = document.getElementById(nid);
        itemElement.style.left = posX + "px";
        itemElement.style.top = posY + "px";
        itemElement.style.width = this.mPreviewSizeX + "px";
        itemElement.style.height = this.mPreviewSizeY + "px";
    }

    showImage(nid, sizeX, sizeY) {
        const itemElement = document.getElementById(nid);
        itemElement.style.left = (((window.innerWidth / 2) - (sizeX / 2))  + "px");
        itemElement.style.top = (((window.innerHeight / 2) - (sizeY / 2))  + "px");
        itemElement.style.width = sizeX + "px";
        itemElement.style.height = sizeY + "px";
    }

    startMoveImage(newX, newY) {
        this.mTrackerSquare.style.gridColumn = Math.ceil(newX / this.mIconAreaSizeX);
        this.mTrackerSquare.style.gridRow = Math.ceil(newY / this.mIconAreaSizeY);
        this.mTrackerSquare.style.display = "";
    }

    moveImage(nid, newX, newY) {
        const itemElement = document.getElementById(nid);
        this.mTrackerSquare.style.gridColumn = Math.ceil(newX / this.mIconAreaSizeX);
        this.mTrackerSquare.style.gridRow = Math.ceil(newY / this.mIconAreaSizeY);
        itemElement.style.left = newX + "px";
        itemElement.style.top = newY + "px";
    }

    moveImageEnd() {
        this.mTrackerSquare.style.display = "none";
        this.mTrackerSquare.style.gridColumn = "1";
        this.mTrackerSquare.style.gridRow = "1";
    }

    setBlurEffect(onoff) {
        if (onoff) {
            this.mBaseDiv.style.filter = "blur(1.0rem)"
        } else {
            this.mBaseDiv.style.filter = ""
        }
    }

    animateItem(nid, sizeX, sizeY, posX, posY) {
        const itemElement = document.getElementById(nid);
        let growX = sizeX / this.mPreviewSizeX;
        let growY = sizeY / this.mPreviewSizeY;
        let panX = (window.innerWidth / 2) - (posX + (this.mPreviewSizeX / 2))
        let panY = (window.innerHeight / 2) - (posY + (this.mPreviewSizeY / 2))
        return itemElement.animate([
            { transform: "translateX(0px) translateY(0px) scale(1)"},
            { transform: "translateX(" + panX + "px) translateY(" + panY + "px) scaleX(" + growX + ") scaleY(" + growY + ")"}
        ], 250);
    }

    deleteItem(nid) {
        const itemToDelete = document.getElementById(nid);
        document.body.removeChild(itemToDelete);
    }

}

class IntroView {
    #mIntroDiv;
    #mTextClock;
    #mTextSwipe;

    constructor() {
        this.#mIntroDiv = document.createElement("div");
        this.#mIntroDiv.setAttribute("id", "intro_div");
        this.#mIntroDiv.style.position = "absolute";
        this.#mIntroDiv.style.top = "0px";
        this.#mIntroDiv.style.left = "0px";
        this.#mIntroDiv.style.backgroundImage = "url(\"lockscreen_default_bg.png\")";
        this.#mIntroDiv.style.backgroundSize = "cover";
        this.#mIntroDiv.style.height = window.innerHeight + "px";
        this.#mIntroDiv.style.width = window.innerWidth + "px";

        this.#mTextClock = document.createElement("h1");
        this.#mTextClock.textContent = "Gallery Application"
        this.#mTextClock.style.color = "#FFFFFF"
        this.#mTextClock.style.fontSize = "60px";
        this.#mTextClock.style.textAlign = "center";
        this.#mTextClock.style.verticalAlign = "middle";

        this.#mTextSwipe = document.createElement("h1");
        this.#mTextSwipe.textContent = "Swipe in any direction to unlock"
        this.#mTextSwipe.style.color = "#FFFFFF"
        this.#mTextSwipe.style.fontSize = "40px";
        this.#mTextSwipe.style.textAlign = "center";
        this.#mTextSwipe.style.verticalAlign = "middle";

        this.#mIntroDiv.style.display = "grid";
        this.#mIntroDiv.style.justifyContent = "center";
        this.#mIntroDiv.style.alignItems = "center";

        this.#mIntroDiv.appendChild(this.#mTextClock);
        this.#mIntroDiv.appendChild(this.#mTextSwipe);

        window.addEventListener("resize", (ev) => {
            this.#mIntroDiv.style.height = window.innerHeight + "px";
            this.#mIntroDiv.style.width = window.innerWidth + "px";
        });

        document.body.appendChild(this.#mIntroDiv);

        window.setInterval(() => { this.#mTextClock.textContent = new Date().toLocaleTimeString(); }, 1000);
    }

    addEventListenerForScreen(eventname, callback) {
        this.#mIntroDiv.addEventListener(eventname, callback);
    }

    removeEventListenerForScreen(eventname, callback) {
        this.#mIntroDiv.removeEventListener(eventname, callback);
    }

    setParametersForFirstText(key, value) {
        this.#mTextClock.style.setProperty(key, value);
    }

    setParametersForSecondText(key, value) {
        this.#mTextSwipe.style.setProperty(key, value);
    }

    setParametersForScreen(key, value) {
        this.#mIntroDiv.style.setProperty(key, value);
    }

    setVisibility(isVisible) {
        if (isVisible) {
            this.#mIntroDiv.style.setProperty("display", "grid");
        } else {
            this.#mIntroDiv.animate([
                { opacity: 1 },
                { opacity: 0 }
            ] , 250).finished.then(() => {this.#mIntroDiv.style.setProperty("display", "none");});
        }
    }
}

class GalleryController {
    mItemMap;
    mGallerySource;
    mGalleryView;
    mAnimateEffects;
    prevMouseX;
    currMouseX;
    prevMouseY;
    currMouseY;
    introX;
    introY;
    mIntroView;
    mIntroMDown;
    mIsUnlocked;

    constructor() {
        this.mItemMap = new Map();
        this.mAnimateEffects = true;
        this.mIsUnlocked = false;
        // Mouse coordinates
        this.prevMouseX = 0;
        this.currMouseX = 0;
        this.prevMouseY = 0;
        this.currMouseY = 0;
        window.addEventListener("pointermove", (ev) => { 
            this.prevMouseX = this.currMouseX; 
            this.prevMouseY = this.currMouseY; 
            this.currMouseX = ev.clientX; 
            this.currMouseY = ev.clientY; 
        });

        // Intro View
        this.mIntroView = new IntroView();
        this.introX = 0;
        this.introY = 0;
        this.mIntroMDown = false;

        this.mIntroView.addEventListenerForScreen("mousedown", (ev) => { this.mIntroMDown = true; });
        this.mIntroView.addEventListenerForScreen("mousemove", (ev) => { 
        if (this.mIntroMDown) {
            this.introX = this.introX + (this.currMouseX - this.prevMouseX);
            this.introY = this.introY + (this.currMouseY - this.prevMouseY);
            this.mIntroView.setParametersForScreen("left", this.introX + "px"); 
            this.mIntroView.setParametersForScreen("top", this.introY + "px"); 

            if ((this.introX > 300 || this.introX < -300 || this.introY > 300 || this.introY < -300) && !this.mIsUnlocked) {
                this.mIsUnlocked = true;
                this.introX = 0;
                this.introY = 0;
                this.mIntroView.setParametersForScreen("left", this.introX + "px"); 
                this.mIntroView.setParametersForScreen("top", this.introY + "px"); 
                this.mIntroView.setVisibility(false);
            }
        } 
        });
        this.mIntroView.addEventListenerForScreen("mouseup", (ev) => { 
            this.mIntroMDown = false; 
            this.introX = 0;
            this.introY = 0;
            this.mIntroView.setParametersForScreen("left", this.introX + "px"); 
            this.mIntroView.setParametersForScreen("top", this.introY + "px"); 
        });
    }

    onItemClicked(nid) {
        const item = this.mItemMap.get(nid)
        if ((!item.mIsOpened) && this.mAnimateEffects) {
            this.mGalleryView.animateItem(item.getNodeId(), item.getSizeX(), item.getSizeY(), item.getPosX(), item.getPosY()).finished.then(() => {this.showImage(item);})
        } else {
            this.showImage(item)
        }
    }

    enableMoveMode(nid, posX, posY) {
        const item = this.mItemMap.get(nid);
        item.setIsMoveMode(true);
        item.setCurrPressedPosX(posX);
        item.setCurrPressedPosY(posY);
        this.mGalleryView.startMoveImage(posX, posY);
    }

    disableMoveMode(nid) {
        const item = this.mItemMap.get(nid);
        if (item.getIsMoveMode()) {
            item.setIsMoveMode(false);
            this.mGalleryView.moveImageEnd();
            this.mGalleryView.itemInDeleteZone(false);
            if (item.getFlaggedForDeletion()) {
                this.onRemoveItem(item.getNodeId());
            }
            console.log("end move mode");
        }
    }

    moveIfMoveMode(nid, newPosX, newPosY) {
        const item = this.mItemMap.get(nid);
        if (item.getIsMoveMode()) {
            let diffX = newPosX - item.getCurrPressedPosX();
            let diffY = newPosY - item.getCurrPressedPosY();
            item.setCurrPressedPosX(newPosX);
            item.setCurrPressedPosY(newPosY);
            item.setPosX(item.getPosX() + diffX);
            item.setPosY(item.getPosY() + diffY);
            this.mGalleryView.moveImage(nid, item.getPosX(), item.getPosY());
            if (window.innerHeight - item.getPosY() < 100) {
                this.mGalleryView.itemInDeleteZone(true);
                item.setFlaggedForDeletion(true);
            } else {
                this.mGalleryView.itemInDeleteZone(false);
                item.setFlaggedForDeletion(false);
            }
        }
    }

    showImage(item) {
        if (!item.mIsOpened) {
            this.mGalleryView.showImage(item.getNodeId(), item.getSizeX(), item.getSizeY());
            this.mGalleryView.setBlurEffect(true)
            item.mIsOpened = true;
        } else {
            this.mGalleryView.closeImage(item.getNodeId(), item.getPosX(), item.getPosY());
            this.mGalleryView.setBlurEffect(false)
            item.mIsOpened = false;
        }
    }

    onAddNewItem(fImage, clickPosX, clickPosY) {
        this.mGallerySource.registerImage(fImage).then(
            (resultObj) => {
                const nodeName = ("image_item_" + this.mItemMap.size);
                const ita = new GalleryItem(nodeName, clickPosX, clickPosY, resultObj.mImageNaturalWidth, resultObj.mImageNaturalHeight, resultObj.mResultURL, fImage.name, "");
                this.mItemMap.set(nodeName, ita);
                this.mGalleryView.addNewGalleryImage(nodeName, resultObj.mResultURL, clickPosX, clickPosY);
            }, () => {
                window.alert("An error occurred while loading the image file: " + fImage.name + "!");
            }
        )
    }

    onRemoveItem(nid) {
        const itemToDelete = this.mItemMap.get(nid);
        this.mGallerySource.deleteImage(itemToDelete);
        this.mGalleryView.deleteItem(nid);
        this.mItemMap.delete(nid);
    }
}

const iModel = new ImageSource();
const iController = new GalleryController();
const iView = new GalleryView(150, 150);

iView.mImageGalleryController = iController;
iController.mGallerySource = iModel;
iController.mGalleryView = iView;