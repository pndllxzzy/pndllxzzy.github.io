/*v0.2*/
function ImageEditor (opt){
    this.canvas = opt.canvas;
    this.cWidth = this.canvas.width;
    this.cHeight = this.canvas.height;
    this.ctx = this.canvas.getContext('2d');
    this.img = null;
    this.translate = {x: 0, y: 0};
    this.scale = 1;
    this.rotate = 0;
}

ImageEditor.prototype.scaleContext = function(num){
    this.scale *= num;
    this.ctx.scale(num, num);
    this.clearAll()._drawImage();
    return this;
};

//重置放大倍数
ImageEditor.prototype.setScale = function(num){
    this.scale = num;
    this._reDrawImage();
    return this;
};

ImageEditor.prototype.translateContext = function(x, y){
    this.translate.x += x;
    this.translate.y += y;
    this.ctx.translate(x, y);
    this.clearAll()._drawImage();
    return this;
};

ImageEditor.prototype.setTranslate = function(x, y){
    this.translate.x = x;
    this.translate.y = y;
    this._reDrawImage();
    return this;
};

ImageEditor.prototype.rotateContext = function(deg){
    this.rotate += deg;
    this.ctx.rotate(deg / 180 * Math.PI);
    this.clearAll()._drawImage();
    return this;
};

ImageEditor.prototype.setRotate = function(deg){
    this.rotate = deg;
    this._reDrawImage();
    return this;
};

ImageEditor.prototype.clearRect = function(sx, sy, w, h){
    this.ctx.clearRect(sx, sy, w, h);
    return this;
};

ImageEditor.prototype.clearAll = function(){
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);
    this.ctx.restore();
    return this;
};

ImageEditor.prototype.loadImage = function(img){
    this.img = img;
    this._drawImage(img);
    return this;
};

ImageEditor.prototype._drawImage = function(){
    if(this.img) {
        this.ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
    }
    return this;
};

ImageEditor.prototype._reDrawImage = function(){
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.translate(this.translate.x, this.translate.y);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.rotate(this.rotate / 180 * Math.PI);
    this.clearAll()._drawImage();
    return this;
};

ImageEditor.prototype.getImgUrlData = function(sx, sy, width, height){
    var c = document.createElement('canvas');
    var imgData;

    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    imgData = this.ctx.getImageData(sx, sy, width, height);
    this.ctx.restore();

    c.width = width;
    c.height = height;
    c.getContext('2d').putImageData(imgData, 0, 0);

    return c.toDataURL('image/png');
};