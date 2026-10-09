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
    const feature=site.querySelector('.ref-feature');
    const featureVisual=site.querySelector('.ref-feature-visual');
    const handsTarget=site.querySelector('.ref-mens-hands-target');
    if(!hero||!heroBottle||!jointTarget||!mensBottle||!mensSource||!feature||!featureVisual||!handsTarget) return;

    let jointTween=null;
    let mensTween=null;
    let buildTimer=0;
    let resizeTimer=0;
    let sweepTimer=0;
    let destroyed=false;
    let lastWidth=window.innerWidth;

    const jointClone=heroBottle.cloneNode(true);
    jointClone.removeAttribute('ref');
    jointClone.className='mobile-joint-landed';
    jointClone.setAttribute('aria-hidden','true');
    jointTarget.appendChild(jointClone);

    const mensClone=mensBottle.cloneNode(true);
    mensClone.removeAttribute('ref');
    mensClone.className='mobile-mens-landed';
    mensClone.setAttribute('aria-hidden','true');
    featureVisual.appendChild(mensClone);

    const killCompetingJourneys=()=>{
      ScrollTrigger.getAll().forEach(trigger=>{
        const sameHero=trigger.trigger===hero&&Boolean(trigger.vars?.scrub);
        const sameMens=trigger.trigger===mensSource&&Boolean(trigger.vars?.scrub);
        if(sameHero||sameMens){
          if(trigger!==jointTween?.scrollTrigger&&trigger!==mensTween?.scrollTrigger){
            trigger.animation?.kill?.();
            trigger.kill();
          }
        }
      });
    };

    const center=(el)=>{
      const r=el.getBoundingClientRect();
      return {x:r.left+r.width/2,y:r.top+r.height/2,width:r.width,height:r.height};
    };

    const syncJointHandoff=(progress)=>{
      const landed=progress>=.985;
      heroBottle.style.visibility=landed?'hidden':'visible';
      jointClone.style.opacity=landed?'1':'0';
    };

    const syncMensHandoff=(progress)=>{
      const landed=progress>=.985;
      mensBottle.style.visibility=landed?'hidden':'visible';
      mensClone.style.opacity=landed?'1':'0';
    };

    const clearOwnedTweens=()=>{
      jointTween?.scrollTrigger?.kill();
      mensTween?.scrollTrigger?.kill();
      jointTween?.kill();
      mensTween?.kill();
      jointTween=null;
      mensTween=null;
    };

    const build=()=>{
      if(destroyed) return;
      clearOwnedTweens();
      killCompetingJourneys();

      heroBottle.style.visibility='visible';
      mensBottle.style.visibility='visible';
      jointClone.style.opacity='0';
      mensClone.style.opacity='0';
      gsap.set(heroBottle,{clearProps:'x,y,scale,rotation'});
      gsap.set(mensBottle,{clearProps:'x,y,scale,rotation'});

      const bottleRect=heroBottle.getBoundingClientRect();
      const jointRect=jointTarget.getBoundingClientRect();
      const jointScale=Math.min(
        (jointRect.width*.82)/Math.max(1,bottleRect.width),
        (jointRect.height*.86)/Math.max(1,bottleRect.height)
      );
      const jointDx=(jointRect.left+jointRect.width/2)-(bottleRect.left+bottleRect.width/2);
      const jointDy=(jointRect.top+jointRect.height/2)-(bottleRect.top+bottleRect.height/2);

      jointTween=gsap.to(heroBottle,{
        x:jointDx,
        y:jointDy,
        scale:jointScale,
        rotation:0,
        ease:'none',
        overwrite:true,
        scrollTrigger:{
          trigger:hero,
          start:'bottom bottom',
          endTrigger:jointTarget,
          end:'center 62%',
          scrub:.45,
          invalidateOnRefresh:false,
          onUpdate:self=>syncJointHandoff(self.progress),
          onRefresh:self=>syncJointHandoff(self.progress)
        }
      });

      const mensRect=mensBottle.getBoundingClientRect();
      const handsRect=handsTarget.getBoundingClientRect();
      const mensDx=(handsRect.left+handsRect.width/2)-(mensRect.left+mensRect.width/2);
      const mensDy=(handsRect.top+handsRect.height/2)-(mensRect.top+mensRect.height/2);

      mensTween=gsap.to(mensBottle,{
        x:mensDx,
        y:mensDy,
        scale:2.45,
        rotation:0,
        transformOrigin:'50% 50%',
        ease:'none',
        overwrite:true,
        scrollTrigger:{
          trigger:mensSource,
          start:'center 66%',
          endTrigger:featureVisual,
          end:'center 58%',
          scrub:.5,
          invalidateOnRefresh:false,
          onUpdate:self=>syncMensHandoff(self.progress),
          onRefresh:self=>syncMensHandoff(self.progress)
        }
      });

      ScrollTrigger.refresh();
      killCompetingJourneys();
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
    Promise.all(waits).finally(()=>scheduleBuild(620));

    /* A few delayed sweeps guarantee that the original page.js mobile
       ScrollTriggers cannot re-claim these two transforms after mount. */
    let sweeps=0;
    sweepTimer=window.setInterval(()=>{
      killCompetingJourneys();
      sweeps+=1;
      if(sweeps>=8){window.clearInterval(sweepTimer);sweepTimer=0;}
    },250);

    const guardToolbarResize=(event)=>{
      const width=window.innerWidth;
      if(Math.abs(width-lastWidth)<2){
        event.stopImmediatePropagation();
        return;
      }
      lastWidth=width;
      event.stopImmediatePropagation();
      window.clearTimeout(resizeTimer);
      resizeTimer=window.setTimeout(()=>scheduleBuild(420),180);
    };

    const onOrientation=()=>{
      lastWidth=window.innerWidth;
      scheduleBuild(560);
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
      jointClone.remove();
      mensClone.remove();
      heroBottle.style.visibility='';
      mensBottle.style.visibility='';
    };
  },[]);

  return null;
}
