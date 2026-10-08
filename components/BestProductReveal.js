'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './BestProductReveal.module.css';

export default function BestProductReveal(){
  const sectionRef=useRef(null);
  const canvasRef=useRef(null);
  const progressRef=useRef(null);

  useEffect(()=>{
    if(typeof window==='undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section=sectionRef.current;
    const canvas=canvasRef.current;
    if(!section||!canvas) return;

    const renderer=new THREE.WebGLRenderer({
      canvas,
      antialias:true,
      alpha:true,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.18;
    renderer.physicallyCorrectLights=true;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,100);
    camera.position.set(0,1.35,8.7);

    const root=new THREE.Group();
    root.rotation.x=-0.05;
    scene.add(root);

    const wood=new THREE.MeshStandardMaterial({
      color:0x6f3519,
      roughness:.34,
      metalness:.12
    });
    const woodDark=new THREE.MeshStandardMaterial({
      color:0x32170d,
      roughness:.58,
      metalness:.02
    });
    const gold=new THREE.MeshStandardMaterial({
      color:0xb8843c,
      roughness:.19,
      metalness:.84
    });
    const inner=new THREE.MeshStandardMaterial({
      color:0x17100c,
      roughness:.87,
      metalness:.02
    });

    const body=new THREE.Group();
    root.add(body);

    const bodyShell=new THREE.Mesh(
      new THREE.CylinderGeometry(1.65,1.78,1.7,8,1,false),
      wood
    );
    bodyShell.position.y=-.15;
    body.add(bodyShell);

    const innerWell=new THREE.Mesh(
      new THREE.CylinderGeometry(1.34,1.42,1.14,8,1,false),
      inner
    );
    innerWell.position.y=.18;
    body.add(innerWell);

    const bottomBand=new THREE.Mesh(
      new THREE.CylinderGeometry(1.86,1.9,.16,8),
      gold
    );
    bottomBand.position.y=-1.01;
    body.add(bottomBand);

    const topBand=new THREE.Mesh(
      new THREE.CylinderGeometry(1.77,1.79,.12,8),
      gold
    );
    topBand.position.y=.69;
    body.add(topBand);

    const midBand=new THREE.Mesh(
      new THREE.CylinderGeometry(1.8,1.82,.055,8),
      gold
    );
    midBand.position.y=-.46;
    body.add(midBand);

    const panelRing=new THREE.Mesh(
      new THREE.CylinderGeometry(1.79,1.79,.92,8,1,true),
      new THREE.MeshStandardMaterial({
        color:0x81502b,
        roughness:.46,
        metalness:.06,
        side:THREE.DoubleSide
      })
    );
    panelRing.position.y=.07;
    body.add(panelRing);

    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      const stud=new THREE.Mesh(
        new THREE.SphereGeometry(.055,12,12),
        gold
      );
      stud.position.set(Math.cos(a)*1.81,-.43,Math.sin(a)*1.81);
      body.add(stud);
    }

    // Fine engraved inlays, inset panels and metallic rivets turn the placeholder
    // into a crafted presentation chest without changing its existing silhouette.
    const brassDetail=new THREE.MeshStandardMaterial({color:0xe5bf79,metalness:.86,roughness:.22});
    const velvet=new THREE.MeshStandardMaterial({color:0x17352a,roughness:.94,metalness:0,side:THREE.DoubleSide});
    const trimDark=new THREE.MeshStandardMaterial({color:0x2b2117,roughness:.38,metalness:.45});
    const octagon=(radius,y,material,tube=.018)=>{
      const points=[];
      for(let i=0;i<=8;i++){
        const a=(i/8)*Math.PI*2;
        points.push(new THREE.Vector3(Math.sin(a)*radius,y,Math.cos(a)*radius));
      }
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,tube,5,false),material);
      return mesh;
    };
    body.add(octagon(1.66,.69,brassDetail,.024));
    body.add(octagon(1.76,-.91,brassDetail,.018));
    for(let i=0;i<8;i++){
      const angle=(i+.5)*Math.PI/4;
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.55,.78,.025),trimDark);
      panel.position.set(Math.sin(angle)*1.69,-.05,Math.cos(angle)*1.69);
      panel.rotation.y=angle;
      body.add(panel);
      const line=new THREE.Mesh(new THREE.BoxGeometry(.43,.015,.033),brassDetail);
      line.position.set(Math.sin(angle)*1.72,-.37,Math.cos(angle)*1.72);
      line.rotation.y=angle;
      body.add(line);
      const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.045),brassDetail);
      jewel.position.set(Math.sin(angle)*1.74,.19,Math.cos(angle)*1.74);
      body.add(jewel);
    }
    const velvetBase=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.3,.08,8),velvet);
    velvetBase.position.y=.65;
    body.add(velvetBase);
    const innerRim=octagon(1.35,.73,brassDetail,.035);
    body.add(innerRim);

    const lidPivot=new THREE.Group();
    lidPivot.position.set(0,.81,-1.36);
    root.add(lidPivot);

    const lid=new THREE.Group();
    lid.position.set(0,.31,1.36);
    lidPivot.add(lid);

    const lidBase=new THREE.Mesh(
      new THREE.CylinderGeometry(1.77,1.77,.42,8),
      wood
    );
    lid.add(lidBase);

    const lidTop=new THREE.Mesh(
      new THREE.CylinderGeometry(1.57,1.74,.44,8),
      woodDark
    );
    lidTop.position.y=.34;
    lid.add(lidTop);

    const lidBand=new THREE.Mesh(
      new THREE.CylinderGeometry(1.82,1.82,.09,8),
      gold
    );
    lidBand.position.y=-.16;
    lid.add(lidBand);

    const lidCrown=new THREE.Mesh(
      new THREE.CylinderGeometry(1.62,1.62,.07,8),
      gold
    );
    lidCrown.position.y=.58;
    lid.add(lidCrown);

    lid.add(octagon(1.55,.63,brassDetail,.024));
    const lidMedallion=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.035,48),brassDetail);
    lidMedallion.position.y=.64;
    lid.add(lidMedallion);
    const medallionInset=new THREE.Mesh(new THREE.TorusGeometry(.23,.018,8,48),trimDark);
    medallionInset.rotation.x=Math.PI/2;
    medallionInset.position.y=.67;
    lid.add(medallionInset);
    const botanicalMark=new THREE.Mesh(new THREE.SphereGeometry(.065,16,12),velvet);
    botanicalMark.position.y=.68;
    lid.add(botanicalMark);

    const latch=new THREE.Mesh(
      new THREE.BoxGeometry(.28,.38,.12),
      gold
    );
    latch.position.set(0,-.02,1.78);
    lid.add(latch);

    const latchBase=new THREE.Mesh(
      new THREE.BoxGeometry(.36,.2,.12),
      gold
    );
    latchBase.position.set(0,.62,1.79);
    body.add(latchBase);

    const edgeMaterial=new THREE.LineBasicMaterial({color:0xd6a257});
    const edgeTargets=[bodyShell,topBand,bottomBand,lidBase,lidTop];
    edgeTargets.forEach(mesh=>{
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),edgeMaterial);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      if(mesh.parent===body) body.add(edges); else lid.add(edges);
    });

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(3.15,64),
      new THREE.MeshStandardMaterial({
        color:0x161613,
        roughness:.86,
        metalness:.02
      })
    );
    floor.rotation.x=-Math.PI/2;
    floor.position.y=-1.12;
    scene.add(floor);

    const ambient=new THREE.HemisphereLight(0xf1d7ad,0x090b09,1.45);
    scene.add(ambient);

    const key=new THREE.SpotLight(0xffd08b,85,18,Math.PI/5,.55,1.4);
    key.position.set(-3.8,6.2,5.6);
    key.target.position.set(0,.2,0);
    scene.add(key,key.target);

    const rim=new THREE.SpotLight(0xb56f2e,52,15,Math.PI/4,.7,1.5);
    rim.position.set(4.5,3.5,-4.5);
    rim.target.position.set(0,.5,0);
    scene.add(rim,rim.target);

    const soft=new THREE.PointLight(0xffe0b0,18,9,2);
    soft.position.set(0,1.6,3.8);
    scene.add(soft);

    // Stage glow follows the opening, with no extra scroll listeners or timelines.
    const revealLight=new THREE.PointLight(0xffd89b,0,5,2);
    revealLight.position.set(0,1.12,0);
    root.add(revealLight);
    const halo=new THREE.Mesh(
      new THREE.RingGeometry(2.05,2.75,80),
      new THREE.MeshBasicMaterial({color:0xc58b4c,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false})
    );
    halo.rotation.x=-Math.PI/2;
    halo.position.y=-1.085;
    scene.add(halo);
    const dustGeometry=new THREE.BufferGeometry();
    const dustPositions=new Float32Array(90*3);
    for(let i=0;i<90;i++){
      const a=i*2.39996323;
      const r=2.3+(i%13)*.17;
      dustPositions[i*3]=Math.cos(a)*r;
      dustPositions[i*3+1]=-.65+(i%19)*.18;
      dustPositions[i*3+2]=Math.sin(a)*r;
    }
    dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
    const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xe2b77b,size:.018,transparent:true,opacity:.42,depthWrite:false}));
    scene.add(dust);

    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      const w=Math.max(1,rect.width);
      const h=Math.max(1,rect.height);
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
      const mobile=w<700;
      camera.position.z=mobile?9.7:8.7;
      camera.position.y=mobile?1.15:1.35;
    };

    resize();

    let raf=0;
    const render=()=>{
      // Small ambient shimmer; the box rotation remains controlled only by scroll.
      const t=performance.now()*.00035;
      dust.rotation.y=t*.12;
      halo.material.opacity=.095+Math.sin(t*2)*.025;
      renderer.render(scene,camera);
      raf=requestAnimationFrame(render);
    };
    render();

    const initialRotation=-Math.PI*.16;
    const finalRotation=(Math.PI*2)-(Math.PI*.16);
    const spinEnd=.68;

    root.rotation.y=initialRotation;
    lidPivot.rotation.x=0;

    const spinTween=gsap.to(root.rotation,{
      y:finalRotation,
      ease:'none',
      scrollTrigger:{
        trigger:section,
        start:'top top',
        end:'+=1800',
        pin:true,
        scrub:1.15,
        anticipatePin:1,
        invalidateOnRefresh:true,
        onUpdate:self=>{
          if(progressRef.current){
            progressRef.current.style.setProperty('--progress',String(self.progress));
          }

          /* Phase 1: complete the full 360° turn.
             Phase 2: HOLD that final angle while the lid opens. */
          const spinProgress=gsap.utils.clamp(0,1,self.progress/spinEnd);
          root.rotation.y=initialRotation+(finalRotation-initialRotation)*spinProgress;

          const lidProgress=gsap.utils.clamp(
            0,
            1,
            (self.progress-spinEnd)/(1-spinEnd)
          );
          const easedLid=gsap.parseEase('power2.out')(lidProgress);
          lidPivot.rotation.x=-Math.PI*.58*easedLid;
          revealLight.intensity=10*easedLid;
          halo.scale.setScalar(1+.12*easedLid);
        }
      }
    });

    const intro=gsap.fromTo(
      root.scale,
      {x:.94,y:.94,z:.94},
      {x:1,y:1,z:1,duration:1.15,ease:'power3.out'}
    );

    window.addEventListener('resize',resize);
    const delayed=window.setTimeout(()=>ScrollTrigger.refresh(),120);

    return()=>{
      window.clearTimeout(delayed);
      window.removeEventListener('resize',resize);
      cancelAnimationFrame(raf);
      spinTween.scrollTrigger?.kill();
      spinTween.kill();
      intro.kill();
      renderer.dispose();
      dustGeometry.dispose();
      dust.material.dispose();
      halo.geometry.dispose();
      halo.material.dispose();
      brassDetail.dispose();
      velvet.dispose();
      trimDark.dispose();
      scene.traverse(obj=>{
        if(obj.geometry) obj.geometry.dispose?.();
        if(obj.material){
          const mats=Array.isArray(obj.material)?obj.material:[obj.material];
          mats.forEach(m=>m.dispose?.());
        }
      });
    };
  },[]);

  return (
    <section ref={sectionRef} className={styles.section} id="best-product" aria-labelledby="best-product-title">
      <div className={styles.vignette} aria-hidden="true"/>
      <div className={styles.warmGlow} aria-hidden="true"/>
      <div className={styles.botanicalLeft} aria-hidden="true"/>
      <div className={styles.botanicalRight} aria-hidden="true"/>

      <div className={styles.heading}>
        <div className={styles.kicker}><span/>THE SIGNATURE REVEAL<span/></div>
        <h2 id="best-product-title">OUR <em>BEST</em> PRODUCT</h2>
        <p>Scroll slowly</p>
      </div>

      <div className={styles.stage}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive 3D ornate product chest"/>
        <div ref={progressRef} className={styles.progress} aria-hidden="true">
          <span>SCROLL TO TURN</span>
          <div><i/></div>
          <b>360°</b>
        </div>
      </div>

      <div className={styles.trustRow}>
        <div><i>✧</i><strong>100% NATURAL</strong><span>Pure herbal care</span></div>
        <div><i>◌</i><strong>TRADITIONAL CARE</strong><span>Rooted in heritage</span></div>
        <div><i>♧</i><strong>HERBAL FORMULA</strong><span>Thoughtfully selected</span></div>
        <div><i>◇</i><strong>TRUSTED QUALITY</strong><span>Baba Hakeem standard</span></div>
      </div>
    </section>
  );
}
