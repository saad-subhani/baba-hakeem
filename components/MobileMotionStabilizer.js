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
    const handsTarget=site.querySelector('.ref-mens-hands-target');
    if(!hero||!heroBottle||!jointTarget||!mensBottle||!mensSource||!handsTarget) return;

    let jointTween=null;
    let mensTween=null;
    let buildTimer=0;
    let resizeTimer=0;
    let destroyed=false;
    let lastWidth=window.innerWidth;

    const killMobileJourneys=()=>{
      ScrollTrigger.getAll().forEach(trigger=>{
        const isJoint=trigger.trigger===hero&&Boolean(trigger.vars?.scrub);
        const isMens=trigger.trigger===mensSource&&Boolean(trigger.vars?.scrub);
        if(isJoint||isMens){
          trigger.animation?.kill?.();
          trigger.kill();
        }
      });
      jointTween?.kill();
      mensTween?.kill();
      jointTween=null;
      mensTween=null;
    };

    const build=()=>{
      if(destroyed) return;
      killMobileJourneys();

      gsap.set(heroBottle,{clearProps:'x,y,scale,rotation'});
      gsap.set(mensBottle,{clearProps:'x,y,scale,rotation'});

      /* Measure the actual painted boxes after all mobile CSS has settled.
         Using getBoundingClientRect for BOTH endpoints avoids the half-height
         offset that appeared on the real phone when offsetTop was mixed with
         transformed artwork. */
      const bottleRect=heroBottle.getBoundingClientRect();
      const jointRect=jointTarget.getBoundingClientRect();
      const jointScale=Math.min(
        (jointRect.width*.90)/Math.max(1,bottleRect.width),
        (jointRect.height*.94)/Math.max(1,bottleRect.height)
      );
      const jointDx=(jointRect.left+jointRect.width/2)-(bottleRect.left+bottleRect.width/2);
      const jointDy=(jointRect.top+jointRect.height/2)-(bottleRect.top+bottleRect.height/2);

      jointTween=gsap.to(heroBottle,{
        x:jointDx,
        y:jointDy,
        scale:jointScale,
        rotation:0,
        ease:'none',
        scrollTrigger:{
          trigger:hero,
          start:'bottom bottom',
          endTrigger:jointTarget,
          end:'center center',
          scrub:1.05,
          invalidateOnRefresh:false
        }
      });

      const mensRect=mensBottle.getBoundingClientRect();
      const handsRect=handsTarget.getBoundingClientRect();
      const mensDx=(handsRect.left+handsRect.width/2)-(mensRect.left+mensRect.width/2);
      const mensDy=(handsRect.top+handsRect.height/2)-(mensRect.top+mensRect.height/2);

      mensTween=gsap.to(mensBottle,{
        x:mensDx,
        y:mensDy,
        scale:2.75,
        rotation:0,
        transformOrigin:'50% 50%',
        ease:'none',
        scrollTrigger:{
          trigger:mensSource,
          start:'center 62%',
          endTrigger:'.ref-feature',
          end:'bottom bottom',
          scrub:1.15,
          invalidateOnRefresh:false
        }
      });

      ScrollTrigger.refresh();
    };

    const scheduleBuild=(delay=360)=>{
      window.clearTimeout(buildTimer);
      buildTimer=window.setTimeout(build,delay);
    };

    /* page.js creates its original mobile tweens at 80/120ms. Wait until those
       exist, then replace them once. This prevents two scrub tweens fighting
       over the same bottle, which was the reason Joint Oil drifted down into
       Herbal Phakki in the real-device recording. */
    const relevantImages=[heroBottle,mensBottle,site.querySelector('.ref-feature-hands')].filter(Boolean);
    const waits=relevantImages.map(img=>{
      if(img.complete) return img.decode?.().catch(()=>{})??Promise.resolve();
      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    });
    Promise.all(waits).finally(()=>scheduleBuild(420));

    /* Real mobile browser chrome changes viewport HEIGHT while scrolling.
       Capture those resize events before page.js sees them. Only a genuine
       width/orientation change is allowed to rebuild the journeys. */
    const guardToolbarResize=(event)=>{
      const width=window.innerWidth;
      if(Math.abs(width-lastWidth)<2){
        event.stopImmediatePropagation();
        return;
      }
      lastWidth=width;
      event.stopImmediatePropagation();
      window.clearTimeout(resizeTimer);
      resizeTimer=window.setTimeout(()=>scheduleBuild(260),140);
    };

    const onOrientation=()=>{
      lastWidth=window.innerWidth;
      scheduleBuild(420);
    };

    window.addEventListener('resize',guardToolbarResize,true);
    window.addEventListener('orientationchange',onOrientation,{passive:true});

    return()=>{
      destroyed=true;
      window.clearTimeout(buildTimer);
      window.clearTimeout(resizeTimer);
      window.removeEventListener('resize',guardToolbarResize,true);
      window.removeEventListener('orientationchange',onOrientation);
      jointTween?.scrollTrigger?.kill();
      mensTween?.scrollTrigger?.kill();
      jointTween?.kill();
      mensTween?.kill();
    };
  },[]);

  return null;
}
