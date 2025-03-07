# Gallery Application (Palette)

This Gallery Application (codenamed Palette) is a basic Gallery web application that displays images uploaded by the user.
This may be used as a base for developing a basic web UI.
<br/><br>

## Application Structure
- A basic MVC structure is used, where GalleryController is the controller that controls the image objects, GalleryView manages the DOM elements, and ImageSource processes the Image URI.
- ImageView class shows the image in more detail, and IntroView class is the intro screen (lockscreen).
<br/>

## How to use
### Unlock
 - Drag the lockscreen in any direction to enter the main gallery.

### Upload Images
 - On the main gallery screen, press on the mouse's right click button, and a menu will pop up. Click on the "Add" ("+") icon, and select the image that you would like to add. The image will be added to the gallery.

### Relocate Images
 - Long-click on the image that you would like to move, and a square will show up, guiding you where the image will be drop. Drag the image to the desired location, and drop the image to relocate the image.

### Delete Images
 - Long-click on the image that you would like to delete, and the square will show up. Drag the image to the bottom of the screen, and the square will turn red, signalling that the image will be deleted when dropped. 

### Show the image in detail
 - Double click on the image, and the image will be shown in its full size (may be resized, depending on the screen resolution). Click on the "Close Image" button on the image view screen to return to the Gallery main page.
