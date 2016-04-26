(function(){
    function $(str){
        var objs = document.querySelectorAll(str);
        return objs.length == 1 ? objs[0] : objs;
    }

    function extend(source1, source2){
        var result = {};

        for(var key1 in source1){
            result[key1] = source1[key1];
        }
        for(var key2 in source2){
            result[key2] = result[key2] || source2[key2];
        }
        return result;
    }

    function compute(el){
        var info = JSON.parse(el.dataset['position']);
        var parentWidth = el.parentNode.offsetWidth;
        var base = info.base;
        delete info.base;
        for(var key in info){
            el.style[key] = parentWidth / base * info[key] + 'px';
        }
    }

    function loadFile(opt){
        var option = tools.extend({
            maxSize: 6 * 1024 * 1024,
            extension: ['png', 'jpg', 'jpeg'],
            errMsg: {
                maxSize: '您的图片过大<br/>请选择小于6M的照片',
                extension: '请上传png、jpg格式的照片'
            }
        }, opt);
        var fr = new FileReader();

        fr.onload = function(e){
            option.callback(e.target.result);
            hideLoader();
        };

        option.inputFile.addEventListener('change', function(e){
            if(e.target.files.length){
                if(!option.extension.some(function(o){
                        return e.target.files[0].name.split('.').reverse()[0].toLowerCase().indexOf(o) > -1
                    })){
                    alert(option.errMsg.extension);
                }else if(e.target.files[0].size > option.maxSize){
                    alert(option.errMsg.maxSize);
                }else{
                    showLoader();
                    fr.readAsDataURL(e.target.files[0]);
                }
            }
        });
        return this;
    }

    function imgFit(el){
        if(!el){return;}
        var parent = el.parentNode;
        var pWidth = window.getComputedStyle(parent).width.replace('px', '');
        var pHeight = window.getComputedStyle(parent).height.replace('px', '');
        var imgWidth;
        var imgHeight;

        if(pHeight == 0){
            return;
        }
        if(el.width / el.height > pWidth / pHeight){
            imgHeight = pHeight;
            imgWidth = pHeight * el.width / el.height;
        }else{
            imgWidth = pWidth;
            imgHeight = pWidth * el.height / el.width;
        }
        el.style.height = imgHeight + 'px';
        el.style.width = imgWidth + 'px';
        el.style.marginTop = (pHeight - imgHeight) / 2 + 'px';
        el.style.marginLeft = (pWidth - imgWidth) / 2 + 'px';
    }

    function showLoader(){
        var loader = document.createElement('div');

        loader.className = 'layer-loader';
        loader.innerHTML = '<div class="loader-box"><div class="preloader"></div></div>';
        document.body.appendChild(loader);
    }

    function hideLoader(){
        if($('.layer-loader').constructor === NodeList){
            [].forEach.call($('.layer-loader'), function(dom){
                document.body.removeChild(dom);
            });
        }else{
            document.body.removeChild($('.layer-loader'));
        }
    }

    window.$ = $;
    window.tools = {
        extend: extend,
        compute: compute,
        loadFile: loadFile,
        imgFit: imgFit,
        showLoader: showLoader,
        hideLoader: hideLoader
    };
})();
