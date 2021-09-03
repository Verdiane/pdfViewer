const url = 'sample.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5,
    canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d');

//render page
const renderPage = num => {
    pageIsRendering = true;
    //to get the page
    pdfDoc.getPage(num).then(page => {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext : ctx,
            viewport 
        };

        page.render(renderContext).promise.then(() => {
            pageIsRendering = false;

            if(pageNumIsPending !== null){
                renderPage(pageNumIsPending);
                pageNumIsPending = null;
            }
        })

        //output current page
        document.querySelector('#page-num').textContent = num;
    });
};

//check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering){
        pageNumIsPending = num;
    }else{
        renderPage(num);
    }
}

//show prev page
const showPrevPage = () => {
    if (pageNum <= 1){
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

//show Next page
const showNextPage = () => {
    if (pageNum >= pdfDoc.numPages){
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

//Get document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
 
    pdfDoc = pdfDoc_;

    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
})
.catch(err => {
    //display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);

    //remove top bar
    document.querySelector('.top-bar').style.display = 'none';
}); 

//events to manipulate the buttons
document.querySelector('#prev-page').addEventListener('click', showPrevPage);

document.querySelector('#next-page').addEventListener('click', showNextPage);
