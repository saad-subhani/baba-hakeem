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

    const killOriginalMobileJourneys=()=>{
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

    const elementCenter=(element)=>{
      const rect=element.getBoundingClientRect();
      return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,width:rect.width,height:rect.height};
    };

    const heroBaseCenter=()=>{
      const heroRect=hero.getBoundingClientRect();
      return {
        x:heroRect.left+heroBottle.offsetLeft,
        y:heroRect.top+heroBottle.offsetTop,
        width:heroBottle.offsetWidth,
        height:heroBottle.offsetHeight
      };
    };

    const build=()=>{
      if(destroyed) return;
      killOriginalMobileJourneys();
      gsap.set(heroBottle,{clearProps:'x,y,scale,rotation'});
      gsap.set(mensBottle,{clearProps:'x,y,scale,rotation'});

      const heroStart=heroBaseCenter();
      const jointEnd=elementCenter(jointTarget);
      const jointScale=Math.min(
        (jointEnd.width*.88)/Math.max(1,heroStart.width),
        (jointEnd.height*.92)/Math.max(1,heroStart.height)
      );

      jointTween=gsap.to(heroBottle,{
        x:jointEnd.x-heroStart.x,
        y:jointEnd.y-heroStart.y,
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

      const mensStart=elementCenter(mensBottle);
      const handsEnd=elementCenter(handsTarget);
      mensTween=gsap.to(mensBottle,{
        x:handsEnd.x-mensStart.x,
        y:handsEnd.y-mensStart.y,
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

    const scheduleBuild=(delay=120)=>{
      window.clearTimeout(buildTimer);
      buildTimer=window.setTimeout(build,delay);
    };

    const relevantImages=[heroBottle,mensBottle,site.querySelector('.ref-feature-hands')].filter(Boolean);
    const waits=relevantImages.map(img=>{
      if(img.complete) return img.decode?.().catch(()=>{})??Promise.resolve();
      return new Promise(resolve=>{
        img.addEventListener('load',resolve,{once:true});
        img.addEventListener('error',resolve,{once:true});
      });
    });
    Promise.all(waits).finally(()=>scheduleBuild(80));

    /* Mobile browser chrome repeatedly changes viewport height while scrolling.
       Block those height-only resize events from rebuilding the original desktop
       measurements; genuine width/orientation changes are still allowed. */
    const guardToolbarResize=(event)=>{
      const width=window.innerWidth;
      if(Math.abs(width-lastWidth)<2){
        event.stopImmediatePropagation();
        return;
      }
      lastWidth=width;
      window.clearTimeout(resizeTimer);
      resizeTimer=window.setTimeout(()=>scheduleBuild(180),120);
    };

    const onOrientation=()=>{
      lastWidth=window.innerWidth;
      scheduleBuild(320);
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
