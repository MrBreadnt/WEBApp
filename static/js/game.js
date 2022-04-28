var canvas = document.getElementById("canvas");
var lettersHolder = document.getElementById("letters");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

var vowel = ['а', 'и', 'у', 'э', 'о', 'я', 'е', 'ю', 'ы'];

ctx.font = "bold 30pt Arial";

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}
var xhr = new XMLHttpRequest();
xhr.open("POST", "", false);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify({
'request': 'get_words',
'test_id': 1
}));
if (xhr.status != 200) {
	alert(xhr.status + ': ' + xhr.statusText);
	window.location.href("/")
}
let answers = []
var res = JSON.parse(xhr.responseText);
words = res['words']
function contains(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === elem) {
            return true;
        }
    }
    return false;
}

function setLetters(word) {
	lettersHolder.innerHTML = "";
	let k = []
	word.split('').forEach(function(item, index, array) {
		var i;
		if (contains(vowel, item)){
		    k.push(index);
			i = document.createElement("input");
			i.type = "button";
			i.innerHTML = item;
			i.value = item;
			i.addEventListener("click", function(){
			    //alert(words[0]);
			    answers.push(k.findIndex(el => el == index) + 1);
                words.splice(0,1);
                if (words.length > 0){
                    setLetters(words[0][0].toUpperCase() + words[0].substring(1));
                }
                else{
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", "", false);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    xhr.send(JSON.stringify({
                    'request': 'push_answers',
                    'test_id': 1,
                    'answers': answers
                    }));
                    if (xhr.status != 200) {
                        alert(xhr.status + ': ' + xhr.statusText);
                    }
                    window.location.href = "/";
                }
                k += 1;
			});
		}else{
			i = document.createElement("div");
			i.innerHTML = item;
		}
		i.className = "letter";
		lettersHolder.appendChild(i);
	});
	/*for(let i of lettersHolder.childNodes){
		rect = i.getBoundingClientRect();
		ctx.beginPath();
		ctx.fillStyle = "#000";
		ctx.fillText(i.textContent, rect.x, rect.y + rect.height);
	}*/
}
function getFontHeight(font) {
	var parent = document.createElement("span");
    parent.appendChild(document.createTextNode("height"));
    document.body.appendChild(parent);
    parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
    var height = parent.offsetHeight;
    document.body.removeChild(parent);
    return height;
}

function getMousePos(e) {
    var r = canvas.getBoundingClientRect();
    return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
    };
}

function draw(){
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.beginPath();
	ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = "#c7b77d";
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = "#fae391";
	ctx.roundRect(40, 40, ctx.canvas.width - 80, ctx.canvas.height - 80, 20).fill()
}
setInterval(draw, 30);
setLetters(words[0][0].toUpperCase() + words[0].substring(1));

/*
var ctx = canvas.getContext('2d');
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
ctx.font = '15px sans-serif';

var mousePosition = {
  x: 0,
  y: 0
};
var mousePressed = false;

canvas.addEventListener('mousemove', function(event) {
  mousePosition.x = event.offsetX || event.layerX;
  mousePosition.y = event.offsetY || event.layerY;
});

canvas.addEventListener('mousedown', function(event) {
  mousePressed = true;
});
canvas.addEventListener('mouseup', function(event) {
  mousePressed = false;
});


CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x+r, y);
  this.arcTo(x+w, y,   x+w, y+h, r);
  this.arcTo(x+w, y+h, x,   y+h, r);
  this.arcTo(x,   y+h, x,   y,   r);
  this.arcTo(x,   y,   x+w, y,   r);
  this.closePath();
  return this;
}


function Button(x, y, w, h, text, colors, clickCB) {
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.colors = colors;
  this.text = text;

  this.state = 'default';
    
  var isClicking = false;

  this.update = function() {
    if (mousePosition.x >= this.x && mousePosition.x <= this.x + this.width &&
        mousePosition.y >= this.y && mousePosition.y <= this.y + this.height) {
      this.state = 'hover';

      if (mousePressed) {
        this.state = 'active';
          
        if (typeof clickCB === 'function' && !isClicking) {
          clickCB();
          isClicking = true;
        }
        mousePressed = false;
      }
      else {
        isClicking = false;
      }
    }
    else {
      this.state = 'default';
    }
  };

  this.draw = function() {
    ctx.save();

    var colors = this.colors[this.state];
    var halfH = this.height / 2;

    ctx.fillStyle = colors.top;
    ctx.roundRect(this.x, this.y, this.width, this.height, 15).fill();
    //ctx.fillStyle = colors.bottom;
    //ctx.roundRect(this.x, this.y + halfH, this.width, halfH, 3).fill();

    var size = ctx.measureText(this.text);
    var x = this.x + (this.width - size.width) / 2;
    var y = this.y + (this.height - 15) / 2 + 12;

    ctx.fillStyle = '#FFF';
    ctx.fillText(this.text, x, y);

    ctx.restore();
  };
}

var score = 0;
W = ctx.canvas.width;
H = ctx.canvas.height
var playButton = new Button(W / 2 - (W / 100 * 10) / 2, H / 2 - 20, (W / 100 * 10), 40, 'Play', {
  'default': {
    top: '#1879BD',
    bottom: '#084D79'
  },
  'hover': {
    top: '#678834',
    bottom: '#093905'
  },
  'active': {
    top: '#EB7723',
    bottom: '#A80000'
  }

}, function() {
  	console.log('Button clicked');
  	
});


function animate() {
  requestAnimationFrame(animate);

	ctx.beginPath();
	ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = "#c7b77d";
	ctx.fill();
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = "#fae391";
	ctx.roundRect(40, 40, ctx.canvas.width - 80, ctx.canvas.height - 80, 20).fill()
	ctx.closePath();
  playButton.update();
  playButton.draw();
}


requestAnimationFrame(animate);
*/