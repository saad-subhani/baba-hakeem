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
    const featureVisual=site.querySelector('.ref-feature-visual');
    if(!hero||!heroBottle||!jointTarget||!mensBottle||!mensSource||!handsTarget||!featureVisual) return;

    let jointTimeline=null;
    let mensTimeline=null;
    let buildTimer=0;
    let resizeTimer=0;
    let purgeTimerA=0;
    let purgeTimerB=0;
    let destroyed=false;
    let lastWidth=window.innerWidth;

    const makeLanding=(parent,className,src,alt)=>{
      const old=parent.querySelector('.'+className);
      if(old) old.remove();
      const img=document.createElement('img');
      img.className=className;
      img.src=src;
      img.alt=alt;
      img.setAttribute('aria-hidden','true');
      parent.appendChild(img);
      return img;
    };

    /* These landing copies solve a fundamental real-device issue: the moving
       source image still belongs to its old section after the ScrollTrigger has
       completed. Safari/Chrome then keep scrolling that old DOM node through
       later rows. We cross-fade to a copy that actually lives at the destination,
       so the finished bottle scrolls naturally with its destination section. */
    const jointLanding=makeLanding(jointTarget,'mobile-joint-landing','/joint-oil-4k.png','');
    const mensLanding=makeLanding(featureVisual,'mobile-mens-landing','/products/mens-oil-new.png','');

    const isOurTrigger=(trigger)=>{
      const id=trigger?.vars?.id;
      return id==='mobile-joint-journey'||id==='mobile-mens-journey';
    };

    const purgeForeignJourneys=()=>{
      ScrollTrigger.getAll().forEach(trigger=>{
        if(isOurTrigger(trigger)) return;
        const foreignJoint=trigger.trigger===hero&&Boolean(trigger.vars?.scrub);
        const foreignMens=trigger.trigger===mensSource&&Boolean(trigger.vars?.scrub);
        if(foreignJoint||foreignMens){
          trigger.animation?.kill?.();
          trigger.kill();
        }
      });
    };

    const killOwnJourneys=()=>{
      jointTimeline?.scrollTrigger?.kill();
      mensTimeline?.scrollTrigger?.kill();
      jointTimeline?.kill();
      mensTimeline?.kill();
      jointTimeline=null;
      mensTimeline=null;
    };

    const center=(rect)=>({x:rect.left+rect.width/2,y:rect.top+rect.height/2});
    const mix=(a,b,t)=>a+(b-a)*t;

    const build=()=>{
      if(destroyed) return;

      purgeForeignJourneys();
      killOwnJourneys();

      gsap.set(heroBottle,{clearProps:'x,y,scale,rotation,opacity,visibility'});
      gsap.set(mensBottle,{clearProps:'x,y,scale,rotation,opacity,visibility'});
      gsap.set(jointLanding,{opacity:0});
      gsap.set(mensLanding,{opacity:0});

      const bottleRect=heroBottle.getBoundingClientRect();
      const jointRect=jointTarget.getBoundingClientRect();
      const bottleCenter=center(bottleRect);
      const jointCenter=center(jointRect);
      const jointScale=Math.min(
        (jointRect.width*.90)/Math.max(1,bottleRect.width),
        (jointRect.height*.94)/Math.max(1,bottleRect.height)
      );

      /* Mobile route bends into the right-side Joint Oil lane before dropping
         into the card, so it no longer cuts directly through the centered
         "Our Products" heading on Safari/Chrome. */
      const jointMid={
        x:jointCenter.x,
        y:jointRect.top-Math.min(72,Math.max(44,window.innerHeight*.075))
      };

      jointTimeline=gsap.timeline({
        scrollTrigger:{
          id:'mobile-joint-journey',
          trigger:hero,
          start:'bottom bottom',
          endTrigger:jointTarget,
          end:'center center',
          scrub:.28,
          invalidateOnRefresh:false,
          onUpdate:(self)=>{
            const fade=Math.max(0,Math.min(1,(self.progress-.91)/.09));
            gsap.set(heroBottle,{opacity:1-fade});
            gsap.set(jointLanding,{opacity:fade});
          }
        }
      });

      jointTimeline
        .to(heroBottle,{
          x:jointMid.x-bottleCenter.x,
          y:jointMid.y-bottleCenter.y,
          scale:Math.max(jointScale*1.18,.46),
          rotation:0,
          duration:.58,
          ease:'none'
        })
        .to(heroBottle,{
          x:jointCenter.x-bottleCenter.x,
          y:jointCenter.y-bottleCenter.y,
          scale:jointScale,
          rotation:0,
          duration:.42,
          ease:'none'
        });

      const mensRect=mensBottle.getBoundingClientRect();
      const mensCenter=center(mensRect);
      const handsRect=handsTarget.getBoundingClientRect();
      const handsCenter=center(handsRect);
      const visualRect=featureVisual.getBoundingClientRect();

      /* On phones the Featured copy sits ABOVE the palms. A straight diagonal
         from the Men's Oil card to the palms crossed right through "Hair Oil".
         Route the bottle down a quiet corridor at the right edge first, then
         sweep it inward onto the hands. */
      const mensMid={
        x:visualRect.right-Math.min(52,Math.max(34,visualRect.width*.12)),
        y:visualRect.top+Math.min(86,Math.max(56,visualRect.height*.14))
      };

      mensTimeline=gsap.timeline({
        scrollTrigger:{
          id:'mobile-mens-journey',
          trigger:mensSource,
          start:'center 62%',
          endTrigger:'.ref-feature',
          end:'bottom bottom',
          scrub:.34,
          invalidateOnRefresh:false,
          onUpdate:(self)=>{
            const fade=Math.max(0,Math.min(1,(self.progress-.92)/.08));
            gsap.set(mensBottle,{opacity:1-fade});
            gsap.set(mensLanding,{opacity:fade});
          }
        }
      });

      mensTimeline
        .to(mensBottle,{
          x:mensMid.x-mensCenter.x,
          y:mensMid.y-mensCenter.y,
          scale:1.7,
          rotation:0,
          transformOrigin:'50% 50%',
          duration:.56,
          ease:'none'
        })
        .to(mensBottle,{
          x:handsCenter.x-mensCenter.x,
          y:handsCenter.y-mensCenter.y,
          scale:2.75,
          rotation:0,
          transformOrigin:'50% 50%',
          duration:.44,
          ease:'none'
        });

      ScrollTrigger.refresh();
    };

    const scheduleBuild=(delay=520)=>{
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

    /* page.js creates its legacy mobile scrubbers at 80/120ms. Build after
       images/CSS settle, then do two silent purges as insurance against a late
       React/ScrollTrigger mount. Our IDs are explicitly preserved. */
    Promise.all(waits).finally(()=>{
      scheduleBuild(560);
      purgeTimerA=window.setTimeout(purgeForeignJourneys,1050);
      purgeTimerB=window.setTimeout(purgeForeignJourneys,1750);
    });

    /* Mobile browser chrome repeatedly changes HEIGHT while scrolling. Ignore
       those events before the legacy resize handlers can recalculate bad paths.
       A real width/orientation change is allowed through so the rest of the site
       can resize normally; our mobile journeys rebuild immediately afterwards. */
    const guardToolbarResize=(event)=>{
      const width=window.innerWidth;
      if(Math.abs(width-lastWidth)<2){
        event.stopImmediatePropagation();
        return;
      }
      lastWidth=width;
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
      window.clearTimeout(purgeTimerA);
      window.clearTimeout(purgeTimerB);
      window.removeEventListener('resize',guardToolbarResize,true);
      window.removeEventListener('orientationchange',onOrientation);
      killOwnJourneys();
      jointLanding.remove();
      mensLanding.remove();
    };
  },[]);

  return null;
}
