/* =========================================================
   PROJECTS
========================================================= */

const projects =
    document.querySelectorAll(".project");


/* =========================================================
   PARALLAX — INITIAL STATE
========================================================= */

projects.forEach(project => {

    project.parallaxY = 0;

    /*
    Per i progetti con:
    data-mobile-local="true"

    il parallasse mobile parte solamente
    quando il progetto entra nel viewport.
    */

    project.mobileParallaxStarted = false;
    project.mobileStartScroll = 0;

});


/* =========================================================
   PARALLAX
========================================================= */

function animateParallax() {

    const viewportCenter =
        window.innerHeight / 2;

    const mobile =
        window.innerWidth <= 700;


    projects.forEach(project => {

        const motion =
            project.querySelector(".project-motion");

        if (!motion) return;


        /*
        Se il progetto è aperto,
        nessun parallasse.
        */

        if (
            document.body.classList.contains("project-detail-open") &&
            project.classList.contains("is-open")
        ) {

            motion.style.transform =
                "translate3d(0, 0, 0)";

            return;
        }


        /* -------------------------------------------------
           SPEED
        ------------------------------------------------- */

        const speed =
            mobile && project.dataset.mobileSpeed
                ? parseFloat(project.dataset.mobileSpeed)
                : parseFloat(project.dataset.speed) || 0.30;


        /* -------------------------------------------------
           LAG
        ------------------------------------------------- */

        const lag =
            mobile && project.dataset.mobileLag
                ? parseFloat(project.dataset.mobileLag)
                : parseFloat(project.dataset.lag) || 0.12;


        /* -------------------------------------------------
           MAX MOVEMENT
        ------------------------------------------------- */

        const max =
            mobile && project.dataset.mobileMax
                ? parseFloat(project.dataset.mobileMax)
                : parseFloat(project.dataset.max) || 0.12;


        const rect =
            project.getBoundingClientRect();


        const projectCenter =
            rect.top + rect.height / 2;


        const distance =
            viewportCenter - projectCenter;


        const maxMovement =
            window.innerWidth * max;


        let targetY = 0;


        /* =================================================
           LOCAL MOBILE PARALLAX
        ================================================= */

        const localMobileParallax =
            mobile &&
            project.dataset.mobileLocal === "true";


        if (localMobileParallax) {

            /*
            Parte quando il progetto raggiunge
            circa il 70% del viewport.
            */

            const projectIsEntering =
                rect.top < window.innerHeight * 0.70 &&
                rect.bottom > 0;


            if (
                !project.mobileParallaxStarted &&
                projectIsEntering
            ) {

                project.mobileParallaxStarted = true;

                project.mobileStartScroll =
                    window.scrollY;

                project.parallaxY = 0;

            }


            if (!project.mobileParallaxStarted) {

                targetY = 0;

            }

            else {

                const localScroll =
                    window.scrollY -
                    project.mobileStartScroll;


                targetY =
                    localScroll * speed;

            }

        }


        /* =================================================
           NORMAL PARALLAX
        ================================================= */

        else {

            targetY =
                distance * speed;

        }


        /* -------------------------------------------------
           LIMIT
        ------------------------------------------------- */

        targetY =
            Math.max(
                -maxMovement,
                Math.min(
                    maxMovement,
                    targetY
                )
            );


        /* -------------------------------------------------
           ELASTICITY / INERTIA
        ------------------------------------------------- */

        project.parallaxY +=
            (targetY - project.parallaxY) * lag;


        /* -------------------------------------------------
           APPLY
        ------------------------------------------------- */

        motion.style.transform =
            `translate3d(
                0,
                ${project.parallaxY}px,
                0
            )`;

    });


    requestAnimationFrame(
        animateParallax
    );

}


animateParallax();



/* =========================================================
   HOMEPAGE MEDIA CAROUSEL
   FOTO + VIDEO
   CAMBIO SECCO
========================================================= */

const carousels =
    document.querySelectorAll(
        ".project-visual[data-media]"
    );


carousels.forEach(
    (carousel, carouselIndex) => {


        /* -------------------------------------------------
           READ MEDIA
        ------------------------------------------------- */

        const mediaFiles =
            carousel.dataset.media
                .split("|")
                .map(file => file.trim())
                .filter(Boolean);


        if (mediaFiles.length === 0) {
            return;
        }


        /* -------------------------------------------------
           IMAGE DURATION
        ------------------------------------------------- */

        const imageDuration =
            parseInt(
                carousel.dataset.duration,
                10
            ) || 3000;


        /* -------------------------------------------------
           CHECK VIDEO
        ------------------------------------------------- */

        function isVideo(src) {

            return /\.(mp4|webm|ogg|mov)$/i.test(src);

        }


        /* -------------------------------------------------
           CREATE MEDIA
        ------------------------------------------------- */

        const mediaElements =
            mediaFiles.map(
                (src, index) => {

                    let element;


                    /* VIDEO */

                    if (isVideo(src)) {

                        element =
                            document.createElement("video");

                        element.src = src;

                        element.muted = true;
                        element.playsInline = true;
                        element.preload = "auto";
                        element.loop = false;

                    }


                    /* IMAGE */

                    else {

                        element =
                            document.createElement("img");

                        element.src = src;
                        element.alt = "";

                    }


                    if (index === 0) {

                        element.classList.add(
                            "is-active"
                        );

                    }


                    carousel.appendChild(
                        element
                    );


                    return element;

                }
            );


        /* -------------------------------------------------
           STATE
        ------------------------------------------------- */

        let currentIndex = 0;

        let imageTimer = null;
        let startTimer = null;

        let paused = false;


        /* -------------------------------------------------
           CLEAR TIMERS
        ------------------------------------------------- */

        function clearCarouselTimers() {

            if (imageTimer) {

                clearTimeout(imageTimer);

                imageTimer = null;

            }


            if (startTimer) {

                clearTimeout(startTimer);

                startTimer = null;

            }

        }


        /* -------------------------------------------------
           DEACTIVATE ALL
        ------------------------------------------------- */

        function deactivateAll() {

            mediaElements.forEach(element => {

                element.classList.remove(
                    "is-active"
                );


                if (element.tagName === "VIDEO") {

                    element.pause();

                    element.onended = null;


                    try {

                        element.currentTime = 0;

                    }

                    catch (error) {

                        // Safari può rifiutare currentTime
                        // se il video non è ancora pronto.

                    }

                }

            });

        }


        /* -------------------------------------------------
           SHOW MEDIA
        ------------------------------------------------- */

        function showMedia(index) {

            if (paused) return;


            clearTimeout(imageTimer);


            deactivateAll();


            const element =
                mediaElements[index];


            if (!element) return;


            element.classList.add(
                "is-active"
            );


            /* VIDEO */

            if (element.tagName === "VIDEO") {

                try {

                    element.currentTime = 0;

                }

                catch (error) {

                    // ignore

                }


                const playPromise =
                    element.play();


                if (playPromise !== undefined) {

                    playPromise.catch(
                        () => {}
                    );

                }


                element.onended =
                    nextMedia;

            }


            /* IMAGE */

            else {

                imageTimer =
                    setTimeout(
                        nextMedia,
                        imageDuration
                    );

            }

        }


        /* -------------------------------------------------
           NEXT MEDIA
        ------------------------------------------------- */

        function nextMedia() {

            if (paused) return;


            currentIndex =
                (currentIndex + 1) %
                mediaElements.length;


            showMedia(
                currentIndex
            );

        }


        /* -------------------------------------------------
           PAUSE HOMEPAGE CAROUSEL
        ------------------------------------------------- */

        function pauseHomepageCarousel() {

            paused = true;


            clearCarouselTimers();


            mediaElements.forEach(element => {

                if (element.tagName === "VIDEO") {

                    element.pause();

                    element.onended = null;

                }

            });

        }


        /* -------------------------------------------------
           RESUME HOMEPAGE CAROUSEL
        ------------------------------------------------- */

        function resumeHomepageCarousel() {

            paused = false;


            showMedia(
                currentIndex
            );

        }


        /*
        Espone questi comandi alla modalità
        Project Detail.
        */

        carousel.homeCarousel = {

            pause:
                pauseHomepageCarousel,

            resume:
                resumeHomepageCarousel

        };


        /* -------------------------------------------------
           START HOMEPAGE CAROUSEL
        ------------------------------------------------- */

        const startDelay =
            carouselIndex * 450;


        startTimer =
            setTimeout(
                () => {

                    showMedia(0);

                },
                startDelay
            );

    }
);



/* =========================================================
   HEADER — PARTIAL OVERLAP
========================================================= */

const headerLinks =
    document.querySelectorAll(
        ".header a"
    );


const projectVisuals =
    document.querySelectorAll(
        ".project-visual"
    );


const projectTexts =
    document.querySelectorAll(
        ".project-info, .project-detail"
    );


/* =========================================================
   PREPARE HEADER OVERLAY
========================================================= */

headerLinks.forEach(link => {

    link.dataset.originalText =
        link.textContent.trim();


    link.overlapSlices = [];

});


/* =========================================================
   GET REAL TEXT RECTANGLES
========================================================= */

function getTextRects(element) {

    const rects = [];


    /*
    display:none → nessun rettangolo.
    */

    if (!element.getClientRects().length) {

        return rects;

    }


    const range =
        document.createRange();


    range.selectNodeContents(
        element
    );


    const clientRects =
        range.getClientRects();


    for (const rect of clientRects) {

        if (
            rect.width > 0 &&
            rect.height > 0
        ) {

            rects.push(
                rect
            );

        }

    }


    return rects;

}


/* =========================================================
   RECTANGLE INTERSECTION
========================================================= */

function getIntersection(a, b) {

    const left =
        Math.max(
            a.left,
            b.left
        );


    const right =
        Math.min(
            a.right,
            b.right
        );


    const top =
        Math.max(
            a.top,
            b.top
        );


    const bottom =
        Math.min(
            a.bottom,
            b.bottom
        );


    if (
        right <= left ||
        bottom <= top
    ) {

        return null;

    }


    return {

        left,
        right,
        top,
        bottom

    };

}


/* =========================================================
   CREATE / GET HEADER SLICE
========================================================= */

function getSlice(link, index) {

    if (link.overlapSlices[index]) {

        return link.overlapSlices[index];

    }


    const slice =
        document.createElement("span");


    slice.className =
        "header-overlap-slice";


    slice.textContent =
        link.dataset.originalText;


    link.appendChild(
        slice
    );


    link.overlapSlices.push(
        slice
    );


    return slice;

}


/* =========================================================
   UPDATE HEADER OVERLAP
========================================================= */

function updateHeaderOverlap() {

    const obstacleRects = [];


    /* -------------------------------------------------
       IMAGES / VIDEOS
    ------------------------------------------------- */

    projectVisuals.forEach(element => {

        const rect =
            element.getBoundingClientRect();


        if (
            rect.width > 0 &&
            rect.height > 0
        ) {

            obstacleRects.push(
                rect
            );

        }

    });


    /* -------------------------------------------------
       TEXT
    ------------------------------------------------- */

    projectTexts.forEach(element => {

        const textRects =
            getTextRects(
                element
            );


        textRects.forEach(rect => {

            obstacleRects.push(
                rect
            );

        });

    });


    /* -------------------------------------------------
       HEADER
    ------------------------------------------------- */

    headerLinks.forEach(link => {

        const linkRect =
            link.getBoundingClientRect();


        let sliceIndex = 0;


        obstacleRects.forEach(obstacle => {

            const intersection =
                getIntersection(
                    linkRect,
                    obstacle
                );


            if (!intersection) {

                return;

            }


            const slice =
                getSlice(
                    link,
                    sliceIndex
                );


            slice.style.display =
                "block";


            const top =
                intersection.top -
                linkRect.top;


            const left =
                intersection.left -
                linkRect.left;


            const right =
                linkRect.right -
                intersection.right;


            const bottom =
                linkRect.bottom -
                intersection.bottom;


            slice.style.clipPath =
                `inset(
                    ${top}px
                    ${right}px
                    ${bottom}px
                    ${left}px
                )`;


            sliceIndex++;

        });


        /*
        Nascondiamo le copie non utilizzate.
        */

        for (
            let i = sliceIndex;
            i < link.overlapSlices.length;
            i++
        ) {

            link.overlapSlices[i]
                .style.display = "none";

        }

    });


    requestAnimationFrame(
        updateHeaderOverlap
    );

}


updateHeaderOverlap();



/* =========================================================
   PROJECT DETAIL MODE
========================================================= */

const projectInfos =
    document.querySelectorAll(
        ".project-info"
    );


const portfolioLogo =
    document.querySelector(
        ".header .logo"
    );


let openedProject = null;

let previousScrollPosition = 0;



/* =========================================================
   DETAIL CAROUSEL SETTINGS
========================================================= */

/*
VELOCITÀ DEL CAROSELLO APERTO

pixel al secondo:

80  = lento
120 = medio
180 = veloce
240 = molto veloce
300 = molto veloce / energico
*/

const detailCarouselSpeed = 180;


/*
Riferimenti all'animazione corrente.
*/

let detailCarouselAnimation = null;

let detailCarouselTrack = null;



/* =========================================================
   START DETAIL AUTO CAROUSEL
========================================================= */

function startDetailCarousel(track) {

    if (!track) return;


    /*
    Ferma eventuale precedente
    carosello detail.
    */

    if (
        detailCarouselAnimation &&
        detailCarouselTrack
    ) {

        stopDetailCarousel(
            detailCarouselTrack
        );

    }


    detailCarouselTrack =
        track;


    /* -------------------------------------------------
       PAUSE HOMEPAGE CAROUSEL
    ------------------------------------------------- */

    if (track.homeCarousel) {

        track.homeCarousel.pause();

    }


    /* -------------------------------------------------
       REMOVE POSSIBLE OLD STRIP
    ------------------------------------------------- */

    const previousStrip =
        track.querySelector(
            ".detail-carousel-strip"
        );


    if (previousStrip) {

        previousStrip.remove();

    }


    /* -------------------------------------------------
       ORIGINAL MEDIA
    ------------------------------------------------- */

    const originalMedia =
        Array.from(
            track.querySelectorAll(
                ":scope > img, :scope > video"
            )
        );


    if (originalMedia.length === 0) {

        return;

    }


    /* -------------------------------------------------
       CREATE STRIP
    ------------------------------------------------- */

    const strip =
        document.createElement(
            "div"
        );


    strip.className =
        "detail-carousel-strip";


    /*
    Sposta gli elementi originali
    nella striscia.
    */

    originalMedia.forEach(element => {

        /*
        Nessuna classe is-active necessaria
        nella modalità aperta.
        */

        element.classList.remove(
            "is-active"
        );


        strip.appendChild(
            element
        );

    });


    track.appendChild(
        strip
    );


    /* -------------------------------------------------
       PREPARE ORIGINAL VIDEOS
    ------------------------------------------------- */

    originalMedia.forEach(element => {

        if (element.tagName === "VIDEO") {

            element.muted = true;

            element.playsInline = true;

            element.loop = true;


            const playPromise =
                element.play();


            if (playPromise !== undefined) {

                playPromise.catch(
                    () => {}
                );

            }

        }

    });


    /*
    Aspettiamo due frame.

    Il primo applica il CSS,
    il secondo permette al browser
    di calcolare le larghezze reali.
    */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {


            /* =============================================
               ORIGINAL SEQUENCE WIDTH
            ============================================= */

            const originalWidth =
                originalMedia.reduce(
                    (total, element) => {

                        return (
                            total +
                            element
                                .getBoundingClientRect()
                                .width
                        );

                    },
                    0
                );


            if (originalWidth <= 0) {

                console.warn(
                    "Carousel: media width is 0."
                );

                return;

            }


            /* =============================================
               CLONE MEDIA FOR INFINITE LOOP
            ============================================= */

            let clonePasses = 0;


            /*
            Continuiamo a duplicare la sequenza
            fino ad avere abbastanza contenuto
            per riempire completamente il viewport
            durante il loop.
            */

            do {

                originalMedia.forEach(element => {

                    const clone =
                        element.cloneNode(true);


                    clone.classList.add(
                        "carousel-clone"
                    );


                    clone.classList.remove(
                        "is-active"
                    );


                    if (
                        clone.tagName === "VIDEO"
                    ) {

                        clone.muted = true;

                        clone.playsInline = true;

                        clone.loop = true;

                        clone.autoplay = true;

                    }


                    strip.appendChild(
                        clone
                    );

                });


                clonePasses++;


            }

            while (
                strip.scrollWidth <
                    track.clientWidth +
                    originalWidth
                &&
                clonePasses < 6
            );


            /* =============================================
               START CLONE VIDEOS
            ============================================= */

            strip
                .querySelectorAll(
                    "video.carousel-clone"
                )
                .forEach(video => {

                    const playPromise =
                        video.play();


                    if (
                        playPromise !==
                        undefined
                    ) {

                        playPromise.catch(
                            () => {}
                        );

                    }

                });


            /* =============================================
               ANIMATION VALUES
            ============================================= */

            let offset = 0;

            let previousTime = null;


            /* =============================================
               ANIMATION LOOP
            ============================================= */

            function animateDetailCarousel(time) {

                const project =
                    track.closest(
                        ".project"
                    );


                /*
                Se il progetto è stato chiuso,
                interrompiamo l'animazione.
                */

                if (
                    !project ||
                    !project.classList.contains(
                        "is-open"
                    )
                ) {

                    detailCarouselAnimation =
                        null;

                    return;

                }


                /*
                Primo frame.
                */

                if (
                    previousTime === null
                ) {

                    previousTime = time;

                }


                /*
                Tempo trascorso dal frame precedente,
                espresso in secondi.
                */

                const deltaTime =
                    Math.min(
                        (
                            time -
                            previousTime
                        ) / 1000,
                        0.033
                    );


                previousTime = time;


                /*
                Incremento continuo.

                È basato sul tempo,
                quindi funziona uguale
                a 60Hz e 120Hz.
                */

                offset +=
                    detailCarouselSpeed *
                    deltaTime;


                /*
                LOOP CONTINUO.

                Manteniamo solo il resto:
                nessun reset visibile.
                */

                offset =
                    offset %
                    originalWidth;


                /*
                Movimento GPU.
                */

                strip.style.transform =
                    `translate3d(
                        ${-offset}px,
                        0,
                        0
                    )`;


                detailCarouselAnimation =
                    requestAnimationFrame(
                        animateDetailCarousel
                    );

            }


            detailCarouselAnimation =
                requestAnimationFrame(
                    animateDetailCarousel
                );

        });

    });

}



/* =========================================================
   STOP DETAIL CAROUSEL
========================================================= */

function stopDetailCarousel(track) {

    /* -------------------------------------------------
       CANCEL ANIMATION
    ------------------------------------------------- */

    if (detailCarouselAnimation) {

        cancelAnimationFrame(
            detailCarouselAnimation
        );


        detailCarouselAnimation =
            null;

    }


    if (!track) {

        detailCarouselTrack =
            null;

        return;

    }


    const strip =
        track.querySelector(
            ".detail-carousel-strip"
        );


    if (strip) {

        /* -------------------------------------------------
           PAUSE VIDEOS
        ------------------------------------------------- */

        strip
            .querySelectorAll("video")
            .forEach(video => {

                video.pause();

            });


        /* -------------------------------------------------
           ORIGINAL MEDIA ONLY
        ------------------------------------------------- */

        const originals =
            Array.from(
                strip.querySelectorAll(
                    "img:not(.carousel-clone), video:not(.carousel-clone)"
                )
            );


        /*
        Riporta gli originali direttamente
        dentro .project-visual.
        */

        originals.forEach(element => {

            if (
                element.tagName === "VIDEO"
            ) {

                element.loop = false;


                try {

                    element.currentTime = 0;

                }

                catch (error) {

                    // ignore

                }

            }


            track.appendChild(
                element
            );

        });


        /*
        Eliminando la strip vengono eliminati
        automaticamente anche tutti i cloni.
        */

        strip.remove();

    }


    track.scrollLeft = 0;


    detailCarouselTrack =
        null;

}



/* =========================================================
   OPEN PROJECT
========================================================= */

function openProject(project) {

    if (!project) return;


    /*
    Evita doppia apertura.
    */

    if (
        openedProject === project
    ) {

        return;

    }


    previousScrollPosition =
        window.scrollY;


    const visual =
        project.querySelector(
            ".project-visual"
        );


    if (!visual) return;


    /* -------------------------------------------------
       SAVE ORIGINAL HEIGHT
    ------------------------------------------------- */

    const visualHeight =
        visual
            .getBoundingClientRect()
            .height;


    project.style.setProperty(
        "--detail-visual-height",
        `${visualHeight}px`
    );


    /* -------------------------------------------------
       ACTIVATE DETAIL MODE
    ------------------------------------------------- */

    document.body.classList.add(
        "project-detail-open"
    );


    project.classList.add(
        "is-open"
    );


    openedProject =
        project;


    /* -------------------------------------------------
       ACCESSIBILITY
    ------------------------------------------------- */

    const detail =
        project.querySelector(
            ".project-detail"
        );


    if (detail) {

        detail.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* -------------------------------------------------
       RESET PARALLAX
    ------------------------------------------------- */

    project.parallaxY = 0;


    const motion =
        project.querySelector(
            ".project-motion"
        );


    if (motion) {

        motion.style.transform =
            "translate3d(0, 0, 0)";

    }


    /* -------------------------------------------------
       PAGE TO TOP
    ------------------------------------------------- */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /* -------------------------------------------------
       START HORIZONTAL AUTO CAROUSEL
    ------------------------------------------------- */

    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            startDetailCarousel(
                visual
            );

        });

    });

}



/* =========================================================
   CLOSE PROJECT
========================================================= */

function closeProject() {

    if (!openedProject) return;


    const oldProject =
        openedProject;


    const visual =
        oldProject.querySelector(
            ".project-visual"
        );


    /* -------------------------------------------------
       STOP DETAIL CAROUSEL
    ------------------------------------------------- */

    stopDetailCarousel(
        visual
    );


    /* -------------------------------------------------
       HIDE DETAILS
    ------------------------------------------------- */

    const detail =
        oldProject.querySelector(
            ".project-detail"
        );


    if (detail) {

        detail.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* -------------------------------------------------
       RESTORE HOMEPAGE
    ------------------------------------------------- */

    oldProject.classList.remove(
        "is-open"
    );


    document.body.classList.remove(
        "project-detail-open"
    );


    oldProject.style.removeProperty(
        "--detail-visual-height"
    );


    openedProject =
        null;


    /* -------------------------------------------------
       RETURN TO PREVIOUS SCROLL POSITION
    ------------------------------------------------- */

    requestAnimationFrame(() => {

        window.scrollTo({

            top:
                previousScrollPosition,

            behavior:
                "auto"

        });


        /*
        Riavvia il carosello homepage
        del progetto appena chiuso.
        */

        if (
            visual &&
            visual.homeCarousel
        ) {

            visual.homeCarousel.resume();

        }

    });

}



/* =========================================================
   PROJECT INFO CLICK
========================================================= */

projectInfos.forEach(info => {

    /*
    Accessibile anche da tastiera.
    */

    info.setAttribute(
        "role",
        "button"
    );


    info.setAttribute(
        "tabindex",
        "0"
    );


    /* -------------------------------------------------
       MOUSE / TOUCH
    ------------------------------------------------- */

    info.addEventListener(
        "click",
        () => {

            const project =
                info.closest(
                    ".project"
                );


            openProject(
                project
            );

        }
    );


    /* -------------------------------------------------
       KEYBOARD
    ------------------------------------------------- */

    info.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();


                const project =
                    info.closest(
                        ".project"
                    );


                openProject(
                    project
                );

            }

        }
    );

});



/* =========================================================
   LOGO = CLOSE PROJECT
========================================================= */

if (portfolioLogo) {

    portfolioLogo.addEventListener(
        "click",
        event => {

            if (
                document.body
                    .classList
                    .contains(
                        "project-detail-open"
                    )
            ) {

                event.preventDefault();


                closeProject();

            }

        }
    );

}



/* =========================================================
   ESC = CLOSE PROJECT
========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            openedProject
        ) {

            closeProject();

        }

    }
);