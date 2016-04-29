/*v0.2*/
function CutImage(opt){
    this.touchStartHandler = null;
    this.touchMoveHandler = null;
    this.touchEndHandler = null;
    this.timer = null;
    this.type = 0;
    this.started = false;
    this.startPoint = {x: 0, y: 0};
    this.startPoint2 = {x: 0, y: 0};
    this.currentPoint = {x: 0, y: 0};
    this.currentPoint2 = {x: 0, y: 0};
    this.cutWindowInfo = opt.cutWindowInfo;
    this.container = opt.container;
    this.sizeInfo = opt.sizeInfo;
    this.canvas = null;
    this.touchCanvas = null;
    this.threeTouchCB = opt.threeTouchCB;
    this.ctxTouchCanvas = null;
    this.imageEditor = null;
}

CutImage.prototype.init = function(){
    this.createBackground();
    this.createLayer();
    this.createTouchCanvas();
    this.initEvent();
    this.drawCutWindow(this.cutWindowInfo.x, this.cutWindowInfo.y, this.cutWindowInfo.width, this.cutWindowInfo.height);
};

CutImage.prototype.initEvent = function(){
    this.touchStartHandler = this.touchStart.bind(this);
    this.touchMoveHandler = this.touchMove.bind(this);
    this.touchEndHandler = this.touchEnd.bind(this);
    this.touchCanvas.addEventListener('touchstart', this.touchStartHandler);
    this.touchCanvas.addEventListener('touchmove', this.touchMoveHandler);
    this.touchCanvas.addEventListener('touchend', this.touchEndHandler);
    this.touchCanvas.addEventListener('touchcancel', this.touchEndHandler);
};

CutImage.prototype.touchStart = function(e){
    e.preventDefault();
    this.started = true;
    switch(e.touches.length){
        case 1://移动状态，记录初始canvas Translate值
            this.type = 0;
            break;
        case 2://缩放状态，记录两只手指初始点坐标
            this.type = 1;
            this._setPoint(this.currentPoint2, {x: e.touches[1].clientX, y: e.touches[1].clientY});
            this._setPoint(this.startPoint2, this.currentPoint2);
            break;
        case 3://裁剪
            this.type = 2;
            typeof this.threeTouchCB === 'function' && this.threeTouchCB();
            return;
    }
    this._setPoint(this.currentPoint, {x: e.touches[0].clientX, y: e.touches[0].clientY});
    this._setPoint(this.startPoint, this.currentPoint);
    this.timer = requestAnimationFrame(this._loopDrawImage.bind(this));
};

CutImage.prototype.touchMove = function(e){
    if(this.started){
        e.preventDefault();
        if(e.touches.length == 2){
            this.type = 1;
            this.currentPoint2.x = e.touches[1].clientX;
            this.currentPoint2.y = e.touches[1].clientY;
        }else{
            this.type = 0;
        }
        this.currentPoint.x = e.touches[0].clientX;
        this.currentPoint.y = e.touches[0].clientY;
    }
};

CutImage.prototype.touchEnd = function(e){
    this.started = false;
};

CutImage.prototype.createBackground = function(){
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');

    c.width = 16;
    c.height = 16;
    ctx.fillStyle = '#ccc';
    ctx.rect(0, 8, 8, 8);
    ctx.rect(8, 0, 8, 8);
    ctx.fill();
    this.container.style.backgroundColor = '#fff';
    this.container.style.backgroundRepeat = 'repeat';
    this.container.style.backgroundImage = 'url(' + c.toDataURL('image/png') + ')';
};

CutImage.prototype.createTouchCanvas = function(){
    this.touchCanvas =  this.createCanvas();
    this.touchCanvas.style.zIndex = 999;
    this.ctxTouchCanvas = this.touchCanvas.getContext('2d');
    this.container.appendChild(this.touchCanvas);
};

CutImage.prototype.initCanvas = function(c){
    c.style.position = 'absolute';
    c.style.top = '0';
    c.style.left = '0';
    c.style.width = '100%';
    c.style.height = '100%';
};

CutImage.prototype.createLayer = function(){
    this.canvas = this.createCanvas();
    this.imageEditor = new ImageEditor({
        canvas: this.canvas
    });
    this.imageEditor.setTranslate(this.canvas.width / 2, this.canvas.height / 2);
    this.container.appendChild(this.canvas);
};

CutImage.prototype.loadImage = function(img, isFitWindow){
    this.imageEditor.clearAll();
    this.imageEditor.loadImage(img).setTranslate(this.canvas.width / 2, this.canvas.height / 2);
    if(isFitWindow){
        this.imgFitWindow(img);
    }
};

CutImage.prototype.imgFitWindow = function(){
    var scale;
    var wWidth = this.cutWindowInfo.width;
    var wHeight = this.cutWindowInfo.height;
    var iWidth = this.imageEditor.img.width;
    var iHeight = this.imageEditor.img.height;

    scale = iWidth / iHeight > wWidth / wHeight
            ? wWidth / iWidth
            : wHeight / iHeight;
    this.imageEditor.setScale(scale);
};

CutImage.prototype.createCanvas = function(){
    var c = document.createElement('canvas');

    c.width = this.sizeInfo.w;
    c.height = this.sizeInfo.h;
    this.initCanvas(c);
    return c;
};

CutImage.prototype.drawCutWindow = function(x, y, w, h){
    this.ctxTouchCanvas.fillStyle = 'rgba(0,0,0,.6)';
    this.ctxTouchCanvas.rect(0, 0, this.touchCanvas.width, this.touchCanvas.height);
    this.ctxTouchCanvas.fill();
    this.ctxTouchCanvas.clearRect(x, y, w, h);
};

CutImage.prototype.getCutUrlData = function(){
    return this.getUrlData(this.cutWindowInfo.x, this.cutWindowInfo.y, this.cutWindowInfo.width, this.cutWindowInfo.height);
};

CutImage.prototype.getUrlData = function(x, y, w, h){
    return this.imageEditor.getImgUrlData(x, y, w, h);
};

CutImage.prototype._loopDrawImage = function(){
    if(this.started){
        switch(this.type){
            case 0://移动
                this.translateByPoint();
                break;
            case 1://缩放
                this.scaleByPoint();
                break;
            case 2://剪裁无需重绘
                return;
        }
        this.timer = requestAnimationFrame(this._loopDrawImage.bind(this));
    }
};

/*
* @description 将源点的坐标信息赋值给目标点
* @param tp {Point} 目标点
* @param sp {Point} 源点
*/
CutImage.prototype._setPoint = function(tp, sp){
    tp.x = sp.x;
    tp.y = sp.y;
};

CutImage.prototype.translateByPoint = function(){
    var x = this.currentPoint.x - this.startPoint.x + this.imageEditor.translate.x;
    var y = this.currentPoint.y - this.startPoint.y + this.imageEditor.translate.y;

    if(x != this.imageEditor.translate.x || y != this.imageEditor.translate.y){
        this.imageEditor.setTranslate(x, y);
        this._setPoint(this.startPoint, this.currentPoint);
    }
};

CutImage.prototype.scaleByPoint = function(){
    var scale = this.computeScale(this.startPoint, this.startPoint2, this.currentPoint, this.currentPoint2);

    if(scale != 1){
        this.imageEditor.scaleContext(scale);
        this._setPoint(this.startPoint, this.currentPoint);
        this._setPoint(this.startPoint2, this.currentPoint2);
    }
};

CutImage.prototype.computeScale = function(sp1, sp2, cp1, cp2){
    var b1 = Math.sqrt(Math.pow(sp2.x - sp1.x, 2) + Math.pow(sp2.y - sp1.y, 2));
    var b2 = Math.sqrt(Math.pow(cp2.x - cp1.x, 2) + Math.pow(cp2.y - cp1.y, 2));

    return Math.sqrt(b2 / b1);
};