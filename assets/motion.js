/* Shared motion layer: custom cursor + magnetic CTAs + interlude parallax + line reveals.
   Safe on any page — selectors that match nothing are simply ignored. */
(function(){
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine){
    var dot=document.getElementById('cdot'), ring=document.getElementById('cring');
    if(dot&&ring){
      document.body.classList.add('cursor-on');
      var mx=window.innerWidth/2, my=window.innerHeight/2, rx=mx, ry=my, first=true;
      window.addEventListener('mousemove',function(e){
        mx=e.clientX; my=e.clientY;
        dot.style.transform='translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
        if(first){ rx=mx; ry=my; document.body.classList.add('ready'); first=false; }
      });
      (function raf(){
        rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18;
        ring.style.transform='translate('+rx.toFixed(2)+'px,'+ry.toFixed(2)+'px) translate(-50%,-50%) rotate(-18deg)';
        requestAnimationFrame(raf);
      })();
      document.querySelectorAll('a,button,.btn,.nav-cta,.dv-cta,.close-cta,.about-cta,.nav-lang,.rcard,.fund-row,.qh-item,.dv-col,input,textarea,[data-cursor]').forEach(function(el){
        el.addEventListener('mouseenter',function(){document.body.classList.add('hovering');});
        el.addEventListener('mouseleave',function(){document.body.classList.remove('hovering');});
      });
      var darkEls=document.querySelectorAll('.contact,.footer,.about-sticky,.principles,[data-dark]');
      if(darkEls.length){
        window.addEventListener('mousemove',function(e){
          var od=false;
          for(var i=0;i<darkEls.length;i++){var r=darkEls[i].getBoundingClientRect(); if(e.clientY>r.top&&e.clientY<r.bottom){od=true;break;}}
          document.body.classList.toggle('on-dark-cursor',od);
        });
      }
    }
    // magnetic CTAs
    document.querySelectorAll('.btn,.nav-cta,.dv-cta,.close-cta,.about-cta,.om-cta,.om-link').forEach(function(el){
      el.classList.add('magnetic');
      el.addEventListener('mousemove',function(e){
        var r=el.getBoundingClientRect();
        var x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
        el.style.transform='translate('+(x*0.28).toFixed(1)+'px,'+(y*0.4).toFixed(1)+'px)';
      });
      el.addEventListener('mouseleave',function(){ el.style.transform=''; });
    });
  }
  // scroll-driven zoom + parallax on any interlude images (alternating in / out)
  (function(){
    var ils=document.querySelectorAll('.interlude'); if(!ils.length)return;
    function upd(){
      var vh=window.innerHeight;
      ils.forEach(function(il,i){
        var bg=il.querySelector('.interlude-bg'); if(!bg)return;
        var r=il.getBoundingClientRect();
        var p=(r.top+r.height/2 - vh/2)/vh;
        var t=Math.max(0,Math.min(1,(0.72 - p)/1.44));
        var scale=(i%2===0) ? (1.05 + t*0.18) : (1.23 - t*0.18);
        bg.style.transform='translateY('+(p*-34).toFixed(1)+'px) scale('+scale.toFixed(3)+')';
      });
    }
    if(window.lenis){window.lenis.on('scroll',upd);} else {window.addEventListener('scroll',upd,{passive:true});} window.addEventListener('resize',upd); upd();
  })();
})();

/* line-by-line headline reveals (targets present only on the diversificar page) */
(function(){
  var SEL='.dv-h,.dv-stmt,.dv-map-title,.dv-remate,.dv-close h2';
  if(!document.querySelector(SEL)) return;
  function splitWords(el){
    if(el.dataset.split) return; el.dataset.split='1';
    var walker=document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes=[], n;
    while(n=walker.nextNode()) nodes.push(n);
    nodes.forEach(function(tn){
      var parent=tn.parentNode, frag=document.createDocumentFragment();
      tn.textContent.split(/(\s+)/).forEach(function(part){
        if(part==='') return;
        if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
        var w=document.createElement('span'); w.className='w';
        var wi=document.createElement('span'); wi.className='w-i'; wi.textContent=part;
        w.appendChild(wi); frag.appendChild(w);
      });
      parent.replaceChild(frag,tn);
    });
    var words=el.querySelectorAll('.w'), lastTop=null, line=-1, wl=0;
    words.forEach(function(w){
      var top=w.offsetTop;
      if(lastTop===null || Math.abs(top-lastTop)>4){ line++; lastTop=top; wl=0; }
      w.firstChild.style.transitionDelay=(line*0.18 + wl*0.08).toFixed(3)+'s';
      wl++;
    });
  }
  function setup(){
    var targets=[];
    document.querySelectorAll(SEL).forEach(function(el){
      el.classList.remove('reveal'); el.style.opacity='1'; el.style.transform='none'; splitWords(el); targets.push(el);
    });
    function check(){
      var vh=window.innerHeight;
      for(var i=targets.length-1;i>=0;i--){
        var r=targets[i].getBoundingClientRect();
        if(r.top < vh*0.9 && r.bottom > 0){ targets[i].classList.add('lines-in'); targets.splice(i,1); }
      }
    }
    if(window.lenis){window.lenis.on('scroll',check);} else {window.addEventListener('scroll',check,{passive:true});} window.addEventListener('resize',check); check();
  }
  if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(function(){ setTimeout(setup,60); }); }
  else { window.addEventListener('load',function(){ setTimeout(setup,120); }); }
})();
