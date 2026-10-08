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

    const cores=navigator.hardwareConcurrency||4;
    const memory=navigator.deviceMemory||4;
    const lowPower=cores<=4||memory<=4;
    const coarsePointer=window.matchMedia?.('(pointer: coarse)')?.matches??false;
    const mobileGPU=coarsePointer&&window.innerWidth<900;
    const performanceMode=mobileGPU||lowPower;
    const shadowsEnabled=!performanceMode;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobileGPU?1.15:(lowPower?1.2:1.75)));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.22;
    renderer.physicallyCorrectLights=true;
    renderer.shadowMap.enabled=shadowsEnabled;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    canvas.style.willChange='transform';
    canvas.style.transform='translateZ(0)';
    canvas.style.backfaceVisibility='hidden';

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(33,1,.1,100);
    camera.position.set(0,1.26,8.72);

    const root=new THREE.Group();
    root.rotation.x=-0.055;
    scene.add(root);

    const wood=new THREE.MeshPhysicalMaterial({color:0x3a1209,roughness:.22,metalness:.1,clearcoat:.78,clearcoatRoughness:.14});
    const woodDark=new THREE.MeshPhysicalMaterial({color:0x170806,roughness:.27,metalness:.08,clearcoat:.7,clearcoatRoughness:.16});
    const gold=new THREE.MeshPhysicalMaterial({color:0xd0a052,roughness:.12,metalness:.96,clearcoat:.65,clearcoatRoughness:.08});
    const inner=new THREE.MeshStandardMaterial({color:0x090806,roughness:.95,metalness:.01});
    const brassDetail=new THREE.MeshPhysicalMaterial({color:0xe3bb6e,roughness:.12,metalness:.98,clearcoat:.55,clearcoatRoughness:.07});
    const velvet=new THREE.MeshStandardMaterial({color:0x0c2a20,roughness:.99,metalness:0,side:THREE.DoubleSide});
    const trimDark=new THREE.MeshStandardMaterial({color:0x18110d,roughness:.27,metalness:.58});

    const drawSpacedText=(ctx,text,x,y,spacing)=>{
      const chars=[...text];
      const widths=chars.map(ch=>ctx.measureText(ch).width);
      const total=widths.reduce((sum,w)=>sum+w,0)+spacing*(chars.length-1);
      let cursor=x-total/2;
      chars.forEach((ch,i)=>{
        ctx.fillText(ch,cursor+widths[i]/2,y);
        cursor+=widths[i]+spacing;
      });
    };

    const makeBrandTexture=(inside=false)=>{
      const c=document.createElement('canvas');
      c.width=1536;
      c.height=960;
      const sx=c.width/1024;
      const sy=c.height/640;
      const ctx=c.getContext('2d');
      ctx.scale(sx,sy);
      const bg=ctx.createLinearGradient(0,0,1024,640);
      if(inside){bg.addColorStop(0,'#153b2c');bg.addColorStop(1,'#081d16');}
      else{bg.addColorStop(0,'#24100b');bg.addColorStop(.52,'#4a1d10');bg.addColorStop(1,'#130806');}
      ctx.fillStyle=bg;ctx.fillRect(0,0,1024,640);
      ctx.strokeStyle='#e0b967';ctx.lineWidth=16;ctx.strokeRect(36,36,952,568);
      ctx.strokeStyle='rgba(245,216,148,.48)';ctx.lineWidth=2;ctx.strokeRect(62,62,900,516);
      ctx.textAlign='center';ctx.fillStyle='#f0d38e';
      ctx.font='700 170px Georgia';ctx.fillText('BH',512,260);
      ctx.font='700 46px Georgia';drawSpacedText(ctx,'BABA HAKEEM',512,352,7);
      ctx.font='600 24px Arial';ctx.fillStyle='rgba(241,225,186,.9)';drawSpacedText(ctx,'HERBAL PRODUCTS',512,406,4);
      ctx.beginPath();ctx.moveTo(330,465);ctx.lineTo(694,465);ctx.strokeStyle='rgba(224,185,103,.72)';ctx.lineWidth=2;ctx.stroke();
      ctx.font='500 18px Arial';ctx.fillStyle='rgba(236,211,153,.8)';ctx.fillText('TRADITION • BOTANICAL CARE',512,505);
      const texture=new THREE.CanvasTexture(c);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      texture.minFilter=THREE.LinearMipmapLinearFilter;
      texture.magFilter=THREE.LinearFilter;
      texture.generateMipmaps=true;
      texture.needsUpdate=true;
      return texture;
    };

    const makeLidTexture=()=>{
      const c=document.createElement('canvas');
      const size=2048;
      c.width=size;c.height=size;
      const ctx=c.getContext('2d');
      const scale=size/1024;
      ctx.scale(scale,scale);
      const bg=ctx.createRadialGradient(512,400,40,512,512,520);
      bg.addColorStop(0,'#214c3a');bg.addColorStop(.5,'#123326');bg.addColorStop(1,'#06150f');
      ctx.fillStyle=bg;ctx.fillRect(0,0,1024,1024);
      const ring=(radius,width,alpha)=>{ctx.beginPath();ctx.arc(512,512,radius,0,Math.PI*2);ctx.strokeStyle=`rgba(239,204,127,${alpha})`;ctx.lineWidth=width;ctx.stroke();};
      ring(432,16,.98);ring(397,4,.68);ring(350,2,.35);
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='rgba(244,218,158,.82)';ctx.font='600 20px Arial';drawSpacedText(ctx,'THE SIGNATURE COLLECTION',512,316,4.5);
      ctx.fillStyle='#f4dda4';ctx.font='700 72px Georgia';drawSpacedText(ctx,'BABA HAKEEM',512,416,5.5);
      ctx.fillStyle='rgba(242,226,190,.92)';ctx.font='600 25px Arial';drawSpacedText(ctx,'PREMIUM HERBAL CARE',512,480,3.2);
      ctx.beginPath();ctx.moveTo(345,540);ctx.lineTo(679,540);ctx.strokeStyle='rgba(235,194,112,.78)';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#f2d79b';ctx.font='700 116px Georgia';ctx.fillText('BH',512,650);
      ctx.fillStyle='rgba(239,214,158,.82)';ctx.font='500 19px Arial';drawSpacedText(ctx,'TRADITION • PURITY • CRAFT',512,742,2.2);
      ctx.fillStyle='rgba(239,214,158,.55)';ctx.font='500 14px Arial';drawSpacedText(ctx,'EST. IN HERBAL TRADITION',512,792,2);
      const texture=new THREE.CanvasTexture(c);
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      texture.minFilter=THREE.LinearMipmapLinearFilter;
      texture.magFilter=THREE.LinearFilter;
      texture.generateMipmaps=true;
      texture.needsUpdate=true;
      return texture;
    };

    const outerBrandTexture=makeBrandTexture(false);
    const innerBrandTexture=makeLidTexture();

    const body=new THREE.Group();
    root.add(body);
    const bodyShell=new THREE.Mesh(new THREE.CylinderGeometry(1.66,1.79,1.72,8,2,false),wood);bodyShell.position.y=-.15;body.add(bodyShell);
    const innerWell=new THREE.Mesh(new THREE.CylinderGeometry(1.34,1.43,1.14,8,1,false),inner);innerWell.position.y=.18;body.add(innerWell);
    const bottomBand=new THREE.Mesh(new THREE.CylinderGeometry(1.86,1.91,.16,8),gold);bottomBand.position.y=-1.01;body.add(bottomBand);
    const topBand=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.8,.13,8),gold);topBand.position.y=.69;body.add(topBand);
    const midBand=new THREE.Mesh(new THREE.CylinderGeometry(1.81,1.83,.052,8),brassDetail);midBand.position.y=-.46;body.add(midBand);
    const panelRing=new THREE.Mesh(new THREE.CylinderGeometry(1.795,1.795,.93,8,1,true),new THREE.MeshStandardMaterial({color:0x542014,roughness:.27,metalness:.1,side:THREE.DoubleSide}));panelRing.position.y=.07;body.add(panelRing);

    const octagon=(radius,y,material,tube=.018)=>{const points=[];for(let i=0;i<=8;i++){const a=(i/8)*Math.PI*2;points.push(new THREE.Vector3(Math.sin(a)*radius,y,Math.cos(a)*radius));}return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,tube,7,false),material);};
    body.add(octagon(1.67,.695,brassDetail,.025));
    body.add(octagon(1.765,-.91,brassDetail,.019));
    for(let i=0;i<8;i++){
      const angle=(i+.5)*Math.PI/4;
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.56,.8,.025),trimDark);panel.position.set(Math.sin(angle)*1.7,-.05,Math.cos(angle)*1.7);panel.rotation.y=angle;body.add(panel);
      const topLine=new THREE.Mesh(new THREE.BoxGeometry(.44,.014,.035),brassDetail);topLine.position.set(Math.sin(angle)*1.73,.3,Math.cos(angle)*1.73);topLine.rotation.y=angle;body.add(topLine);
      const bottomLine=new THREE.Mesh(new THREE.BoxGeometry(.44,.014,.035),brassDetail);bottomLine.position.set(Math.sin(angle)*1.73,-.38,Math.cos(angle)*1.73);bottomLine.rotation.y=angle;body.add(bottomLine);
      const jewel=new THREE.Mesh(new THREE.OctahedronGeometry(.05),brassDetail);jewel.position.set(Math.sin(angle)*1.75,.02,Math.cos(angle)*1.75);body.add(jewel);
    }
    const velvetBase=new THREE.Mesh(new THREE.CylinderGeometry(1.28,1.31,.09,8),velvet);velvetBase.position.y=.66;body.add(velvetBase);body.add(octagon(1.355,.735,brassDetail,.036));
    const innerNest=new THREE.Mesh(new THREE.TorusGeometry(.73,.19,18,64),velvet);innerNest.rotation.x=Math.PI/2;innerNest.position.y=.735;body.add(innerNest);
    const frontPlaqueBase=new THREE.Mesh(new THREE.BoxGeometry(.94,.58,.055),gold);frontPlaqueBase.position.set(0,.02,1.81);body.add(frontPlaqueBase);
    const frontPlaque=new THREE.Mesh(new THREE.PlaneGeometry(.87,.51),new THREE.MeshBasicMaterial({map:outerBrandTexture,toneMapped:false}));frontPlaque.position.set(0,.02,1.842);body.add(frontPlaque);
    for(let i=0;i<8;i++){const a=(i/8)*Math.PI*2;const stud=new THREE.Mesh(new THREE.SphereGeometry(.058,16,16),brassDetail);stud.position.set(Math.cos(a)*1.82,-.54,Math.sin(a)*1.82);body.add(stud);const foot=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.18,16),gold);foot.position.set(Math.cos(a)*1.38,-1.12,Math.sin(a)*1.38);body.add(foot);}

    const lidPivot=new THREE.Group();lidPivot.position.set(0,.81,-1.36);root.add(lidPivot);
    const lid=new THREE.Group();lid.position.set(0,.31,1.36);lidPivot.add(lid);
    const lidBase=new THREE.Mesh(new THREE.CylinderGeometry(1.78,1.78,.42,8),wood);lid.add(lidBase);
    const lidTop=new THREE.Mesh(new THREE.CylinderGeometry(1.57,1.74,.44,8),woodDark);lidTop.position.y=.34;lid.add(lidTop);
    const lidBand=new THREE.Mesh(new THREE.CylinderGeometry(1.83,1.83,.09,8),gold);lidBand.position.y=-.16;lid.add(lidBand);
    const lidCrown=new THREE.Mesh(new THREE.CylinderGeometry(1.63,1.63,.07,8),brassDetail);lidCrown.position.y=.58;lid.add(lidCrown);
    lid.add(octagon(1.56,.63,brassDetail,.024));
    const lidMedallion=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.045,48),gold);lidMedallion.position.y=.64;lid.add(lidMedallion);
    const medallionInset=new THREE.Mesh(new THREE.TorusGeometry(.27,.022,12,48),trimDark);medallionInset.rotation.x=Math.PI/2;medallionInset.position.y=.672;lid.add(medallionInset);
    const botanicalMark=new THREE.Mesh(new THREE.OctahedronGeometry(.085,1),velvet);botanicalMark.position.y=.695;lid.add(botanicalMark);

    const lidInsert=new THREE.Group();
    lidInsert.position.y=-.226;lidInsert.rotation.x=-Math.PI/2;lidInsert.rotation.z=Math.PI;
    const insertBacking=new THREE.Mesh(new THREE.CircleGeometry(1.32,96),new THREE.MeshPhysicalMaterial({color:0xd2a55b,metalness:.95,roughness:.12,clearcoat:.55,clearcoatRoughness:.08,side:THREE.DoubleSide}));insertBacking.position.z=-.016;lidInsert.add(insertBacking);
    const insertVelvet=new THREE.Mesh(new THREE.CircleGeometry(1.27,96),new THREE.MeshStandardMaterial({color:0x09251b,roughness:.98,metalness:0,side:THREE.DoubleSide}));insertVelvet.position.z=-.008;lidInsert.add(insertVelvet);
    const lidInside=new THREE.Mesh(new THREE.CircleGeometry(1.205,96),new THREE.MeshBasicMaterial({map:innerBrandTexture,side:THREE.DoubleSide,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));lidInside.position.z=.012;lidInsert.add(lidInside);
    const insertRing=new THREE.Mesh(new THREE.RingGeometry(1.22,1.255,96),new THREE.MeshBasicMaterial({color:0xf0ca79,side:THREE.DoubleSide,toneMapped:false}));insertRing.position.z=.018;lidInsert.add(insertRing);
    const insertInnerRing=new THREE.Mesh(new THREE.RingGeometry(1.135,1.145,96),new THREE.MeshBasicMaterial({color:0xb9853f,side:THREE.DoubleSide,transparent:true,opacity:.9,toneMapped:false}));insertInnerRing.position.z=.02;lidInsert.add(insertInnerRing);
    lid.add(lidInsert);lid.add(octagon(1.36,-.246,brassDetail,.028));

    const latch=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.13),gold);latch.position.set(0,-.02,1.79);lid.add(latch);
    const latchGem=new THREE.Mesh(new THREE.OctahedronGeometry(.09),velvet);latchGem.position.set(0,-.02,1.865);lid.add(latchGem);
    const latchBase=new THREE.Mesh(new THREE.BoxGeometry(.38,.22,.13),gold);latchBase.position.set(0,.62,1.8);body.add(latchBase);

    const edgeMaterial=new THREE.LineBasicMaterial({color:0xd1a355,transparent:true,opacity:.72});
    [bodyShell,topBand,bottomBand,lidBase,lidTop].forEach(mesh=>{const edges=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),edgeMaterial);edges.position.copy(mesh.position);edges.rotation.copy(mesh.rotation);if(mesh.parent===body) body.add(edges);else lid.add(edges);});

    const floor=new THREE.Mesh(new THREE.CircleGeometry(3.45,72),new THREE.MeshStandardMaterial({color:0x080a08,roughness:.9,metalness:.03}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.205;floor.receiveShadow=shadowsEnabled;scene.add(floor);
    const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(2.28,2.58,.12,72),new THREE.MeshPhysicalMaterial({color:0x110d09,roughness:.23,metalness:.72,clearcoat:.5,clearcoatRoughness:.1}));pedestal.position.y=-1.14;pedestal.receiveShadow=shadowsEnabled;scene.add(pedestal);
    const pedestalRing=new THREE.Mesh(new THREE.TorusGeometry(2.3,.022,10,72),new THREE.MeshBasicMaterial({color:0xc7964d,transparent:true,opacity:.62}));pedestalRing.rotation.x=Math.PI/2;pedestalRing.position.y=-1.065;scene.add(pedestalRing);
    const contactShadow=new THREE.Mesh(new THREE.CircleGeometry(1.7,64),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.46,depthWrite:false}));contactShadow.rotation.x=-Math.PI/2;contactShadow.position.y=-1.055;contactShadow.scale.set(1.35,.52,1);scene.add(contactShadow);

    const ambient=new THREE.HemisphereLight(0xf6dfba,0x04100b,.9);scene.add(ambient);
    const key=new THREE.SpotLight(0xffdba2,84,18,Math.PI/5,.56,1.4);key.position.set(-4.4,6.3,5.4);key.target.position.set(0,.1,0);key.castShadow=shadowsEnabled;if(shadowsEnabled){key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.00035;}scene.add(key,key.target);
    const rim=new THREE.SpotLight(0xe39a50,56,15,Math.PI/4,.68,1.45);rim.position.set(4.6,3.9,-4.8);rim.target.position.set(0,.45,0);scene.add(rim,rim.target);
    const emeraldRim=new THREE.PointLight(0x3d7354,18,7,2);emeraldRim.position.set(-3.2,.8,-2.2);scene.add(emeraldRim);
    const soft=new THREE.PointLight(0xffe8c0,16,9,2);soft.position.set(0,2.3,4.1);scene.add(soft);
    const lidAccent=new THREE.SpotLight(0xffedc6,30,9,Math.PI/6,.5,1.35);lidAccent.position.set(0,3.5,4.25);lidAccent.target.position.set(0,1.35,-.15);scene.add(lidAccent,lidAccent.target);
    const revealLight=new THREE.PointLight(0xffd89b,0,5.4,2);revealLight.position.set(0,1.08,.08);root.add(revealLight);

    const halo=new THREE.Mesh(new THREE.RingGeometry(2.05,2.82,72),new THREE.MeshBasicMaterial({color:0xc58b4c,transparent:true,opacity:.085,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));halo.rotation.x=-Math.PI/2;halo.position.y=-1.045;scene.add(halo);
    const innerHalo=new THREE.Mesh(new THREE.RingGeometry(1.34,1.82,72),new THREE.MeshBasicMaterial({color:0xefd191,transparent:true,opacity:.045,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));innerHalo.rotation.x=-Math.PI/2;innerHalo.position.y=-1.04;scene.add(innerHalo);
    const glowCanvas=document.createElement('canvas');glowCanvas.width=256;glowCanvas.height=256;const gctx=glowCanvas.getContext('2d');const gg=gctx.createRadialGradient(128,128,0,128,128,128);gg.addColorStop(0,'rgba(255,229,178,.95)');gg.addColorStop(.25,'rgba(225,168,85,.5)');gg.addColorStop(.68,'rgba(128,79,28,.1)');gg.addColorStop(1,'rgba(0,0,0,0)');gctx.fillStyle=gg;gctx.fillRect(0,0,256,256);
    const glowTexture=new THREE.CanvasTexture(glowCanvas);const glowSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));glowSprite.scale.set(5.1,5.1,1);glowSprite.position.set(0,1.25,-.65);scene.add(glowSprite);
    const lightBeam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,.22,3.6,performanceMode?16:36,1,true),new THREE.MeshBasicMaterial({color:0xe9b766,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));lightBeam.position.set(0,2.2,.03);root.add(lightBeam);

    const dustCount=performanceMode?24:80;
    const dustGeometry=new THREE.BufferGeometry();const dustPositions=new Float32Array(dustCount*3);for(let i=0;i<dustCount;i++){const a=i*2.39996323;const r=2.2+(i%15)*.15;dustPositions[i*3]=Math.cos(a)*r;dustPositions[i*3+1]=-.6+(i%21)*.16;dustPositions[i*3+2]=Math.sin(a)*r;}dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
    const dustMaterial=new THREE.PointsMaterial({color:0xe5bd79,size:.018,transparent:true,opacity:performanceMode?.18:.28,depthWrite:false,blending:THREE.AdditiveBlending});const dust=new THREE.Points(dustGeometry,dustMaterial);scene.add(dust);
    const revealCount=performanceMode?20:56;
    const revealDustGeometry=new THREE.BufferGeometry();const revealDustPositions=new Float32Array(revealCount*3);for(let i=0;i<revealCount;i++){const a=i*2.12;const r=.18+(i%9)*.055;revealDustPositions[i*3]=Math.cos(a)*r;revealDustPositions[i*3+1]=(i%16)*.11;revealDustPositions[i*3+2]=Math.sin(a)*r;}revealDustGeometry.setAttribute('position',new THREE.BufferAttribute(revealDustPositions,3));
    const revealDustMaterial=new THREE.PointsMaterial({color:0xffd990,size:.024,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const revealDust=new THREE.Points(revealDustGeometry,revealDustMaterial);revealDust.position.set(0,.55,.08);root.add(revealDust);

    const product=new THREE.Group();product.position.set(.18,-.22,.18);product.scale.setScalar(.02);product.visible=false;root.add(product);
    let productImage=null;
    const productTexture=new THREE.TextureLoader().load('/products/mens-oil-new.png',(texture)=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
      texture.minFilter=THREE.LinearFilter;
      texture.magFilter=THREE.LinearFilter;
      texture.generateMipmaps=false;
      texture.needsUpdate=true;
      const image=texture.image;
      if(productImage&&image?.width&&image?.height){
        const height=3.45;
        productImage.scale.set(height*(image.width/image.height),height,1);
      }
    });
    productTexture.colorSpace=THREE.SRGBColorSpace;
    productTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
    productTexture.minFilter=THREE.LinearFilter;
    productTexture.magFilter=THREE.LinearFilter;
    productTexture.generateMipmaps=false;
    const productImageMaterial=new THREE.SpriteMaterial({map:productTexture,transparent:true,alphaTest:.01,depthWrite:false,toneMapped:false});
    productImage=new THREE.Sprite(productImageMaterial);productImage.scale.set(1.45,3.45,1);productImage.position.y=1.33;product.add(productImage);
    const productGlow=new THREE.PointLight(0xffc46b,0,5.2,2);productGlow.position.set(0,1.05,.35);root.add(productGlow);

    root.traverse(obj=>{if(obj.isMesh){obj.castShadow=shadowsEnabled;obj.receiveShadow=shadowsEnabled;}});lightBeam.castShadow=false;revealDust.castShadow=false;lidInside.castShadow=false;lidInside.receiveShadow=false;productImage.castShadow=false;productImage.receiveShadow=false;

    const initialRotation=-Math.PI*.16;const finalRotation=(Math.PI*2)-(Math.PI*.16);const spinEnd=.68;
    let targetRotation=initialRotation;let targetLid=0;let targetBottleReveal=0;let bottleReveal=0;let targetRevealLight=0;let targetProductGlow=0;let targetHaloScale=1;let targetCameraZ=8.72;let targetCameraY=1.26;let scrollTarget=0;let scrollProgress=0;
    root.rotation.y=initialRotation;lidPivot.rotation.x=0;

    const resize=()=>{const rect=canvas.getBoundingClientRect();const w=Math.max(1,rect.width);const h=Math.max(1,rect.height);const mobile=w<700;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobileGPU?1.15:(lowPower?1.2:(mobile?1.25:1.75))));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();targetCameraZ=mobile?9.72:8.72;targetCameraY=mobile?1.08:1.26;if(!product.visible){camera.position.z=targetCameraZ;camera.position.y=targetCameraY;}};
    resize();

    let raf=0;let previousTime=performance.now();let sectionVisible=true;
    const observer=new IntersectionObserver(entries=>{sectionVisible=entries[0]?.isIntersecting??true;},{rootMargin:'200px 0px'});observer.observe(section);
    const render=(now=performance.now())=>{const dt=Math.min(.04,Math.max(.001,(now-previousTime)/1000));previousTime=now;if(document.hidden||!sectionVisible){raf=requestAnimationFrame(render);return;}const t=now*.00035;
      scrollProgress=THREE.MathUtils.damp(scrollProgress,scrollTarget,7.2,dt);
      if(progressRef.current){progressRef.current.style.setProperty('--progress',String(scrollProgress));progressRef.current.style.setProperty('--open',String(gsap.utils.clamp(0,1,(scrollProgress-spinEnd)/(1-spinEnd))));}
      const spinProgress=gsap.utils.clamp(0,1,scrollProgress/spinEnd);targetRotation=initialRotation+(finalRotation-initialRotation)*spinProgress;
      const lidProgress=gsap.utils.clamp(0,1,(scrollProgress-spinEnd)/(1-spinEnd));const easedLid=gsap.parseEase('power3.out')(lidProgress);targetLid=-Math.PI*.58*easedLid;targetRevealLight=10.5*easedLid;targetHaloScale=1+.15*easedLid;
      const bottleProgress=gsap.utils.clamp(0,1,(lidProgress-.24)/.76);targetBottleReveal=gsap.parseEase('power4.out')(bottleProgress);targetProductGlow=28*targetBottleReveal;
      const mobile=canvas.clientWidth<700;const baseZ=mobile?9.72:8.72;const baseY=mobile?1.08:1.26;targetCameraZ=baseZ-(mobile?.36:.58)*targetBottleReveal;targetCameraY=baseY+.16*targetBottleReveal;
      root.rotation.y=THREE.MathUtils.damp(root.rotation.y,targetRotation,12.5,dt);lidPivot.rotation.x=THREE.MathUtils.damp(lidPivot.rotation.x,targetLid,10.8,dt);bottleReveal=THREE.MathUtils.damp(bottleReveal,targetBottleReveal,8.8,dt);revealLight.intensity=THREE.MathUtils.damp(revealLight.intensity,targetRevealLight,9.4,dt);productGlow.intensity=THREE.MathUtils.damp(productGlow.intensity,targetProductGlow,8.8,dt);const smoothHalo=THREE.MathUtils.damp(halo.scale.x,targetHaloScale,9,dt);halo.scale.setScalar(smoothHalo);innerHalo.scale.setScalar(.96+(smoothHalo-1)*.72);camera.position.z=THREE.MathUtils.damp(camera.position.z,targetCameraZ,6.4,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,targetCameraY,6.4,dt);
      if(!performanceMode){dust.rotation.y=t*.06;dust.position.y=Math.sin(t*.45)*.02;}const opening=Math.min(1,revealLight.intensity/10);glowSprite.material.opacity=.018+.085*opening;lightBeam.material.opacity=.006+.032*opening;lightBeam.scale.x=lightBeam.scale.z=.82+.2*opening;revealDust.material.opacity=(performanceMode?.12:.2)*bottleReveal;revealDust.rotation.y=-t*.35;revealDust.position.y=.45+1.1*bottleReveal;revealDust.scale.setScalar(.84+.28*bottleReveal);
      product.visible=bottleReveal>.004||targetBottleReveal>.004;if(product.visible){const bottleScale=.02+(.98*bottleReveal);product.scale.setScalar(bottleScale);product.position.y=(-.22)+(1.1*bottleReveal);product.position.z=.18+(.16*bottleReveal);productImageMaterial.rotation=0;}renderer.render(scene,camera);raf=requestAnimationFrame(render);};
    raf=requestAnimationFrame(render);

    const scrollControl=ScrollTrigger.create({trigger:section,start:'top top',end:'+=2600',pin:true,pinType:mobileGPU?'transform':'fixed',pinSpacing:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:self=>{scrollTarget=self.progress;}});

    const intro=gsap.fromTo(root.scale,{x:.93,y:.93,z:.93},{x:1,y:1,z:1,duration:1.25,ease:'power3.out'});
    window.addEventListener('resize',resize);const delayed=window.setTimeout(()=>ScrollTrigger.refresh(),120);
    return()=>{window.clearTimeout(delayed);window.removeEventListener('resize',resize);observer.disconnect();cancelAnimationFrame(raf);scrollControl.kill();intro.kill();renderer.dispose();outerBrandTexture.dispose();innerBrandTexture.dispose();productTexture.dispose();glowTexture.dispose();dustGeometry.dispose();revealDustGeometry.dispose();scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose?.();if(obj.material){const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose?.());}});};
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
        <div ref={progressRef} className={styles.progress} aria-hidden="true"><span>SCROLL TO REVEAL</span><div><i/></div><b>360°</b></div>
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
