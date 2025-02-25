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
    getListOfImages() {
    }

    changeWallpaper(fImage) {
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

class ImageView {
    #mImageViewDiv;
    #mTitleDiv;
    #mImageNode;
    #mCloseButton;
    #mUrl;

    constructor(imgUrl, title) {
        this.#mUrl = imgUrl;
        this.#mImageViewDiv = document.createElement("div");
        this.#mImageViewDiv.style.display = "flex";
        this.#mImageViewDiv.style.flexDirection = "column";
        this.#mImageViewDiv.style.justifyContent = "center";
        this.#mImageViewDiv.style.alignItems = "center";

        this.#mImageViewDiv.style.backgroundColor = "#FFFFFF";

        this.#mTitleDiv = document.createElement("div");
        this.#mTitleDiv.textContent = title;
        this.#mTitleDiv.style.color = "#000000"
        this.#mTitleDiv.style.fontSize = "40px";
        this.#mTitleDiv.style.textAlign = "center";
        this.#mTitleDiv.style.verticalAlign = "middle";

        this.#mImageNode = document.createElement("img");
        this.#mImageNode.src = this.#mUrl;

        this.#mCloseButton = document.createElement("button");
        this.#mCloseButton.textContent = "Close Image";
        this.#mCloseButton.addEventListener("click", this.#closeImageView);

        this.#mImageViewDiv.appendChild(this.#mTitleDiv);
        this.#mImageViewDiv.appendChild(this.#mImageNode);

        this.#mImageViewDiv.appendChild(this.#mCloseButton);

        document.body.appendChild(this.#mImageViewDiv);
    }

    #closeImageView = () => {
        this.#mCloseButton.removeEventListener("click", this.#closeImageView);
        document.body.removeChild(this.#mImageViewDiv);
    }

}

class GalleryView {
    // Our Controller
    mImageGalleryController;

    // The base div, on which the images and the wallpaper are drawn
    mBaseDiv;

    // Rows and columns
    mRows;
    mCols;

    // Preview Size (X, Y) and Icon Area Size (Determined by the screen resolution)
    mPreviewSizeX;
    mPreviewSizeY;
    mIconAreaSizeX;
    mIconAreaSizeY;

    // The tracking square that shows up when moving items
    mTrackerSquare;

    mAnimatorSquare;

    // Button menu that shows up when long-pressing (mobile) or clicking on the right button
    mButtonCombo;
    mButtonComboAddItem;
    mButtonComboSettings;

    // The boolean for storing whether the menu is opened & the coordinates where the button menu shows up
    mContextMenuX;
    mContextMenuY;
    mIsContextMenuOpened;

    constructor(previewSizeX, previewSizeY) {
        // Set dimensions needed for this application
        this.mPreviewSizeX = previewSizeX;
        this.mPreviewSizeY = previewSizeY;

        this.mIsContextMenuOpened = false;
        this.mContextMenuX = 0;
        this.mContextMenuY = 0;

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

        // The animation square
        this.mAnimatorSquare = document.createElement("div");
        this.mAnimatorSquare.style.display = "none";
        this.mAnimatorSquare.style.position = "absolute";
        this.mAnimatorSquare.style.top = "0px";
        this.mAnimatorSquare.style.left = "0px";
        this.mAnimatorSquare.style.height = this.mPreviewSizeX + "px";
        this.mAnimatorSquare.style.width = this.mPreviewSizeY + "px";
        this.mAnimatorSquare.style.border = "5px solid"
        this.mAnimatorSquare.style.borderColor = "#00FFFF";
        this.mAnimatorSquare.style.color = "#FFFFFF"
        this.mBaseDiv.appendChild(this.mAnimatorSquare);

        this.mButtonCombo = document.createElement("div");
        this.mButtonCombo.style.display = "none";
        this.mButtonCombo.style.position = "absolute";
        this.mButtonCombo.style.flexDirection = "row";
        this.mButtonCombo.style.left = "0px";
        this.mButtonCombo.style.top = "0px";
        this.mButtonCombo.style.backgroundColor = "#FFFFFF";
        this.mButtonCombo.style.height = "50px";

        this.mButtonComboAddItem = document.createElement("img");
        this.mButtonComboAddItem.src =  "add_item.svg";
        this.mButtonComboAddItem.style.border = "2px solid"
        this.mButtonComboAddItem.style.borderColor = "#000000";
        this.mButtonComboAddItem.addEventListener("click", (ev) => {
            this.addNewImage(this.mContextMenuX, this.mContextMenuY);
            this.toggleContextMenu(false);
         })

        this.mButtonComboSettings = document.createElement("img");
        this.mButtonComboSettings.src =  "settings.svg";
        this.mButtonComboSettings.style.borderTop = "2px solid"
        this.mButtonComboSettings.style.borderRight = "2px solid"
        this.mButtonComboSettings.style.borderBottom = "2px solid"
        this.mButtonComboSettings.style.borderColor = "#000000";
        this.mButtonComboSettings.addEventListener("click", (ev) => {
            this.changeWallpaper();
            this.toggleContextMenu(false);
         })

        this.mButtonCombo.appendChild(this.mButtonComboAddItem);
        this.mButtonCombo.appendChild(this.mButtonComboSettings);
        document.body.appendChild(this.mButtonCombo);

        // Set the dimensions (that are constantly updated throughout the session)
        this.updateScreenDimennsions();
       
        this.mBaseDiv.addEventListener("contextmenu", (ev) => {
            ev.preventDefault();
            this.toggleContextMenu(true, ev.pageX, ev.pageY);
        });

        this.mBaseDiv.addEventListener("pointerdown", (ev) => {
            this.toggleContextMenu(false);
        })

        window.addEventListener("resize", (ev) => {
            this.updateScreenDimennsions();
         });
        document.body.appendChild(this.mBaseDiv);
    }

    toggleContextMenu(enable, posX = 0, posY = 0) {
        this.mContextMenuX = posX;
        this.mContextMenuY = posY;
        this.mButtonCombo.style.left = this.mContextMenuX + "px";
        this.mButtonCombo.style.top = this.mContextMenuY + "px";
        if (enable) {
            this.mButtonCombo.style.display = "flex";
            this.mIsContextMenuOpened = true;
        } else {
            this.mButtonCombo.style.display = "none";
            this.mIsContextMenuOpened = false;
        }
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

    addNewImage(clickPosX, clickPosY) {
        const pickImg = document.createElement("input");
        pickImg.setAttribute("type", "file");
        pickImg.setAttribute("accept", "image/*");
        pickImg.addEventListener("change", (ev) => {
            for (let fz of ev.target.files) {
            this.mImageGalleryController.onAddNewItem(fz, clickPosX, clickPosY);
            }
        })
        pickImg.showPicker();
    }

    changeWallpaper() {
        const pickImg = document.createElement("input");
        pickImg.setAttribute("type", "file");
        pickImg.setAttribute("accept", "image/*");
        pickImg.addEventListener("change", (ev) => {
            for (let fz of ev.target.files) {
            this.mImageGalleryController.onChangeWallpaper(fz);
            }
        })
        pickImg.showPicker();
    }

    doChangeWallpaper(newUrl) {
        this.mBaseDiv.style.backgroundImage = "url(\"" + newUrl + "\")";
    }

    addNewGalleryImage(nid, imgSrc, posX, posY, imgName) {
        // Item Image
        const ita = document.createElement("img");
        ita.id = nid;
        ita.src = imgSrc;
        //ita.style.position = "absolute";
        ita.style.width = this.mPreviewSizeX + "px";
        ita.style.height = this.mPreviewSizeY + "px";
        ita.style.gridColumn = Math.ceil(posX / this.mIconAreaSizeX);
        ita.style.gridRow = Math.ceil(posY / this.mIconAreaSizeY);
        ita.style.justifySelf = "center";
        //ita.style.left = posX + "px";
        //ita.style.top = posY + "px";
        ita.draggable = false;
        ita.addEventListener("dblclick", (ev) => {
            let top = ((Number(ita.style.gridRow) - 1) * this.mIconAreaSizeY);
            let left = (((Number(ita.style.gridColumn) - 1) * this.mIconAreaSizeX) + ((this.mIconAreaSizeX - this.mPreviewSizeX) / 2));

            console.log("TOP LEFT" + top + " " + left);
            this.showAnimation(left, top).finished.then(() => {
                this.mAnimatorSquare.style.top = "0px"; 
                this.mAnimatorSquare.style.left = "0px"; 
                this.mAnimatorSquare.style.display = "none";
                let g1 = new ImageView(ita.src);
            })

        });
        if (navigator.maxTouchPoints > 0) {
            ita.addEventListener("touchstart", (ev) => {
                console.log("TSTART");
                const longPress = window.setTimeout(() => {
                    this.mImageGalleryController.enableMoveMode(nid, ev.touches[0].pageX, ev.touches[0].pageY);
                    //ita.style.position = "absolute";
                }, 2000);
                ita.ontouchcancel = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); ita.style.position = ""; }
                ita.ontouchend = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); ita.style.position = ""; }
            })
            ita.addEventListener("touchmove", (ev) => {
                this.mImageGalleryController.moveIfMoveMode(nid, ev.touches[0].pageX, ev.touches[0].pageY);
            })
            ita.addEventListener("contextmenu", (ev) => { ev.preventDefault(); })
        } else {
            ita.addEventListener("mousedown", (ev) => {
                const longPress = window.setTimeout(() => {
                    let l = ev.pageX - (this.mPreviewSizeX / 2)
                    let t = ev.pageY - (this.mPreviewSizeY / 2);
                    ita.style.position = "absolute";
                    ita.style.gridRow = "";
                    ita.style.gridColumn = "";
                    ita.style.top = t + "px";
                    ita.style.left = l + "px";
                    this.mImageGalleryController.enableMoveMode(nid, l, t);
                }, 2000);
                ita.onmouseup = (ev) => { 
                    window.clearTimeout(longPress); 
                    this.mImageGalleryController.disableMoveMode(nid); 
                    ita.style.gridColumn = Math.ceil(ev.pageX / this.mIconAreaSizeX);
                    ita.style.gridRow = Math.ceil(ev.pageY / this.mIconAreaSizeY);
                    ita.style.position = "";

                    ita_t.style.gridColumn = Math.ceil(ev.pageX / this.mIconAreaSizeX);
                    ita_t.style.gridRow = Math.ceil(ev.pageY / this.mIconAreaSizeY);
                    console.log("PTC"); }
                //ita.onmouseout = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); ita.style.position = ""; console.log("PTO"); }
            })
            ita.addEventListener("mousemove", (ev) => {
                let l = ev.pageX - (this.mPreviewSizeX / 2)
                let t = ev.pageY - (this.mPreviewSizeY / 2);
                this.mImageGalleryController.moveIfMoveMode(nid, l, t);
            })
        }

        // Item Text
        const ita_t = document.createElement("div");
        ita_t.innerHTML = "<span>" + imgName + "</span>";
        ita_t.id = nid + "_text";
        ita_t.style.gridColumn = Math.ceil(posX / this.mIconAreaSizeX);
        ita_t.style.gridRow = Math.ceil(posY / this.mIconAreaSizeY);
        ita_t.style.width = this.mIconAreaSizeX + "px";
        ita_t.style.display = "flex";
        ita_t.style.height = (this.mIconAreaSizeY - (this.mPreviewSizeY)) + "px";
        ita_t.style.color = "#FFFFFF"
        ita_t.style.justifySelf = "center";
        ita_t.style.alignSelf = "end";
        ita_t.style.alignItems = "center";
        ita_t.style.justifyContent = "center";

        this.mBaseDiv.appendChild(ita);
        this.mBaseDiv.appendChild(ita_t);
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
        itemElement.style.position = "";
    }

    showImage(nid, sizeX, sizeY) {
        const itemElement = document.getElementById(nid);
        itemElement.style.position = "absolute";
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

    showAnimation(posX, posY) {
        let growX = window.innerWidth / this.mPreviewSizeX;
        let growY = window.innerHeight / this.mPreviewSizeY;
        let panX = (window.innerWidth / 2) - (posX + (this.mPreviewSizeX / 2));
        let panY = (window.innerHeight / 2) - (posY + (this.mPreviewSizeY / 2));
        this.mAnimatorSquare.style.left = posX + "px";
        this.mAnimatorSquare.style.top = posY + "px";
        this.mAnimatorSquare.style.display = "";
        return this.mAnimatorSquare.animate([
            { transform: "translateX(0px) translateY(0px) scale(1)"},
            { transform: "translateX(" + panX + "px) translateY(" + panY + "px) scaleX(" + growX + ") scaleY(" + growY + ")"}
        ], 250);
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
        const itemToDelete_TXT = document.getElementById(nid + "_text");
        this.mBaseDiv.removeChild(itemToDelete);
        this.mBaseDiv.removeChild(itemToDelete_TXT);
    }

}

class IntroView {
    #mIntroDiv;
    #mTextClock;
    #mTextSwipe;
    #mIntroX;
    #mIntroY;
    #mIntroMDown;
    #mLockStatusListener;
    #mIsUnlocked;
    #mPointerTracker;

    constructor(pointerTracker) {
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

        this.#mIntroX = 0;
        this.#mIntroY = 0;
        this.#mIntroMDown = false;
        this.#mIsUnlocked = false;

        this.#mLockStatusListener = new Set();

        this.#mPointerTracker = pointerTracker;

        this.initIntroScreen();

        document.body.appendChild(this.#mIntroDiv);

        window.setInterval(() => { this.#mTextClock.textContent = new Date().toLocaleTimeString(); }, 1000);
    }

    initIntroScreen() {
        window.addEventListener("resize", (ev) => {
            this.#mIntroDiv.style.height = window.innerHeight + "px";
            this.#mIntroDiv.style.width = window.innerWidth + "px";
        });

        if (navigator.maxTouchPoints > 0) {
            this.#mIntroDiv.addEventListener("touchstart", (ev) => { this.#mIntroMDown = true; });
            this.#mIntroDiv.addEventListener("touchmove", (ev) => {
            if (this.#mIntroMDown) {
                this.setLockscreenPosition((this.#mIntroX + (this.#mPointerTracker.getCurrentX() - this.#mPointerTracker.getPreviousX())),
                    (this.#mIntroY + (this.#mPointerTracker.getCurrentY() - this.#mPointerTracker.getPreviousY())));
   
                if ((this.#mIntroX > 300 || this.#mIntroX < -300 || this.#mIntroY > 300 || this.#mIntroY < -300) && !this.#mIsUnlocked) {
                    this.setLockscreenPosition(0, 0);
                    this.setLockStatus(false);
                    this.#mIsUnlocked = true;
                }
            }
            });
            this.#mIntroDiv.addEventListener("touchend", (ev) => {
                this.#mIntroMDown = false;
                this.setLockscreenPosition(0, 0);
            });
        } else {
            this.#mIntroDiv.addEventListener("mousedown", (ev) => { this.#mIntroMDown = true; });
            this.#mIntroDiv.addEventListener("mousemove", (ev) => {
            if (this.#mIntroMDown) {
                this.setLockscreenPosition((this.#mIntroX + (this.#mPointerTracker.getCurrentX() - this.#mPointerTracker.getPreviousX())),
                    (this.#mIntroY + (this.#mPointerTracker.getCurrentY() - this.#mPointerTracker.getPreviousY())));
   
                if ((this.#mIntroX > 300 || this.#mIntroX < -300 || this.#mIntroY > 300 || this.#mIntroY < -300) && !this.#mIsUnlocked) {
                    this.setLockStatus(false);
                    this.#mIsUnlocked = true;
                }
            }
            });
            this.#mIntroDiv.addEventListener("mouseup", (ev) => {
                this.#mIntroMDown = false;
                this.setLockscreenPosition(0, 0);
            });
        }
    }

    addLockStatusListener(lis) {
        this.#mLockStatusListener.add(lis);
    }

    removeLockStatusListener(lis) {
        this.#mLockStatusListener.delete(lis);
    }

    forceUnlock() {
        this.setLockStatus(false);
    }

    forceLock() {
        this.setLockStatus(true);
    }

    setLockStatus(lstatus) {
        if (lstatus) {
            this.setLockscreenPosition(0, 0);
            this.#mIntroDiv.style.setProperty("display", "grid");
        } else {
            this.#mIntroDiv.animate([
                { opacity: 1 },
                { opacity: 0 }
            ] , 250).finished.then(() =>
                {
                    this.#mIntroDiv.style.setProperty("display", "none");
                    this.setLockscreenPosition(0, 0);
                });
        }
    }

    setLockscreenPosition(posX, posY) {
        this.#mIntroX = posX;
        this.#mIntroY = posY;
        this.#mIntroDiv.style.setProperty("left", this.#mIntroX + "px");
        this.#mIntroDiv.style.setProperty("top", this.#mIntroY + "px");
    }
}

class PointerTracker {
    #mPrevMouseX;
    #mCurrMouseX;
    #mPrevMouseY;
    #mCurrMouseY;
    #mPointerStatus;
    #isInitialized

    #pointerEventListener = (ev) => {
        this.#mPrevMouseX = this.#mCurrMouseX;
        this.#mPrevMouseY = this.#mCurrMouseY;
        this.#mCurrMouseX = ev.pageX;
        this.#mCurrMouseY = ev.pageY;
        this.#mPointerStatus = ev.buttons;
    }

    constructor() {
        this.#mCurrMouseX = 0;
        this.#mCurrMouseY = 0;
        this.#mPrevMouseX = 0;
        this.#mPrevMouseY = 0;
        this.#isInitialized = false;
    }

    initTracker() {
        this.#isInitialized = true;
        window.addEventListener("pointermove", this.#pointerEventListener);
    }

    stopTracker() {
        this.#isInitialized = false;
        window.removeEventListener("pointermove", this.#pointerEventListener)
    }

    getPreviousX() {
        return this.#mPrevMouseX;
    }

    getPreviousY() {
        return this.#mPrevMouseY;
    }

    getCurrentX() {
        return this.#mCurrMouseX;
    }

    getCurrentY() {
        return this.#mCurrMouseY;
    }

    getPointerStatus() {
        return this.#mPointerStatus;
    }

    getIsInitialized() {
        return this.#isInitialized;
    }
}

class GalleryController {
    mItemMap;
    mGallerySource;
    mGalleryView;
    mAnimateEffects;
    mIntroView;
    mIntroMDown;
    mPointerTracker;

    constructor() {
        this.mItemMap = new Map();
        this.mAnimateEffects = true;
        this.mPointerTracker = new PointerTracker();
        this.mPointerTracker.initTracker();

        // Intro View
        this.mIntroView = new IntroView(this.mPointerTracker);
    }

    onItemClicked(nid) {
        const item = this.mItemMap.get(nid)
        this.showImage(item)
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

    enableMoveMode(nid, posX, posY) {
        const item = this.mItemMap.get(nid);
        item.setIsMoveMode(true);
        item.setPosX(posX);
        item.setPosY(posY);
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
            item.setPosX(newPosX);
            item.setPosY(newPosY);
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

    onAddNewItem(fImage, clickPosX, clickPosY) {
        this.mGallerySource.registerImage(fImage).then(
            (resultObj) => {
                const nodeName = ("image_item_" + this.mItemMap.size);
                const ita = new GalleryItem(nodeName, clickPosX, clickPosY, resultObj.mImageNaturalWidth, resultObj.mImageNaturalHeight, resultObj.mResultURL, fImage.name, "");
                this.mItemMap.set(nodeName, ita);
                this.mGalleryView.addNewGalleryImage(nodeName, resultObj.mResultURL, clickPosX, clickPosY, fImage.name);
            }, () => {
                window.alert("An error occurred while loading the image file: " + fImage.name + "!");
            }
        )
    }

    onChangeWallpaper(fImage) {
        this.mGallerySource.changeWallpaper(fImage).then(
            (resultObj) => {
                this.mGalleryView.doChangeWallpaper(resultObj.mResultURL);
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