'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function MobileMotionStabilizer(){
  useEffect(()=>{
    if(typeof window==='undefined') return;
    const mobile=window.matchMedia?.('(max-width: 760px)')?.matches??false;
    if(!mobile) return;

    const site=document.querySelector('.static-reference-site');
    if(!site) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ignoreMobileResize:true});

    const hero=site.querySelector('.ref-hero');
    const heroBottle=site.querySelector('.ref-hero-bottle');
    const jointTarget=site.querySelector('.ref-joint-target');
    const mensBottle=site.querySelector('.ref-mens-moving');
    const mensSource=mensBottle?.closest('article');
    const featureVisual=site.querySelector('.ref-feature-visual');
    const handsTarget=site.querySelector('.ref-mens-hands-target');
    if(!hero||!heroBottle||!jointTarget||!mensBottle||!mensSource||!featureVisual||!handsTarget) return;

    let heroTween=null;
    let mensTween=null;
    let buildTimer=0;
    let resizeTimer=0;
    let sweepTimer=0;
    let destroyed=false;
    let lastWidth=window.innerWidth;
    const heroStartRotation=7;

    const mensClone=mensBottle.cloneNode(true);
    mensClone.className='mobile-mens-landed';
    mensClone.setAttribute('aria-hidden','true');
    featureVisual.appendChild(mensClone);

    const killCompetingJourneys=()=>{
      ScrollTrigger.getAll().forEach(trigger=>{
        const sameHero=trigger.trigger===hero&&Boolean(trigger.vars?.scrub);
        const sameMens=trigger.trigger===mensSource&&Boolean(trigger.vars?.scrub);
        if((sameHero||sameMens) && trigger!==heroTween?.scrollTrigger && trigger!==mensTween?.scrollTrigger){
          trigger.animation?.kill?.();
          trigger.kill();
        }
      });
    };

    const center=(el)=>{
      const r=el.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height};
    };

    const syncMensHandoff=(progress)=>{
      const landed=progress>=.992;
      mensBottle.style.visibility=landed?'hidden':'visible';
      mensClone.style.opacity=landed?'1':'0';
    };

    const clearOwnedTweens=()=>{
      heroTween?.scrollTrigger?.kill();
      mensTween?.scrollTrigger?.kill();
      heroTween?.kill();
      mensTween?.kill();
      heroTween=null;
      mensTween=null;
    };

    const build=()=>{
      if(destroyed) return;
      clearOwnedTweens();
      killCompetingJourneys();

      heroBottle.style.visibility='visible';
      heroBottle.style.opacity='1';
      gsap.set(heroBottle,{clearProps:'x,y,scale,rotation'});
      gsap.set(heroBottle,{rotation:heroStartRotation,transformOrigin:'50% 50%'});

      const bottleRect=heroBottle.getBoundingClientRect();
      const jointRect=jointTarget.getBoundingClientRect();
      const targetScale=Math.min(
        (jointRect.width*.88)/Math.max(1,bottleRect.width),
        (jointRect.height*.91)/Math.max(1,bottleRect.height)
      );
      const dx=(jointRect.left+jointRect.width/2)-(bottleRect.left+bottleRect.width/2);
      const dy=(jointRect.top+jointRect.height/2)-(bottleRect.top+bottleRect.height/2);

      heroTween=gsap.to(heroBottle,{
        x:dx,
        y:dy,
        scale:targetScale,
        rotation:0,
        ease:'none',
        overwrite:true,
        transformOrigin:'50% 50%',
        scrollTrigger:{
          trigger:hero,
          /* On phones the hero can be shorter than the browser's layout viewport.
             `bottom bottom` then produces a negative start, so pull-to-refresh
             viewport changes visibly scrub the bottle backwards. Anchoring the
             mobile journey to page top keeps progress exactly 0 while overscrolling. */
          start:'top top',
          endTrigger:jointTarget,
          end:'center center',
          scrub:.72,
          invalidateOnRefresh:false
        }
      });

      mensBottle.style.visibility='visible';
      mensClone.style.opacity='0';
      gsap.set(mensBottle,{clearProps:'x,y,scale,rotation'});

      const mensRect=center(mensBottle);
      const handsRect=center(handsTarget);
      const featureRect=featureVisual.getBoundingClientRect();
      const mensTargetScale=2.15;

      /* Mirror the desktop visual idea on the stacked mobile layout: leave the
         catalogue through a clear right-side lane, then move inward onto the
         palms. This keeps the moving bottle away from the Hair Oil heading. */
      const laneX=featureRect.right-Math.min(52,featureRect.width*.11);
      const featureGap=Math.max(120,featureRect.top-mensRect.y);
      const laneEntryY=mensRect.y+(featureGap*.56);
      const laneVisualY=featureRect.top+(featureRect.height*.16);

      /* The landed clone is sized from the real source element at the exact
         final animation scale, so there is no tiny-bottle snap at handoff. */
      mensClone.style.setProperty('--mens-landed-left',`${handsRect.x-featureRect.left}px`);
      mensClone.style.setProperty('--mens-landed-top',`${handsRect.y-featureRect.top}px`);
      mensClone.style.setProperty('--mens-landed-width',`${mensRect.width*mensTargetScale}px`);
      mensClone.style.setProperty('--mens-landed-height',`${mensRect.height*mensTargetScale}px`);

      mensTween=gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:{
          trigger:mensSource,
          start:'center 58%',
          endTrigger:featureVisual,
          /* Give the final approach much more real scroll distance so the
             bottle settles into the palms instead of visually snapping there. */
          end:'center 40%',
          scrub:1.05,
          invalidateOnRefresh:false,
          onUpdate:self=>syncMensHandoff(self.progress),
          onRefresh:self=>syncMensHandoff(self.progress)
        }
      });

      mensTween
        .to(mensBottle,{
          x:laneX-mensRect.x,
          y:laneEntryY-mensRect.y,
          scale:1.28,
          rotation:0,
          transformOrigin:'50% 50%',
          overwrite:true,
          duration:.22
        })
        .to(mensBottle,{
          x:laneX-mensRect.x,
          y:laneVisualY-mensRect.y,
          scale:1.62,
          rotation:0,
          transformOrigin:'50% 50%',
          duration:.28
        })
        .to(mensBottle,{
          x:handsRect.x-mensRect.x,
          y:handsRect.y-mensRect.y,
          scale:mensTargetScale,
          rotation:0,
          transformOrigin:'50% 50%',
          duration:.50
        });

      ScrollTrigger.refresh();
      killCompetingJourneys();
    };

    const scheduleBuild=(delay=80)=>{
      window.clearTimeout(buildTimer);
      buildTimer=window.setTimeout(build,delay);
    };

    /* Install the mobile-owned journey immediately. The old page-level mobile
       tween is created shortly after mount, so keep sweeping briefly and kill
       it as soon as it appears. This removes the reload race without touching
       any desktop choreography. */
    scheduleBuild(0);

    const relevantImages=[heroBottle,mensBottle,site.querySelector('.ref-feature-hands')].filter(Boolean);
    const waits=relevantImages.map(img=>{
      if(img.complete) return img.decode?.().catch(()=>{})??Promise.resolve();
      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    });
    Promise.all(waits).finally(()=>scheduleBuild(80));

    let sweeps=0;
    sweepTimer=window.setInterval(()=>{
      killCompetingJourneys();
      sweeps+=1;
      if(sweeps>=30){window.clearInterval(sweepTimer);sweepTimer=0;}
    },50);

    const guardToolbarResize=(event)=>{
      const width=window.innerWidth;
      if(Math.abs(width-lastWidth)<2){
        event.stopImmediatePropagation();
        return;
      }
      lastWidth=width;
      event.stopImmediatePropagation();
      window.clearTimeout(resizeTimer);
      resizeTimer=window.setTimeout(()=>scheduleBuild(180),140);
    };

    const onOrientation=()=>{
      lastWidth=window.innerWidth;
      scheduleBuild(260);
    };

    window.addEventListener('resize',guardToolbarResize,true);
    window.addEventListener('orientationchange',onOrientation,{passive:true});

    return()=>{
      destroyed=true;
      window.clearTimeout(buildTimer);
      window.clearTimeout(resizeTimer);
      if(sweepTimer) window.clearInterval(sweepTimer);
      window.removeEventListener('resize',guardToolbarResize,true);
      window.removeEventListener('orientationchange',onOrientation);
      clearOwnedTweens();
      mensClone.remove();
      heroBottle.style.visibility='';
      heroBottle.style.opacity='';
      mensBottle.style.visibility='';
    };
  },[]);

  return null;
}
