const SDK_API = "/sdk";
const MATRIX_API = "/matrix";
const EXAMPLE_API = "/example";
const NS = "http://www.w3.org/2000/svg";

// Color map, kinda big
const cividis = [
    '#00204c', '#00204e', '#002150', '#002251', '#002353', '#002355', '#002456', '#002558', '#00265a', '#00265b', '#00275d', '#00285f', '#002861', '#002963', '#002a64', '#002a66', '#002b68', '#002c6a', '#002d6c', '#002d6d', '#002e6e', '#002e6f', '#002f6f', '#002f6f', '#00306f', '#00316f', '#00316f', '#00326e', '#00336e', '#00346e', '#00346e', '#01356e', '#06366e', '#0a376d', '#0e376d', '#12386d', '#15396d', '#17396d', '#1a3a6c', '#1c3b6c', '#1e3c6c', '#203c6c', '#223d6c', '#243e6c', '#263e6c', '#273f6c', '#29406b', '#2b416b', '#2c416b', '#2e426b', '#2f436b', '#31446b', '#32446b', '#33456b', '#35466b', '#36466b', '#37476b', '#38486b', '#3a496b', '#3b496b', '#3c4a6b', '#3d4b6b', '#3e4b6b', '#404c6b', '#414d6b', '#424e6b', '#434e6b', '#444f6b', '#45506b', '#46506b', '#47516b', '#48526b', '#49536b', '#4a536b', '#4b546b', '#4c556b', '#4d556b', '#4e566b', '#4f576c', '#50586c', '#51586c', '#52596c', '#535a6c', '#545a6c', '#555b6c', '#565c6c', '#575d6d', '#585d6d', '#595e6d', '#5a5f6d', '#5b5f6d', '#5c606d', '#5d616e', '#5e626e', '#5f626e', '#5f636e', '#60646e', '#61656f', '#62656f', '#63666f', '#64676f', '#65676f', '#666870', '#676970', '#686a70', '#686a70', '#696b71', '#6a6c71', '#6b6d71', '#6c6d72', '#6d6e72', '#6e6f72', '#6f6f72', '#6f7073', '#707173', '#717273', '#727274', '#737374', '#747475', '#757575', '#757575', '#767676', '#777776', '#787876', '#797877', '#7a7977', '#7b7a77', '#7b7b78', '#7c7b78', '#7d7c78', '#7e7d78', '#7f7e78', '#807e78', '#817f78', '#828078', '#838178', '#848178', '#858278', '#868378', '#878478', '#888578', '#898578', '#8a8678', '#8b8778', '#8c8878', '#8d8878', '#8e8978', '#8f8a78', '#908b78', '#918c78', '#928c78', '#938d78', '#948e78', '#958f78', '#968f77', '#979077', '#989177', '#999277', '#9a9377', '#9b9377', '#9c9477', '#9d9577', '#9e9676', '#9f9776', '#a09876', '#a19876', '#a29976', '#a39a75', '#a49b75', '#a59c75', '#a69c75', '#a79d75', '#a89e74', '#a99f74', '#aaa074', '#aba174', '#aca173', '#ada273', '#aea373', '#afa473', '#b0a572', '#b1a672', '#b2a672', '#b4a771', '#b5a871', '#b6a971', '#b7aa70', '#b8ab70', '#b9ab70', '#baac6f', '#bbad6f', '#bcae6e', '#bdaf6e', '#beb06e', '#bfb16d', '#c0b16d', '#c1b26c', '#c2b36c', '#c3b46c', '#c5b56b', '#c6b66b', '#c7b76a', '#c8b86a', '#c9b869', '#cab969', '#cbba68', '#ccbb68', '#cdbc67', '#cebd67', '#d0be66', '#d1bf66', '#d2c065', '#d3c065', '#d4c164', '#d5c263', '#d6c363', '#d7c462', '#d8c561', '#d9c661', '#dbc760', '#dcc860', '#ddc95f', '#deca5e', '#dfcb5d', '#e0cb5d', '#e1cc5c', '#e3cd5b', '#e4ce5b', '#e5cf5a', '#e6d059', '#e7d158', '#e8d257', '#e9d356', '#ebd456', '#ecd555', '#edd654', '#eed753', '#efd852', '#f0d951', '#f1da50', '#f3db4f', '#f4dc4e', '#f5dd4d', '#f6de4c', '#f7df4b', '#f9e049', '#fae048', '#fbe147', '#fce246', '#fde345', '#ffe443', '#ffe542', '#ffe642', '#ffe743', '#ffe844', '#ffe945'
]

// I know global state is bad, but since this is vanilla JS...
let appState = { 
    sdkNames: null,
    sdkSlugs: null, 
    sdkNumber: null,
    matrix: null,
    normalizedMatrix: null,
    maxQty: null, // Biggest value in raw matrix
    graphRaw: null, // Ref to svg for raw matrix
    graphNorm: null, // Ref to svg for normalized matrix
    form: null, // Ref to form
    examples: null, // ref to examples span
    X0: 20, // Where svg plot starts x
    Y0: 20, // Where svg plot starts y
    W: 20 // Cell width in graph
}

function plotCell(svgElem, x, y, txt, color, fromSlug, toSlug) {
    const r = document.createElementNS(NS, "rect");
    r.height.baseVal.value = appState.W;
    r.width.baseVal.value = appState.W;
    r.x.baseVal.value = appState.X0 + x * appState.W;
    r.y.baseVal.value = appState.Y0 + y * appState.W;
    r.style.fill = color;
    r.setAttribute('data:from', fromSlug);
    r.setAttribute('data:to', toSlug);
    svgElem.appendChild(r);
    r.addEventListener('click', onClickCell)


    const t = document.createElementNS(NS, "text");
    t.textContent = txt;
    t.setAttribute('font-size', "4pt")
    t.setAttribute("dominant-baseline", "middle")
    t.setAttribute("text-anchor", "middle");
    t.setAttribute('x', value = appState.X0 + (x + .5) * appState.W);
    t.setAttribute('y', appState.Y0 + (y + .5) * appState.W);
    t.style.fill = "white";
    svgElem.appendChild(t);
}

function plotLabel(svgElem, x, y, txt) {
    const t = document.createElementNS(NS, "text");
    t.textContent = txt;
    t.setAttribute('font-size', "3pt")
    t.setAttribute("dominant-baseline", "middle")
    t.setAttribute("text-anchor", "middle");
    const posX = value = appState.X0 + (x + .5) * appState.W;
    const posY = appState.Y0 + (y + .5) * appState.W;
    t.setAttribute('x', posX);
    t.setAttribute('y', posY);
    t.style.fill = "black";
    svgElem.appendChild(t);
}

function receiveAvailableSdks(e) {
    // Builds form
    try {
        JSON.parse(e.target.responseText).forEach(sdk => {

            const opt = document.createElement("input");
            opt.type = 'checkbox';
            opt.id = sdk.slug;
            opt.name = sdk.name;
            opt.value = sdk.slug;

            const label = document.createElement("label");
            label.for = sdk.slug;
            label.innerHTML = sdk.name;

            const div = document.createElement('div')
            appState.form.appendChild(div);
            div.appendChild(opt);
            div.appendChild(label);
        });
        reloadMatrix();
    } catch (e) {
        console.log(e)
    }
}

function receiveCompetitionMatrix(e) {
    try {
        // Create and populate matrices
        const createMatrix = (
            () => Array(appState.sdkNumber + 1).fill(null).map(
                (_) => Array(appState.sdkNumber + 1).fill(0)
            )
        )

        appState.matrix = createMatrix();
        appState.normalizedMatrix = createMatrix();

        const parseCoord = z => ( // Get the x,y position of the square, a bit hacky
            (appState.sdkSlugs.indexOf(z) + appState.sdkNumber + 1) % (appState.sdkNumber + 1)
        )

        JSON.parse(e.target.responseText).forEach(item => {
            row = parseCoord(item.from);
            col = parseCoord(item.to);
            appState.matrix[row][col] = item.count;
        });

        appState.maxQty = Math.max(...appState.matrix.map(row => Math.max(...row))) // bad if array too large

        appState.normalizedMatrix = appState.matrix.map(
            row => {
                const rowTotal = row.reduce((a, b) => a + b)
                return row.map(value => value / rowTotal)
            }
        )

        clearAll();
        const viewSize = appState.W * (appState.sdkNumber + 2);
        appState.graphRaw.setAttribute('viewBox', `0 0 ${viewSize} ${viewSize}`);
        appState.graphNorm.setAttribute('viewBox', `0 0 ${viewSize} ${viewSize}`);

        for (i=0; i<appState.sdkNumber+1; i++) {
            plotLabel(appState.graphRaw, i, -1, appState.sdkNames[i]??'None');
            plotLabel(appState.graphRaw, -1, i, appState.sdkNames[i]??'None');
            plotLabel(appState.graphNorm, i, -1, appState.sdkNames[i]??'None');
            plotLabel(appState.graphNorm, -1, i, appState.sdkNames[i]??'None');

            for (j=0; j<appState.sdkNumber+1; j++) {
                const value = appState.matrix[i][j];
                const color = cividis[parseInt((value * 255) / appState.maxQty)];
                plotCell(
                    appState.graphRaw, j, i, value, color,
                    appState.sdkSlugs[i] ?? null,
                    appState.sdkSlugs[j] ?? null
                );
                
                const normalizedValue = appState.normalizedMatrix[i][j];
                const normalizedColor = cividis[parseInt(normalizedValue * 255)];
                plotCell(
                    appState.graphNorm, j, i, (100 * normalizedValue).toFixed(1) + '%', normalizedColor,
                    appState.sdkSlugs[i] ?? null,
                    appState.sdkSlugs[j] ?? null
                );
            }
        }

    } catch (err) {
        console.log(err)
    }
}

function clearAll(){
    // inspired by https://stackoverflow.com/a/3955238/9116169
    while(appState.graphNorm.lastChild) {
        appState.graphNorm.removeChild(appState.graphNorm.lastChild);
    }
    while(appState.graphRaw.lastChild) {
        appState.graphRaw.removeChild(appState.graphRaw.lastChild);
    }

    appState.examples.innerHTML = "";
}

function reloadMatrix(event) {

    const FDA = Array.from((new FormData(appState.form)).entries());
    console.log(FDA);
    appState.sdkNames = FDA.map(x => x[0]);
    appState.sdkSlugs = FDA.map(x => x[1]);
    appState.sdkNumber = appState.sdkSlugs.length;

    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", receiveCompetitionMatrix);
    XHR.open("post", MATRIX_API);
    XHR.setRequestHeader('Content-type', 'application/json');
    XHR.send(JSON.stringify({ sdks: appState.sdkSlugs }));
}

function onClickCell(e) {
    const target = e.target;
    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", receiveExamples);
    XHR.open("post", EXAMPLE_API);
    XHR.setRequestHeader('Content-type', 'application/json');
    XHR.send(JSON.stringify({
        sdks: appState,
        fromSlug: target.getAttribute('data:from'),
        toSlug: target.getAttribute('data:to')
    }))
}

function receiveExamples(e){
    appState.examples.innerHTML = " "+JSON.parse(e.target.responseText).reduce(
        (p, c)=>p+", "+c
    )
}


function main() {
    appState.graphRaw = document.getElementById("svg-raw");
    appState.graphNorm = document.getElementById("svg-norm");
    appState.form = document.getElementById("sdk-form");
    appState.examples = document.getElementById("examples");
    appState.form.addEventListener("change", reloadMatrix);

    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", receiveAvailableSdks);
    XHR.open("get", SDK_API);
    XHR.send();
}

window.addEventListener("load", main);
