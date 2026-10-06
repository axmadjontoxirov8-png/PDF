/* =========================================================
   FileToPDF — Main JavaScript
   Image → PDF converter
   ========================================================= */

"use strict";


/* =========================================================
   ELEMENTS
   ========================================================= */

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");

const converterControls =
    document.getElementById("converterControls");

const convertButton =
    document.getElementById("convertButton");

const progressContainer =
    document.getElementById("progressContainer");

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

const pageSize =
    document.getElementById("pageSize");

const orientation =
    document.getElementById("orientation");

const imageQuality =
    document.getElementById("imageQuality");


/* =========================================================
   STATE
   ========================================================= */

let selectedFiles = [];

let objectUrls = [];


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    updateInterface();

});


/* =========================================================
   FILE INPUT
   ========================================================= */

fileInput.addEventListener("change", (event) => {

    const files = Array.from(event.target.files);

    addFiles(files);

    // Allows selecting the same file again later
    fileInput.value = "";

});


/* =========================================================
   DRAG & DROP
   ========================================================= */

dropZone.addEventListener("dragenter", (event) => {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

});


dropZone.addEventListener("dragleave", (event) => {

    if (!dropZone.contains(event.relatedTarget)) {

        dropZone.classList.remove("dragover");

    }

});


dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const files =
        Array.from(event.dataTransfer.files);

    addFiles(files);

});


/* =========================================================
   ADD FILES
   ========================================================= */

function addFiles(files) {

    if (!files || files.length === 0) {
        return;
    }


    const imageFiles = files.filter(file => {

        return file.type.startsWith("image/");

    });


    if (imageFiles.length === 0) {

        showMessage(
            "Please select image files such as JPG, PNG or WEBP.",
            "error"
        );

        return;
    }


    imageFiles.forEach(file => {

        const alreadyExists =
            selectedFiles.some(existingFile => {

                return (
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
                );

            });


        if (!alreadyExists) {

            selectedFiles.push(file);

        }

    });


    updateInterface();

}


/* =========================================================
   UPDATE INTERFACE
   ========================================================= */

function updateInterface() {

    renderFiles();

    const hasFiles =
        selectedFiles.length > 0;


    convertButton.disabled =
        !hasFiles;


    converterControls.hidden =
        !hasFiles;

}


/* =========================================================
   RENDER FILES
   ========================================================= */

function renderFiles() {

    fileList.innerHTML = "";


    clearObjectUrls();


    if (selectedFiles.length === 0) {
        return;
    }


    selectedFiles.forEach((file, index) => {

        const item =
            document.createElement("div");

        item.className = "file-item";


        /* Image preview */

        const image =
            document.createElement("img");

        image.className =
            "file-preview";


        const objectUrl =
            URL.createObjectURL(file);

        objectUrls.push(objectUrl);

        image.src =
            objectUrl;

        image.alt =
            file.name;


        /* File name */

        const name =
            document.createElement("div");

        name.className =
            "file-name";

        name.textContent =
            file.name;


        /* File size */

        const size =
            document.createElement("div");

        size.className =
            "file-size";

        size.textContent =
            formatFileSize(file.size);


        /* Remove button */

        const removeButton =
            document.createElement("button");

        removeButton.type =
            "button";

        removeButton.className =
            "remove-file";

        removeButton.innerHTML =
            "×";

        removeButton.title =
            "Remove file";


        removeButton.addEventListener(
            "click",
            () => {

                removeFile(index);

            }
        );


        item.appendChild(image);

        item.appendChild(name);

        item.appendChild(size);

        item.appendChild(removeButton);


        fileList.appendChild(item);

    });

}


/* =========================================================
   REMOVE FILE
   ========================================================= */

function removeFile(index) {

    if (
        index < 0 ||
        index >= selectedFiles.length
    ) {
        return;
    }


    selectedFiles.splice(index, 1);


    updateInterface();

}


/* =========================================================
   CLEAR OBJECT URLS
   ========================================================= */

function clearObjectUrls() {

    objectUrls.forEach(url => {

        URL.revokeObjectURL(url);

    });

    objectUrls = [];

}


/* =========================================================
   FILE SIZE
   ========================================================= */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const value =
        bytes /
        Math.pow(1024, index);


    return (
        value.toFixed(
            index === 0 ? 0 : 2
        )
        + " "
        + units[index]
    );

}


/* =========================================================
   LOAD IMAGE
   ========================================================= */

function loadImage(file) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            const url =
                URL.createObjectURL(file);


            image.onload = () => {

                URL.revokeObjectURL(url);

                resolve(image);

            };


            image.onerror = () => {

                URL.revokeObjectURL(url);

                reject(
                    new Error(
                        "Unable to load image: " +
                        file.name
                    )
                );

            };


            image.src = url;

        }
    );

}


/* =========================================================
   PAGE SIZE
   ========================================================= */

function getPageDimensions() {

    const selected =
        pageSize.value;


    const sizes = {

        a4: {
            width: 210,
            height: 297
        },

        a3: {
            width: 297,
            height: 420
        },

        letter: {
            width: 215.9,
            height: 279.4
        }

    };


    return sizes[selected] || sizes.a4;

}


/* =========================================================
   ORIENTATION
   ========================================================= */

function getOrientedPageSize() {

    const dimensions =
        getPageDimensions();


    if (
        orientation.value ===
        "landscape"
    ) {

        return {

            width:
                dimensions.height,

            height:
                dimensions.width

        };

    }


    return dimensions;

}


/* =========================================================
   IMAGE FORMAT
   ========================================================= */

function getImageFormat(file) {

    const type =
        file.type.toLowerCase();


    if (
        type === "image/png"
    ) {

        return "PNG";

    }


    if (
        type === "image/webp"
    ) {

        return "JPEG";

    }


    return "JPEG";

}


/* =========================================================
   IMAGE QUALITY
   ========================================================= */

function getImageQuality() {

    switch (imageQuality.value) {

        case "low":
            return 0.70;

        case "medium":
            return 0.85;

        case "high":
        default:
            return 0.98;

    }

}


/* =========================================================
   CREATE HIGH QUALITY CANVAS
   ========================================================= */

function prepareCanvas(
    image,
    quality
) {

    /*
       We keep the original image dimensions
       whenever possible.

       This prevents unnecessary downscaling
       and preserves image detail.
    */


    const maxDimension =
        8000;


    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;


    /*
       Extremely large images can consume
       too much browser memory.

       In that case, scale them down while
       keeping the original aspect ratio.
    */

    if (
        width > maxDimension ||
        height > maxDimension
    ) {

        const ratio =
            Math.min(
                maxDimension / width,
                maxDimension / height
            );


        width =
            Math.round(width * ratio);

        height =
            Math.round(height * ratio);

    }


    const canvas =
        document.createElement("canvas");


    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );


    /*
       Important for image quality.
    */

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";


    /*
       White background is useful
       for transparent PNG images.
    */

    context.fillStyle =
        "#ffffff";

    context.fillRect(
        0,
        0,
        width,
        height
    );


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    return {

        canvas,

        width,

        height,

        quality

    };

}


/* =========================================================
   CALCULATE FIT
   ========================================================= */

function calculateFit(
    imageWidth,
    imageHeight,
    pageWidth,
    pageHeight,
    margin
) {

    const availableWidth =
        pageWidth -
        margin * 2;


    const availableHeight =
        pageHeight -
        margin * 2;


    const ratio =
        Math.min(
            availableWidth / imageWidth,
            availableHeight / imageHeight
        );


    const width =
        imageWidth * ratio;


    const height =
        imageHeight * ratio;


    const x =
        (pageWidth - width) / 2;


    const y =
        (pageHeight - height) / 2;


    return {

        x,
        y,
        width,
        height

    };

}


/* =========================================================
   CONVERT TO PDF
   ========================================================= */

convertButton.addEventListener(
    "click",
    async () => {

        if (
            selectedFiles.length === 0
        ) {

            showMessage(
                "Please select at least one image.",
                "error"
            );

            return;
        }


        /*
           jsPDF is loaded from the CDN
           in index.html.
        */

        if (
            !window.jspdf ||
            !window.jspdf.jsPDF
        ) {

            showMessage(
                "PDF library could not be loaded. Please check your internet connection.",
                "error"
            );

            return;
        }


        const {
            jsPDF
        } = window.jspdf;


        setConvertingState(true);


        try {

            const pdf =
                new jsPDF({

                    orientation:
                        orientation.value,

                    unit: "mm",

                    format:
                        pageSize.value,

                    compress: true

                });


            const total =
                selectedFiles.length;


            for (
                let i = 0;
                i < total;
                i++
            ) {

                const file =
                    selectedFiles[i];


                /*
                   Update progress
                */

                updateProgress(
                    Math.round(
                        (i / total) * 100
                    )
                );


                const image =
                    await loadImage(file);


                /*
                   Create high quality canvas
                */

                const prepared =
                    prepareCanvas(
                        image,
                        getImageQuality()
                    );


                /*
                   Page size
                */

                const page =
                    getOrientedPageSize();


                /*
                   Margin
                */

                const margin =
                    10;


                /*
                   Calculate image position
                */

                const fit =
                    calculateFit(
                        prepared.width,
                        prepared.height,
                        page.width,
                        page.height,
                        margin
                    );


                /*
                   Get image data
                */

                let imageData;

                let format;


                if (
                    file.type ===
                    "image/png"
                ) {

                    /*
                       PNG is kept lossless.
                    */

                    imageData =
                        prepared.canvas.toDataURL(
                            "image/png"
                        );

                    format =
                        "PNG";

                } else {

                    /*
                       JPG / WEBP / other images
                       are converted to high-quality JPEG.
                    */

                    imageData =
                        prepared.canvas.toDataURL(
                            "image/jpeg",
                            getImageQuality()
                        );

                    format =
                        "JPEG";

                }


                /*
                   Add a new page for every image
                */

                if (i > 0) {

                    pdf.addPage(
                        [page.width, page.height],
                        orientation.value
                    );

                }


                /*
                   Add image
                */

                pdf.addImage(
                    imageData,
                    format,
                    fit.x,
                    fit.y,
                    fit.width,
                    fit.height,
                    undefined,
                    "FAST"
                );


                /*
                   Small delay keeps the UI responsive
                   for multiple large images.
                */

                await wait(20);

            }


            /*
               Finish progress
            */

            updateProgress(100);


            /*
               Create file name
            */

            const filename =
                createPDFFileName();


            /*
               Download
            */

            pdf.save(filename);


            showMessage(
                "Your PDF has been created successfully!",
                "success"
            );


        } catch (error) {

            console.error(
                "PDF conversion error:",
                error
            );


            showMessage(
                "Something went wrong while creating the PDF.",
                "error"
            );

        } finally {

            setConvertingState(false);

        }

    }
);


/* =========================================================
   CREATE PDF FILE NAME
   ========================================================= */

function createPDFFileName() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return (
        `FileToPDF-${year}-${month}-${day}.pdf`
    );

}


/* =========================================================
   PROGRESS
   ========================================================= */

function updateProgress(value) {

    const safeValue =
        Math.max(
            0,
            Math.min(
                100,
                value
            )
        );


    progressFill.style.width =
        safeValue + "%";


    progressPercent.textContent =
        safeValue + "%";

}


/* =========================================================
   CONVERTING STATE
   ========================================================= */

function setConvertingState(
    converting
) {

    convertButton.disabled =
        converting ||
        selectedFiles.length === 0;


    if (converting) {

        progressContainer.hidden =
            false;


        updateProgress(0);


        convertButton.querySelector(
            "span:first-child"
        ).textContent =
            "Creating PDF...";


    } else {

        progressContainer.hidden =
            true;


        convertButton.querySelector(
            "span:first-child"
        ).textContent =
            "Convert to PDF";

    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "info"
) {

    /*
       Remove existing notification
    */

    const existing =
        document.querySelector(
            ".site-message"
        );


    if (existing) {

        existing.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.className =
        "site-message";


    notification.textContent =
        message;


    /*
       Notification styles are added
       dynamically so we don't need
       another CSS file.
    */

    notification.style.position =
        "fixed";

    notification.style.left =
        "50%";

    notification.style.bottom =
        "25px";

    notification.style.transform =
        "translateX(-50%)";

    notification.style.zIndex =
        "99999";

    notification.style.padding =
        "13px 20px";

    notification.style.borderRadius =
        "12px";

    notification.style.color =
        "#ffffff";

    notification.style.fontSize =
        "13px";

    notification.style.fontWeight =
        "700";

    notification.style.boxShadow =
        "0 15px 40px rgba(15,23,42,.18)";

    notification.style.maxWidth =
        "calc(100% - 30px)";

    notification.style.textAlign =
        "center";


    if (type === "success") {

        notification.style.background =
            "#16a34a";

    } else if (type === "error") {

        notification.style.background =
            "#dc2626";

    } else {

        notification.style.background =
            "#334155";

    }


    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.style.opacity =
            "0";

        notification.style.transition =
            "opacity .25s ease";


        setTimeout(() => {

            notification.remove();

        }, 250);

    }, 3000);

}


/* =========================================================
   WAIT
   ========================================================= */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearObjectUrls();

    }
);
