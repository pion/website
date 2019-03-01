$(function() { 
})

$(window).load(function() {

    // General
    $('header, svg').addClass('visible')
    
    // Pion spinner
    var _0x39cf=['length','clone','attr','random','fromTo','node','easeInOut','50%\x2050%','360deg','push','remove','#EEEFF1','#BBBCBE','#555658','selectAll','circle'];(function(_0x435637,_0x3db3c0){var _0x164e60=function(_0x55f122){while(--_0x55f122){_0x435637['push'](_0x435637['shift']());}};_0x164e60(++_0x3db3c0);}(_0x39cf,0x17b));var _0x4999=function(_0x30ecc2,_0x20c319){_0x30ecc2=_0x30ecc2-0x0;var _0x359f5d=_0x39cf[_0x30ecc2];return _0x359f5d;};var s=new Snap('#pion-circles');var colors=['#E53935',_0x4999('0x0'),_0x4999('0x1'),'#88898B',_0x4999('0x2')];var circles=s[_0x4999('0x3')](_0x4999('0x4'));var circleGroups=[];for(var i=0x0;i<circles[_0x4999('0x5')];i+=0x1){var group=[];for(var j=0x0;j<colors['length'];j+=0x1){var c=circles[i][_0x4999('0x6')]();c[_0x4999('0x7')]({'stroke':colors[j]});var startPos=Math[_0x4999('0x8')]()*0x3e8;var endPos=Math['random']()*0x64;var startLength=0x3;var endLength=0xa+Math[_0x4999('0x8')]()*0x1e;var startLine=startPos+'\x20'+startPos+startLength;var endLine=endPos+'%\x20'+(endPos+endLength)+'%';var delay=(colors[_0x4999('0x5')]-j)/0xa;TweenMax[_0x4999('0x9')](c[_0x4999('0xa')],0x3,{'drawSVG':startLine},{'drawSVG':endLine,'delay':delay,'ease':Power2[_0x4999('0xb')],'repeat':-1,'repeatDelay':1.5,'yoyo':!![]});TweenMax['to'](c[_0x4999('0xa')],0x3,{'transformOrigin':_0x4999('0xc'),'rotation':_0x4999('0xd'),'ease':Back[_0x4999('0xb')],'delay':delay,'repeat':-1,'repeatDelay':0.1,'yoyo':!![]});group[_0x4999('0xe')](c);}circleGroups[_0x4999('0xe')](group);circles[i][_0x4999('0xf')]();}
})

$(window).scroll(function() {    
    var scroll = $(window).scrollTop()
    if (scroll >= 10) {
        $('header').addClass('shadow')
    } else {
        $('header').removeClass('shadow')
    }
})