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
    renderer.toneMappingExposure=1.12;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,100);
    camera.position.set(0,1.35,8.7);

    const root=new THREE.Group();
    root.rotation.x=-0.05;
    scene.add(root);

    const wood=new THREE.MeshStandardMaterial({
      color:0x6f3519,
      roughness:.48,
      metalness:.04
    });
    const woodDark=new THREE.MeshStandardMaterial({
      color:0x32170d,
      roughness:.58,
      metalness:.02
    });
    const gold=new THREE.MeshStandardMaterial({
      color:0xb8843c,
      roughness:.28,
      metalness:.72
    });
    const inner=new THREE.MeshStandardMaterial({
      color:0x17100c,
      roughness:.72,
      metalness:.03
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
      renderer.render(scene,camera);
      raf=requestAnimationFrame(render);
    };
    render();

    root.rotation.y=-Math.PI*.16;

    const spinTween=gsap.to(root.rotation,{
      y:(Math.PI*2)-(Math.PI*.16),
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
        <p>Scroll slowly to explore the chest from every angle.</p>
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
