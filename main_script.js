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

    setPosX(posToSet) {
        this.#mPosX = posToSet;
    }

    setPosY(posToSet) {
        this.#mPosY = posToSet;
    }

    setCurrPressedPosX(posToSet) {
        this.#mPosX = posToSet;
    }

    setCurrPressedPosY(posToSet) {
        this.#mCurrPressedPosX = posToSet;
    }

    setSizeX(sizeToSet) {
        this.#mCurrPressedPosY = sizeToSet;
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
    mBaseDiv;

    constructor(previewSizeX, previewSizeY) {
        this.mBaseDiv = document.createElement("div");
        this.mPreviewSizeX = previewSizeX;
        this.mPreviewSizeY = previewSizeY;
        this.mBaseDiv.setAttribute("id", "base_div");
        this.mBaseDiv.style.position = "absolute";
        this.mBaseDiv.style.top = "0px";
        this.mBaseDiv.style.left = "0px";
        this.mBaseDiv.style.zIndex = "-2";
        this.mBaseDiv.style.height = window.innerHeight + "px";
        this.mBaseDiv.style.width = window.innerWidth + "px";
        this.mBaseDiv.addEventListener("pointerdown", (ev) => { 
            const longPress = window.setTimeout(() => { this.onAddNewImage(ev.pageX, ev.pageY); }, 2000);
            window.onpointerup = function () { window.clearTimeout(longPress); }
        });
        document.body.appendChild(this.mBaseDiv);
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
        ita.style.height = this.mPreviewSizeX + "px";
        ita.style.left = posX + "px";
        ita.style.top = posY + "px";
        ita.addEventListener("dblclick", (ev) => {
            this.mImageGalleryController.onItemClicked(nid);
        })
        ita.addEventListener("pointerdown", (ev) => {
            const longPress = window.setTimeout(() => { 
                this.mImageGalleryController.enableMoveMode(nid, ev.pageX, ev.pageY); 
                console.log("PTDOWN");
            }, 2000);
            ita.onpointerup = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTUP"); }
            ita.onpointercancel = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTCANCEL"); }
            ita.onpointerleave = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTLEAVE"); }
            ita.onpointerout = (ev) => { window.clearTimeout(longPress); this.mImageGalleryController.disableMoveMode(nid); console.log("PTOUT"); }
        })
        ita.addEventListener("pointermove", (ev) => {
            this.mImageGalleryController.moveIfMoveMode(nid, ev.pageX, ev.pageY);
        })
        document.body.appendChild(ita);
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

    moveImage(nid, newX, newY) {
        const itemElement = document.getElementById(nid);
        itemElement.style.left = newX + "px";
        itemElement.style.top = newY + "px";
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

class GalleryController {
    mItemMap;
    mGallerySource;
    mGalleryView;
    mAnimateEffects;

    constructor() {
        this.mItemMap = new Map();
        this.mAnimateEffects = true;
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
    }

    disableMoveMode(nid) {
        const item = this.mItemMap.get(nid);
        item.setIsMoveMode(false);
    }

    moveIfMoveMode(nid, newPosX, newPosY) {
        const item = this.mItemMap.get(nid);
        if (item.getIsMoveMode()) {
            let diffX = newPosX - item.getCurrPressedPosX();
            let diffY = newPosY - item.getCurrPressedPosY();
            console.log(diffX + " DIFFX DIFFY " + diffY)
            item.setCurrPressedPosX(newPosX);
            item.setCurrPressedPosY(newPosY);
            item.setPosX(item.getPosX() + diffX);
            item.setPosY(item.getPosY() + diffY);
            this.mGalleryView.moveImage(nid, item.getPosX(), item.getPosY());
        }
    }

    showImage(item) {
        if (!item.mIsOpened) {
            this.mGalleryView.showImage(item.getNodeId(), item.getSizeX(), item.getSizeY());
            item.mIsOpened = true;
        } else {
            this.mGalleryView.closeImage(item.getNodeId(), item.getPosX(), item.getPosY());
            item.mIsOpened = false;
        }
    }

    onAddNewItem(fImage, clickPosX, clickPosY) {
        console.log("Add new image");
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
        this.mItemMap.delete(nid);
    }
}

const iModel = new ImageSource();
const iController = new GalleryController();
const iView = new GalleryView(100, 100);

iView.mImageGalleryController = iController;
iController.mGallerySource = iModel;
iController.mGalleryView = iView;