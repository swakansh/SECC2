/*
    This JavaScript file provides the core logic for parsing an
    input boolean expression and converting it into a boolean 
    circuit.
    
    Author: Swapnil Ojha
*/

// Symbols map
const symbolsMap = {
    '.': '∧',
    '^': '∧',
    '&': '∧',
    AND: '∧',
    '+': '∨',
    '|': '∨',
    OR: '∨',
    '!': '¬',
    NOT: '¬',
    '⊻': '⊕',
    XOR: '⊕',
    XNOR: '≡',
  };

// Define precedence of operations
const precedence = {
    undefined: 7,
    '¬': 6,
    '(': 5,
    '⊕': 4,
    '≡': 3,
    '∧': 2,
    '∨': 1,
  };

const opMap = {
    '∧': 'and',
    '∨': 'or',
    '¬': 'not',
    '⊕': 'xor',
    '≡': 'xnor'
}

const triggerButton = document.getElementById('parseBtn');

const saveImgBtn = document.getElementById('saveImgBtn');

// Matches all whitespace
const spaceRegex = /\s+/g;
    
// Matches all strings of letters, numbers or other characters
const tokenRegex = /[A-Z]+|[01]+|\W/gi;

// Matches all characters that must be escaped in regex
const escapeRegex = /[-[\]{}()*+?.,\\^$|#\s]/g;

// Matches all symbols that must be replaced
const replaceRegex = new RegExp(Object.keys(symbolsMap).map(key => key.replace(escapeRegex, '\\$&')).join('|'), 'gi');

// Returns an array of all tokens in an expression
// First removes all whitespace and then replaces all symbols that need to be replaced
const tokenize = exp => exp.replace(spaceRegex, '').replace(replaceRegex, key => symbolsMap[key]).match(tokenRegex);

// Matches a string of letters
const strRegex = /[A-Z]+/i;

// Matches a string of alphanumeric characters
const alphaNum = /[A-Z01]/i;

const preprocessExpression = (expression) => { 
    /*
        This function takes an input expression and then preprocesses it
        to convert it into tokens.
    */
    const tokensFromExpression = tokenize(expression);
    return tokensFromExpression;
}

class objType {
    constructor(type, imgPath, width, height, content){
        this.type = type;
        this.imgPath = imgPath;
        this.width = width;
        this.height = height;
        this.content = content;
    }
}

const getObjType = (token) => {
    var type, imgPath, width, height, content;
    type = 1;
    width = 100;
    height = 50;
    content = token;
    if(token === '∧'){
        imgPath = 'AND';
    }
    else if(token === '∨'){
        imgPath = 'OR';
    }
    else if(token === '¬'){
        imgPath = 'NOT';
    }
    else if(token === '⊕'){
        imgPath = 'XOR';
    }
    else if(token === '≡'){
        imgPath = 'XNOR';
    }
    var obj = new objType(type, imgPath, width, height, content);
    return obj;
}

const traversePostfix = (postfix) => {
    var prettyExpression = '<br><br>';
    for(var i = 0; i < postfix.length; i++){
        prettyExpression += "[ " + postfix[i].type;
        prettyExpression += " " + postfix[i].imgPath;
        prettyExpression += " " + postfix[i].width;
        prettyExpression += " " + postfix[i].height;
        prettyExpression += " " + postfix[i].content;
        prettyExpression += " ]";
        prettyExpression += '<br>';
    }
    return prettyExpression;
}

const convertToPostfix = (infix) => {
    const postfix = [];
    const stack = [];

    infix.forEach((token) => {
        if (alphaNum.test(token)) {
            var obj = new objType(0, undefined, undefined, undefined, token);
            postfix.push(obj);
        } 
        else if (token === '(') {
            var obj = new objType(10, undefined, undefined, undefined, token);
            stack.push(obj);
        } 
        else if (token === ')') {
            let top = stack.pop();
            while (top.content !== '(' && top.content !== undefined) {
                postfix.push(top);
                top = stack.pop();
            }
        } 
        else if (stack.length === 0) {
            var obj = getObjType(token);
            stack.push(obj);
        } 
        else {
            let top = stack.length - 1;
            while (top >= 0 && stack[top].content !== '(' && precedence[stack[top].content] >= precedence[token]) {
                postfix.push(stack.pop());
                top--;
            }
            var obj = getObjType(token);
            stack.push(obj);
        }
    });
    stack.reverse();
    return postfix.concat(stack);
};

var nodes = [], edges = [], edgesID = [], cy;

const drawCircuit = (postfix, parentNode = null, node = 'A', type = null) => {
    /*
        This algo draws circuit recursively.
    */
   var current = postfix.pop();
   if(current.type == 1){
        nodes.push({ 
            data: {id: node, type: opMap[current.content]},
        });
        if(current.content === '¬'){
            drawCircuit(postfix, node, node + 'A', 1);
        }
        else{
            drawCircuit(postfix, node, node + 'A', 2);
            drawCircuit(postfix, node, node + 'B', 3);
        }
   }
   else{
        nodes.push({
            data: {id: node, type: 'text', lbl: current.content},
        });
    }
   if(parentNode !== null){
        edgesID.push({source: node, target: parentNode, type: type});
        edges.push({
            data: {source: node, target: parentNode, type: 'invisible'}
        })
   }
}

const infixToPostfix = (infix) => {
    /*
        This function takes an infix sequence of tokens and converts it 
        into a postfix expression according to the precedence of operations
        defined in precedence dictionary.
    */
    var postfixExpression = convertToPostfix(infix);

    return postfixExpression;
}

const renderAnd = (ele) => {
    const svg = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
    <path fill="none" stroke="#000" stroke-width="1" d="M70 25h25M31 15H5M32 35H5"/>
    <path d="M30 5V45H50.47619c11.267908 0 20-9.000045 20-20s-8.732091-20-20-20H30zm2.857143 2.857143H50.47619c9.760663 0 16.666667 7.639955 16.666667 17.142857 0 9.502902-7.382195 17.142857-17.142857 17.142857H32.857143V7.857143z"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const renderOr = (ele) => {
    const svg = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
    <path fill="none" stroke="#000" stroke-width="1" d="M70 25h25M31 15H5M32 35H5"/>
    <path fill-rule="evenodd" d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const renderNot = (ele) => {
    const svg = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
    <path fill="none" stroke="#000" stroke-width="1" d="M79.15691 25H95M29.043478 25h-24"/>
    <path d="M28.96875 2.59375v44.8125l2.15625-1.0625 41.03125-20v-2.6875l-41.03125-20-2.15625-1.0625zm3 4.8125L68.09375 25l-36.125 17.59375V7.40625z" style="marker:none"/>
    <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z" style="marker:none"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const renderXor = (ele) => {
    const svg = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
    <path fill="none" stroke="#000" stroke-width="1" d="M70 25h25M30.38572 15H5M31.3621 35H5"/>
    <g fill-rule="evenodd">
        <path d="M24.25 42C22.65263 44.6444 22 45 22 45h-3.65625l2-2.4375S26 35.56245 26 25 20.34375 7.4375 20.34375 7.4375l-2-2.4375H22c.78125.9375 1.42188 1.65625 2.21875 3C26.09147 11.09981 29 17.02665 29 25c0 7.95065-2.8967 13.87942-4.75 17z"/>
        <path d="M24.09375 5l2 2.4375S31.75 14.43755 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.40808 0 7.6897.02451 13.625-2.40625s12.53654-7.34327 17.6875-16.875L71.25 25l1.3125-.71875C62.25939 5.21559 46.00657 5 41.25 5H24.09375zm5.875 3H41.25c4.68417 0 18.28685-.1302 27.96875 17C64.45196 33.42907 58.69747 37.68391 53.5 39.8125 48.13934 42.00792 43.65808 42 41.25 42H30c1.87359-3.10843 4.75-9.04935 4.75-17 0-7.97335-2.90853-13.90019-4.78125-17z"/>
    </g>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

const renderXnor = (ele) => {
    const svg = `<?xml version="1.0" encoding="ISO-8859-1" standalone="no"?>
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="50">
    <path fill="none" stroke="#000" stroke-width="1" d="M78.333332 25H95M30.385717 15H5M31.362091 35H5"/>
    <g fill-rule="evenodd">
        <path d="M24.25 42.000005c-1.597374 2.6444-2.25 3-2.25 3h-3.65625l2-2.4375S26 35.562451 26 25c0-10.562451-5.65625-17.5625-5.65625-17.5625l-2-2.4375H22c.78125.9375 1.421875 1.65625 2.21875 3C26.091469 11.099815 29 17.026646 29 25c0 7.95065-2.896697 13.879425-4.75 17.000005z"/>
        <path d="M24.09375 5l2 2.4375S31.75 14.437549 31.75 25s-5.65625 17.5625-5.65625 17.5625l-2 2.4375H41.25c2.408076.000001 7.689699.024514 13.625-2.40625s12.536536-7.343266 17.6875-16.875L71.25 25l1.3125-.71875C62.259387 5.21559 46.006574 5 41.25 5H24.09375zm5.875 3H41.25c4.684173 0 18.28685-.130207 27.96875 17C64.451964 33.429075 58.697469 37.68391 53.5 39.8125 48.139339 42.007924 43.658075 42.000001 41.25 42H30c1.873588-3.108434 4.75-9.04935 4.75-17 0-7.973354-2.908531-13.900185-4.78125-17z"/>
    </g>
    <path fill="none" stroke="#000" stroke-width="3" d="M79 25a4 4 0 1 1-8 0 4 4 0 1 1 8 0z"/>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/*
    This function is used to generate random boolean expressions 
    with 0 and 1.
*/
const randomlyGenerate = () => {
    
    const doubleOp = ['AND', 'OR', 'XNOR', 'XOR'];
    const singleOp = 'NOT';

    const recursiveRandomlyGen = (len) => {
        if(len == 0){
            // Reached the base case 
            var notOrNot = Math.floor(Math.random() * 2);
            var operand = Math.floor(Math.random() * 2);
            if(notOrNot == 0){
                return operand;
            }
            else{
                return '( NOT ' + operand + ' )';
            }
        }
        var opChoice = Math.floor(Math.random() * 10);
        if(opChoice <= 5){
            // Choose a binary operation i.e AND, OR, XOR, XNOR
            var doubleOpChoice = Math.floor(Math.random() * 4);
            return  '( ' + recursiveRandomlyGen(len - 1) + ' ' + doubleOp[doubleOpChoice] + ' ' + recursiveRandomlyGen(len - 1) + ' )';
        }
        else if(opChoice <= 7){
            // Choose unary operation i.e NOT
            return '( ' + singleOp + ' ' + recursiveRandomlyGen(len - 1) + ' )';
        }
        else{
            // Choose operand 0 or 1
            var operand = Math.floor(Math.random() * 2);
            return '' + operand;
        }
    };

    // Change here to adjust the complexity of expression
    var min = 2, max = 5;

    const len = Math.floor(Math.random() * (max - min + 1)) + min;
    const expression = recursiveRandomlyGen(len);

    return expression;
}

// Get input for the expression
triggerButton.addEventListener('click', function(){
    var inputExpression = document.getElementById('inputExpression').value;
    if(inputExpression.length === 0){
        //We need to generate one expression randomly.
        inputExpression = randomlyGenerate();
        document.getElementById('inputExpression').value = inputExpression;
    }
    document.getElementById('inputExpression').value = '';
    var info_box = document.getElementById('info-box');
    var input_box = document.getElementById('input-box');
    input_box.innerHTML = '';
    info_box.innerHTML = '';
    input_box.innerHTML += '<p>The input expression is: ' + inputExpression + '</p>'; 
    const standardExpression = preprocessExpression(inputExpression);
    info_box.innerHTML += '<p>The expression in standard form is: ' + standardExpression + '</p>';
    const postfixExpression = infixToPostfix(standardExpression);
    info_box.innerHTML += '<p>The postfix expression is: ' + traversePostfix(postfixExpression) + '</p>';
    
    nodes = [], edges = [], edgesID = [];

    drawCircuit(postfixExpression);

    
    document.getElementById('oc').innerHTML = '';
    var div = document.createElement('div');
    div.id = 'cy';

    document.getElementById('oc').appendChild(div);

    cy = window.cy = cytoscape({
        container: div,
    
        boxSelectionEnabled: false,
        autounselectify: true,
    
        layout: {
          name: 'dagre',
          nodeSep: 20,
          rankDir: 'LR'
        },
    
        style: [
            {
              selector: 'node[type = "text"]',
              style: {
                  'font-size': '20px',
                  'label': 'data(lbl)',
                  'background-color': '#659dbd'
              }  
            },
            {
                selector: 'node[type = "title"]',
                style: {
                    'font-size': '30px',
                    'label': 'data(title)',
                    'background-color': '#ffffff'
                }  
            },
            {
                selector: 'node[type = "child"]',
                style: {
                    'background-color': '#659dbd',
                    width:5,
                    height:5
                }  
            },
            {
                selector: 'node[type = "indicator"]',
                style: {
                    'background-color': 'red',
                    width:5,
                    height:5
                }  
            },
            {
                selector: 'node[type = "endPoint"]',
                style: {
                    'background-color': 'black',
                    width:5,
                    height:5
                }  
            },
            {
                selector: 'node[type = "and"]',
                style: {
                    'background-image': renderAnd,
                    'background-opacity': 0,
                    'shape': 'rectangle',
                    'width': 100,
                    'height': 50
                }  
            },
            {
                selector: 'node[type = "or"]',
                style: {
                    'background-image': renderOr,
                    'background-opacity': 0,
                    'shape': 'rectangle',
                    'width': 100,
                    'height': 50
                }  
            },
            {
                selector: 'node[type = "xor"]',
                style: {
                    'background-image': renderXor,
                    'background-opacity': 0,
                    'shape': 'rectangle',
                    'width': 100,
                    'height': 50
                }  
            },
            {
                selector: 'node[type = "xnor"]',
                style: {
                    'background-image': renderXnor,
                    'background-opacity': 0,
                    'shape': 'rectangle',
                    'width': 100,
                    'height': 50
                }  
            },
            {
                selector: 'node[type = "not"]',
                style: {
                    'background-image': renderNot,
                    'background-opacity': 0,
                    'shape': 'rectangle',
                    'width': 100,
                    'height': 50
                }  
            },
            {
                selector: 'edge[type = "invisible"]',
                style: {
                    'line-color': '#ffffff',
                    'opacity': 0
                }
            },
            {
                selector: 'edge[type = "visible"]',
                style: {
                    'width': 2,
                    'line-color': '#9dbaea',
                    'curve-style': 'bezier',
                }
            }
        ],
        elements: {
            nodes: nodes,
            edges: edges
        }
    });   
    
    for(var i = 0; i < edgesID.length; i++){
        var sourcePos = cy.$('#' + edgesID[i].source).position();
        var destPos = cy.$('#' + edgesID[i].target).position();
        var type = edgesID[i].type;
        var sw = cy.$('#' + edgesID[i].source).width();
        var sh = cy.$('#' + edgesID[i].source).height();
        var sx = (sourcePos.x + sw / 2) * 0.99;
        var sy = (sourcePos.y);
        var dw = 100, dh = 50;
        var dx, dy;
        cy.add({
            group: 'nodes',
            data: { weight: 75, type: 'endPoint', id: edgesID[i].source + 'o'},
            position: { x: sx, y: sy }
        });
        if(type === 2){
            dx = (-0.95 * dw / 2) + destPos.x;
            dy = (-0.20 * dh) + destPos.y;
        }
        else if(type === 3){
            dx = (-0.95 * dw / 2) + destPos.x;
            dy = (0.20 * dh) + destPos.y;
        }
        else{
            dx = (-0.95 * dw / 2) + destPos.x;
            dy = destPos.y;
        }
        cy.add({
            group: 'nodes',
            data: { weight: 75, type: 'endPoint', id: edgesID[i].target + type},
            position: { x : dx, y : dy }
        });
        cy.add({
            group: 'edges',
            data: { source : edgesID[i].source + 'o', target : edgesID[i].target + type, type: 'visible'},
        });        
    }

    cy.add({
        group: 'nodes',
        data: {id: 'title', type: 'title', title: 'For the following circuit, what is the output: '},
        position: {x: 250, y: 15} 
    });

    cy.fit();
});

saveImgBtn.addEventListener('click', function(){
    if(cy){
        console.log("Saving the graph");
        var image = cy.png({output: 'base64uri', full: false, maxWidth: 1920, maxHeight: 1080});
        var link = document.createElement("a");
        link.setAttribute("href", image);
        link.setAttribute("download", "graph.png");
        link.click();
    }
}); 