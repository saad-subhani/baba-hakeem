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

    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.14;
    renderer.physicallyCorrectLights=true;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(33,1,.1,100);
    camera.position.set(0,1.26,8.72);

    const root=new THREE.Group();
    root.rotation.x=-0.055;
    scene.add(root);

    const wood=new THREE.MeshPhysicalMaterial({
      color:0x4e180d,
      roughness:.28,
      metalness:.08,
      clearcoat:.62,
      clearcoatRoughness:.2
    });
    const woodDark=new THREE.MeshPhysicalMaterial({
      color:0x210d08,
      roughness:.35,
      metalness:.06,
      clearcoat:.48,
      clearcoatRoughness:.25
    });
    const gold=new THREE.MeshPhysicalMaterial({
      color:0xc79242,
      roughness:.16,
      metalness:.92,
      clearcoat:.46,
      clearcoatRoughness:.13
    });
    const inner=new THREE.MeshStandardMaterial({color:0x100c09,roughness:.93,metalness:.01});
    const brassDetail=new THREE.MeshPhysicalMaterial({
      color:0xe0b263,
      roughness:.17,
      metalness:.95,
      clearcoat:.35,
      clearcoatRoughness:.1
    });
    const velvet=new THREE.MeshStandardMaterial({color:0x102f24,roughness:.98,metalness:0,side:THREE.DoubleSide});
    const trimDark=new THREE.MeshStandardMaterial({color:0x241810,roughness:.31,metalness:.52});

    const makeBrandTexture=(inside=false)=>{
      const c=document.createElement('canvas');
      c.width=1024;c.height=640;
      const ctx=c.getContext('2d');
      const bg=ctx.createLinearGradient(0,0,c.width,c.height);
      if(inside){
        bg.addColorStop(0,'#153b2c');bg.addColorStop(1,'#081d16');
      }else{
        bg.addColorStop(0,'#31160f');bg.addColorStop(.52,'#5b2615');bg.addColorStop(1,'#1c0d09');
      }
      ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
      ctx.strokeStyle='#d8ac5a';ctx.lineWidth=16;ctx.strokeRect(36,36,c.width-72,c.height-72);
      ctx.strokeStyle='rgba(239,202,126,.38)';ctx.lineWidth=2;ctx.strokeRect(62,62,c.width-124,c.height-124);
      ctx.textAlign='center';ctx.fillStyle='#e8c983';
      ctx.font='700 170px Georgia';ctx.fillText('BH',c.width/2,260);
      ctx.font='600 44px Georgia';ctx.letterSpacing='8px';ctx.fillText('BABA HAKEEM',c.width/2,352);
      ctx.font='500 24px Arial';ctx.fillStyle='rgba(235,218,177,.78)';ctx.fillText('HERBAL PRODUCTS',c.width/2,406);
      ctx.beginPath();ctx.moveTo(330,465);ctx.lineTo(694,465);ctx.strokeStyle='rgba(216,172,90,.65)';ctx.lineWidth=2;ctx.stroke();
      ctx.font='500 18px Arial';ctx.fillStyle='rgba(232,201,131,.72)';ctx.fillText('TRADITION • BOTANICAL CARE',c.width/2,505);
      const texture=new THREE.CanvasTexture(c);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      return texture;
    };

    const outerBrandTexture=makeBrandTexture(false);
    const innerBrandTexture=makeBrandTexture(true);

    const body=new THREE.Group();
    root.add(body);

    const bodyShell=new THREE.Mesh(new THREE.CylinderGeometry(1.66,1.79,1.72,8,2,false),wood);
    bodyShell.position.y=-.15;
    body.add(bodyShell);

    const innerWell=new THREE.Mesh(new THREE.CylinderGeometry(1.34,1.43,1.14,8,1,false),inner);
    innerWell.position.y=.18;
    body.add(innerWell);

    const bottomBand=new THREE.Mesh(new THREE.CylinderGeometry(1.86,1.91,.16,8),gold);
    bottomBand.position.y=-1.01;
    body.add(bottomBand);

    const topBand=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.8,.13,8),gold);
    topBand.position.y=.69;
    body.add(topBand);

    const midBand=new THREE.Mesh(new THREE.CylinderGeometry(1.81,1.83,.052,8),brassDetail);
    midBand.position.y=-.46;
    body.add(midBand);

    const panelRing=new THREE.Mesh(
      new THREE.CylinderGeometry(1.795,1.795,.93,8,1,true),
      new THREE.MeshStandardMaterial({color:0x6f2b18,roughness:.34,metalness:.08,side:THREE.DoubleSide})
    );
    panelRing.position.y=.07;
    body.add(panelRing);

    const octagon=(radius,y,material,tube=.018)=>{
      const points=[];
      for(let i=0;i<=8;i++){
        const a=(i/8)*Math.PI*2;
        points.push(new THREE.Vector3(Math.sin(a)*radius,y,Math.cos(a)*radius));
      }
      return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,tube,6,false),material);
    };

    body.add(octagon(1.67,.695,brassDetail,.025));
    body.add(octagon(1.765,-.91,brassDetail,.019));

    for(let i=0;i<8;i++){
      const angle=(i+.5)*Math.PI/4;
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.56,.8,.025),trimDark);
      panel.position.set(Math.sin(angle)*1.7,-.05,Math.cos(angle)*1.7);
      panel.rotation.y=angle;
      body.add(panel);

      const topLine=new THREE.Mesh(new THREE.BoxGeometry(.44,.014,.035),brassDetail);
      topLine.position.set(Math.sin(angle)*1.73,.3,Math.cos(angle)*1.73);
      topLine.rotation.y=angle;
      body.add(topLine);

      const bottomLine=new THREE.Mesh(new THREE.BoxGeometry(.44,.014,.035),brassDetail);
      bottomLine.position.set(Math.sin(angle)*1.73,-.38,Math.cos(angle)*1.73);
      bottomLine.rotation.y=angle;
      body.add(bottomLine);

      const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.05),brassDetail);
      jewel.position.set(Math.sin(angle)*1.75,.02,Math.cos(angle)*1.75);
      body.add(jewel);
    }

    const velvetBase=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.31,.09,8),velvet);
    velvetBase.position.y=.66;
    body.add(velvetBase);
    body.add(octagon(1.355,.735,brassDetail,.036));

    const innerNest=new THREE.Mesh(new THREE.TorusGeometry(.73,.19,18,72),velvet);
    innerNest.rotation.x=Math.PI/2;
    innerNest.position.y=.735;
    body.add(innerNest);

    const frontPlaqueBase=new THREE.Mesh(new THREE.BoxGeometry(.94,.58,.055),gold);
    frontPlaqueBase.position.set(0,.02,1.81);
    body.add(frontPlaqueBase);
    const frontPlaque=new THREE.Mesh(
      new THREE.PlaneGeometry(.87,.51),
      new THREE.MeshStandardMaterial({map:outerBrandTexture,roughness:.44,metalness:.03})
    );
    frontPlaque.position.set(0,.02,1.842);
    body.add(frontPlaque);

    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      const stud=new THREE.Mesh(new THREE.SphereGeometry(.058,14,14),brassDetail);
      stud.position.set(Math.cos(a)*1.82,-.54,Math.sin(a)*1.82);
      body.add(stud);

      const foot=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.18,16),gold);
      foot.position.set(Math.cos(a)*1.38,-1.12,Math.sin(a)*1.38);
      body.add(foot);
    }

    const lidPivot=new THREE.Group();
    lidPivot.position.set(0,.81,-1.36);
    root.add(lidPivot);

    const lid=new THREE.Group();
    lid.position.set(0,.31,1.36);
    lidPivot.add(lid);

    const lidBase=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.78,.42,8),wood);
    lid.add(lidBase);

    const lidTop=new THREE.Mesh(new THREE.CylinderGeometry(1.57,1.74,.44,8),woodDark);
    lidTop.position.y=.34;
    lid.add(lidTop);

    const lidBand=new THREE.Mesh(new THREE.CylinderGeometry(1.83,1.83,.09,8),gold);
    lidBand.position.y=-.16;
    lid.add(lidBand);

    const lidCrown=new THREE.Mesh(new THREE.CylinderGeometry(1.63,1.63,.07,8),brassDetail);
    lidCrown.position.y=.58;
    lid.add(lidCrown);

    lid.add(octagon(1.56,.63,brassDetail,.024));

    const lidMedallion=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.045,48),gold);
    lidMedallion.position.y=.64;
    lid.add(lidMedallion);
    const medallionInset=new THREE.Mesh(new THREE.TorusGeometry(.27,.022,10,64),trimDark);
    medallionInset.rotation.x=Math.PI/2;
    medallionInset.position.y=.672;
    lid.add(medallionInset);
    const botanicalMark=new THREE.Mesh(new THREE.OctahedronGeometry(.085),velvet);
    botanicalMark.position.y=.695;
    lid.add(botanicalMark);

    const lidInside=new THREE.Mesh(
      new THREE.CircleGeometry(1.3,8),
      new THREE.MeshStandardMaterial({map:innerBrandTexture,roughness:.76,metalness:.01,side:THREE.DoubleSide})
    );
    lidInside.rotation.x=-Math.PI/2;
    lidInside.position.y=-.222;
    lid.add(lidInside);
    lid.add(octagon(1.36,-.246,brassDetail,.028));

    const latch=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.13),gold);
    latch.position.set(0,-.02,1.79);
    lid.add(latch);
    const latchGem=new THREE.Mesh(new THREE.OctahedronGeometry(.09),velvet);
    latchGem.position.set(0,-.02,1.865);
    lid.add(latchGem);

    const latchBase=new THREE.Mesh(new THREE.BoxGeometry(.38,.22,.13),gold);
    latchBase.position.set(0,.62,1.8);
    body.add(latchBase);

    const edgeMaterial=new THREE.LineBasicMaterial({color:0xc18a3d,transparent:true,opacity:.58});
    [bodyShell,topBand,bottomBand,lidBase,lidTop].forEach(mesh=>{
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),edgeMaterial);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      if(mesh.parent===body) body.add(edges); else lid.add(edges);
    });

    const floor=new THREE.Mesh(
      new THREE.CircleGeometry(3.45,80),
      new THREE.MeshStandardMaterial({color:0x0b0d0a,roughness:.92,metalness:.02})
    );
    floor.rotation.x=-Math.PI/2;
    floor.position.y=-1.205;
    floor.receiveShadow=true;
    scene.add(floor);

    const pedestal=new THREE.Mesh(
      new THREE.CylinderGeometry(2.28,2.58,.12,96),
      new THREE.MeshPhysicalMaterial({color:0x17120c,roughness:.3,metalness:.65,clearcoat:.35})
    );
    pedestal.position.y=-1.14;
    pedestal.receiveShadow=true;
    scene.add(pedestal);

    const pedestalRing=new THREE.Mesh(
      new THREE.TorusGeometry(2.3,.022,10,96),
      new THREE.MeshBasicMaterial({color:0xb5803d,transparent:true,opacity:.56})
    );
    pedestalRing.rotation.x=Math.PI/2;
    pedestalRing.position.y=-1.065;
    scene.add(pedestalRing);

    const contactShadow=new THREE.Mesh(
      new THREE.CircleGeometry(1.7,64),
      new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.38,depthWrite:false})
    );
    contactShadow.rotation.x=-Math.PI/2;
    contactShadow.position.y=-1.055;
    contactShadow.scale.set(1.35,.52,1);
    scene.add(contactShadow);

    const ambient=new THREE.HemisphereLight(0xf2d5ab,0x06100b,.85);
    scene.add(ambient);

    const key=new THREE.SpotLight(0xffd79a,74,18,Math.PI/5,.6,1.45);
    key.position.set(-4.4,6.3,5.4);
    key.target.position.set(0,.1,0);
    key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);
    key.shadow.bias=-.0004;
    scene.add(key,key.target);

    const rim=new THREE.SpotLight(0xd68a3e,48,15,Math.PI/4,.72,1.5);
    rim.position.set(4.6,3.9,-4.8);
    rim.target.position.set(0,.45,0);
    scene.add(rim,rim.target);

    const emeraldRim=new THREE.PointLight(0x335d45,14,7,2);
    emeraldRim.position.set(-3.2,.8,-2.2);
    scene.add(emeraldRim);

    const soft=new THREE.PointLight(0xffe3b1,12,9,2);
    soft.position.set(0,2.3,4.1);
    scene.add(soft);

    const revealLight=new THREE.PointLight(0xffd89b,0,5.4,2);
    revealLight.position.set(0,1.08,.08);
    root.add(revealLight);

    const halo=new THREE.Mesh(
      new THREE.RingGeometry(2.05,2.82,96),
      new THREE.MeshBasicMaterial({color:0xc58b4c,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
    );
    halo.rotation.x=-Math.PI/2;
    halo.position.y=-1.045;
    scene.add(halo);

    const innerHalo=new THREE.Mesh(
      new THREE.RingGeometry(1.34,1.82,96),
      new THREE.MeshBasicMaterial({color:0xefd191,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
    );
    innerHalo.rotation.x=-Math.PI/2;
    innerHalo.position.y=-1.04;
    scene.add(innerHalo);

    const glowCanvas=document.createElement('canvas');
    glowCanvas.width=256;glowCanvas.height=256;
    const gctx=glowCanvas.getContext('2d');
    const gg=gctx.createRadialGradient(128,128,0,128,128,128);
    gg.addColorStop(0,'rgba(255,224,160,.95)');
    gg.addColorStop(.25,'rgba(221,164,79,.55)');
    gg.addColorStop(.68,'rgba(128,79,28,.13)');
    gg.addColorStop(1,'rgba(0,0,0,0)');
    gctx.fillStyle=gg;gctx.fillRect(0,0,256,256);
    const glowTexture=new THREE.CanvasTexture(glowCanvas);
    const glowSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
    glowSprite.scale.set(5.1,5.1,1);
    glowSprite.position.set(0,1.25,-.65);
    scene.add(glowSprite);

    const lightBeam=new THREE.Mesh(
      new THREE.CylinderGeometry(1.2,.22,3.6,48,1,true),
      new THREE.MeshBasicMaterial({color:0xe9b766,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending})
    );
    lightBeam.position.set(0,2.2,.03);
    root.add(lightBeam);

    const dustGeometry=new THREE.BufferGeometry();
    const dustPositions=new Float32Array(100*3);
    for(let i=0;i<100;i++){
      const a=i*2.39996323;
      const r=2.2+(i%15)*.15;
      dustPositions[i*3]=Math.cos(a)*r;
      dustPositions[i*3+1]=-.6+(i%21)*.16;
      dustPositions[i*3+2]=Math.sin(a)*r;
    }
    dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
    const dustMaterial=new THREE.PointsMaterial({color:0xe5bd79,size:.021,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending});
    const dust=new THREE.Points(dustGeometry,dustMaterial);
    scene.add(dust);

    const revealDustGeometry=new THREE.BufferGeometry();
    const revealDustPositions=new Float32Array(64*3);
    for(let i=0;i<64;i++){
      const a=i*2.12;
      const r=.18+(i%9)*.055;
      revealDustPositions[i*3]=Math.cos(a)*r;
      revealDustPositions[i*3+1]=(i%16)*.11;
      revealDustPositions[i*3+2]=Math.sin(a)*r;
    }
    revealDustGeometry.setAttribute('position',new THREE.BufferAttribute(revealDustPositions,3));
    const revealDustMaterial=new THREE.PointsMaterial({color:0xffd990,size:.027,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
    const revealDust=new THREE.Points(revealDustGeometry,revealDustMaterial);
    revealDust.position.set(0,.55,.08);
    root.add(revealDust);

    const product=new THREE.Group();
    product.position.set(0,-.22,.08);
    product.scale.setScalar(.02);
    product.visible=false;
    root.add(product);

    const amberGlass=new THREE.MeshPhysicalMaterial({
      color:0x7a2d0c,
      roughness:.11,
      metalness:.01,
      transmission:.2,
      thickness:.28,
      transparent:true,
      opacity:.97,
      clearcoat:.52,
      clearcoatRoughness:.1
    });
    const bottleBody=new THREE.Mesh(new THREE.CylinderGeometry(.31,.34,1.24,64),amberGlass);
    bottleBody.position.y=.59;
    product.add(bottleBody);
    const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(.21,.31,.24,64),amberGlass);
    shoulder.position.y=1.33;
    product.add(shoulder);
    const neck=new THREE.Mesh(new THREE.CylinderGeometry(.15,.17,.32,48),amberGlass);
    neck.position.y=1.6;
    product.add(neck);

    const glassHighlight=new THREE.Mesh(
      new THREE.BoxGeometry(.035,.95,.01),
      new THREE.MeshBasicMaterial({color:0xffd7a1,transparent:true,opacity:.28})
    );
    glassHighlight.position.set(-.18,.68,.335);
    product.add(glassHighlight);

    const capMaterial=new THREE.MeshPhysicalMaterial({color:0x14120f,roughness:.25,metalness:.55,clearcoat:.35});
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.42,48),capMaterial);
    cap.position.y=1.93;
    product.add(cap);
    for(let i=0;i<20;i++){
      const a=(i/20)*Math.PI*2;
      const ridge=new THREE.Mesh(new THREE.BoxGeometry(.01,.31,.026),capMaterial);
      ridge.position.set(Math.sin(a)*.222,1.93,Math.cos(a)*.222);
      ridge.rotation.y=a;
      product.add(ridge);
    }
    const bulb=new THREE.Mesh(
      new THREE.SphereGeometry(.22,40,26),
      new THREE.MeshPhysicalMaterial({color:0x10100f,roughness:.54,metalness:.02,clearcoat:.15})
    );
    bulb.scale.y=1.35;
    bulb.position.y=2.27;
    product.add(bulb);

    const labelMaterial=new THREE.MeshStandardMaterial({color:0xefe8d5,roughness:.63,metalness:0});
    const label=new THREE.Mesh(new THREE.CylinderGeometry(.345,.345,.64,64,1,true),labelMaterial);
    label.position.y=.64;
    product.add(label);
    const labelBand=new THREE.Mesh(
      new THREE.CylinderGeometry(.349,.349,.06,64,1,true),
      new THREE.MeshStandardMaterial({color:0x496f3f,roughness:.46})
    );
    labelBand.position.y=.84;
    product.add(labelBand);

    const bottleLabelTexture=makeBrandTexture(true);
    const bottleFace=new THREE.Mesh(
      new THREE.PlaneGeometry(.43,.27),
      new THREE.MeshBasicMaterial({map:bottleLabelTexture,transparent:false})
    );
    bottleFace.position.set(0,.62,.348);
    product.add(bottleFace);

    const collar=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,10,48),brassDetail);
    collar.rotation.x=Math.PI/2;
    collar.position.y=1.51;
    product.add(collar);

    const productGlow=new THREE.PointLight(0xffc46b,0,4.8,2);
    productGlow.position.set(0,.8,.2);
    root.add(productGlow);

    root.traverse(obj=>{
      if(obj.isMesh){obj.castShadow=true;obj.receiveShadow=true;}
    });
    product.traverse(obj=>{if(obj.isMesh)obj.castShadow=true;});
    lightBeam.castShadow=false;
    revealDust.castShadow=false;

    const initialRotation=-Math.PI*.16;
    const finalRotation=(Math.PI*2)-(Math.PI*.16);
    const spinEnd=.68;

    let targetRotation=initialRotation;
    let targetLid=0;
    let targetBottleReveal=0;
    let bottleReveal=0;
    let targetRevealLight=0;
    let targetProductGlow=0;
    let targetHaloScale=1;
    let targetCameraZ=8.72;
    let targetCameraY=1.26;

    root.rotation.y=initialRotation;
    lidPivot.rotation.x=0;

    const resize=()=>{
      const rect=canvas.getBoundingClientRect();
      const w=Math.max(1,rect.width);
      const h=Math.max(1,rect.height);
      const mobile=w<700;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.35:1.65));
      renderer.setSize(w,h,false);
      camera.aspect=w/h;
      camera.updateProjectionMatrix();
      targetCameraZ=mobile?9.72:8.72;
      targetCameraY=mobile?1.08:1.26;
      if(!product.visible){camera.position.z=targetCameraZ;camera.position.y=targetCameraY;}
    };

    resize();

    let raf=0;
    let previousTime=performance.now();
    const render=(now=performance.now())=>{
      const dt=Math.min(.05,Math.max(.001,(now-previousTime)/1000));
      previousTime=now;
      const t=now*.00035;

      root.rotation.y=THREE.MathUtils.damp(root.rotation.y,targetRotation,14.5,dt);
      lidPivot.rotation.x=THREE.MathUtils.damp(lidPivot.rotation.x,targetLid,13.5,dt);
      bottleReveal=THREE.MathUtils.damp(bottleReveal,targetBottleReveal,11.5,dt);
      revealLight.intensity=THREE.MathUtils.damp(revealLight.intensity,targetRevealLight,12,dt);
      productGlow.intensity=THREE.MathUtils.damp(productGlow.intensity,targetProductGlow,11.5,dt);
      const smoothHalo=THREE.MathUtils.damp(halo.scale.x,targetHaloScale,11.5,dt);
      halo.scale.setScalar(smoothHalo);
      innerHalo.scale.setScalar(.96+(smoothHalo-1)*.72);
      camera.position.z=THREE.MathUtils.damp(camera.position.z,targetCameraZ,6.8,dt);
      camera.position.y=THREE.MathUtils.damp(camera.position.y,targetCameraY,6.8,dt);

      dust.rotation.y=t*.1;
      dust.position.y=Math.sin(t*.75)*.035;
      halo.material.opacity=.075+Math.sin(t*2)*.022;
      innerHalo.material.opacity=.038+Math.sin(t*2.35)*.016;
      pedestalRing.material.opacity=.43+Math.sin(t*1.7)*.08;

      const opening=Math.min(1,revealLight.intensity/10);
      glowSprite.material.opacity=.06+.24*opening;
      lightBeam.material.opacity=.025+.115*opening;
      lightBeam.scale.x=lightBeam.scale.z=.82+.2*opening;
      revealDust.material.opacity=.58*bottleReveal;
      revealDust.rotation.y=-t*.85;
      revealDust.position.y=.45+1.25*bottleReveal;
      revealDust.scale.setScalar(.84+.28*bottleReveal);

      product.visible=bottleReveal>.004||targetBottleReveal>.004;
      if(product.visible){
        const bottleScale=.02+(.78*bottleReveal);
        product.scale.setScalar(bottleScale);
        product.rotation.y=.075*Math.sin(t*1.35);
        product.rotation.z=.012*Math.sin(t*.95);
        product.position.y=(-.22)+(2.2*bottleReveal)+(Math.sin(t*2.4)*.028*bottleReveal);
      }

      renderer.render(scene,camera);
      raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);

    const scrollControl=ScrollTrigger.create({
      trigger:section,
      start:'top top',
      end:'+=1800',
      pin:true,
      pinType:'fixed',
      pinSpacing:true,
      anticipatePin:0,
      invalidateOnRefresh:true,
      onUpdate:self=>{
        if(progressRef.current){
          progressRef.current.style.setProperty('--progress',String(self.progress));
          progressRef.current.style.setProperty('--open',String(gsap.utils.clamp(0,1,(self.progress-spinEnd)/(1-spinEnd))));
        }

        const spinProgress=gsap.utils.clamp(0,1,self.progress/spinEnd);
        targetRotation=initialRotation+(finalRotation-initialRotation)*spinProgress;

        const lidProgress=gsap.utils.clamp(0,1,(self.progress-spinEnd)/(1-spinEnd));
        const easedLid=gsap.parseEase('power2.out')(lidProgress);
        targetLid=-Math.PI*.58*easedLid;
        targetRevealLight=11*easedLid;
        targetHaloScale=1+.15*easedLid;

        const bottleProgress=gsap.utils.clamp(0,1,(lidProgress-.38)/.62);
        targetBottleReveal=gsap.parseEase('power3.out')(bottleProgress);
        targetProductGlow=28*targetBottleReveal;

        const mobile=canvas.getBoundingClientRect().width<700;
        const baseZ=mobile?9.72:8.72;
        const baseY=mobile?1.08:1.26;
        targetCameraZ=baseZ-(mobile ? .34 : .52)*targetBottleReveal;
        targetCameraY=baseY+.15*targetBottleReveal;
      }
    });

    const intro=gsap.fromTo(
      root.scale,
      {x:.93,y:.93,z:.93},
      {x:1,y:1,z:1,duration:1.25,ease:'power3.out'}
    );

    window.addEventListener('resize',resize);
    const delayed=window.setTimeout(()=>ScrollTrigger.refresh(),120);

    return()=>{
      window.clearTimeout(delayed);
      window.removeEventListener('resize',resize);
      cancelAnimationFrame(raf);
      scrollControl.kill();
      intro.kill();
      renderer.dispose();
      outerBrandTexture.dispose();
      innerBrandTexture.dispose();
      bottleLabelTexture.dispose();
      glowTexture.dispose();
      dustGeometry.dispose();
      revealDustGeometry.dispose();
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
      <div className={styles.ambientRing} aria-hidden="true"/>
      <div className={styles.botanicalLeft} aria-hidden="true"/>
      <div className={styles.botanicalRight} aria-hidden="true"/>

      <div className={styles.heading}>
        <div className={styles.kicker}><span/>THE SIGNATURE REVEAL<span/></div>
        <h2 id="best-product-title">OUR <em>BEST</em> PRODUCT</h2>
        <p>Scroll slowly. Let the ritual unfold.</p>
      </div>

      <div className={styles.stage}>
        <div className={styles.stageHalo} aria-hidden="true"/>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive 3D Baba Hakeem signature presentation chest"/>
        <div ref={progressRef} className={styles.progress} aria-hidden="true">
          <span>SCROLL TO REVEAL</span>
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
