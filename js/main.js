(function(){
 const nav=document.querySelector('nav'); const toggle=document.querySelector('.menu-toggle');
 if(toggle&&nav){toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.textContent=nav.classList.contains('open')?'CLOSE':'MENU'});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')))}
 const progress=document.getElementById('progress');
 const update=()=>{if(progress){const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h>0?scrollY/h*100:0)+'%'}}; addEventListener('scroll',update,{passive:true}); update();
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in-view')}),{threshold:.12}); document.querySelectorAll('section,.story-card,.timeline-item,.award-row>div').forEach(el=>io.observe(el));
 const cfg={jetsetter:'https://www.youtube.com/'}; document.querySelectorAll('[data-config-link]').forEach(a=>{const k=a.dataset.configLink;if(cfg[k]&&cfg[k]!=='#')a.href=cfg[k];});
})();
